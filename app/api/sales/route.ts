import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkAcesso } from '@/lib/acesso';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const acesso = await checkAcesso(session.user.id);
  if (!acesso.liberado) return NextResponse.json({ error: 'Assinatura inativa' }, { status: 402 });

  const sales = await prisma.sale.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { product: { select: { nome: true } } } } },
  });

  return NextResponse.json(sales);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const acesso = await checkAcesso(session.user.id);
  if (!acesso.liberado) return NextResponse.json({ error: 'Assinatura inativa' }, { status: 402 });

  const body = await req.json();
  const { items } = body as { items: { productId: string; qty: number; price: number }[] };

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'Nenhum item na venda' }, { status: 400 });
  }

  // Verificar produtos do usuário e estoque suficiente
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, userId: session.user.id },
  });

  if (products.length !== productIds.length) {
    return NextResponse.json({ error: 'Um ou mais produtos não encontrados' }, { status: 404 });
  }

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)!;
    if (product.estoque < item.qty) {
      return NextResponse.json({ error: `Estoque insuficiente para "${product.nome}"` }, { status: 422 });
    }
  }

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const userId = session.user!.id as string;

  // Criar venda e baixar estoque numa transação
  const sale = await prisma.$transaction(async (tx) => {
    const created = await tx.sale.create({
      data: {
        userId,
        total,
        items: {
          create: items.map((i) => ({ productId: i.productId, qty: i.qty, price: i.price })),
        },
      },
      include: { items: { include: { product: { select: { nome: true } } } } },
    });

    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { estoque: { decrement: item.qty } },
      });
    }

    return created;
  });

  return NextResponse.json(sale, { status: 201 });
}
