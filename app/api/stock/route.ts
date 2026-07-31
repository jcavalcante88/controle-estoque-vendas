import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkAcesso } from '@/lib/acesso';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const acesso = await checkAcesso(session.user.id);
  if (!acesso.liberado) return NextResponse.json({ error: 'Assinatura inativa' }, { status: 402 });

  const movements = await prisma.stockMovement.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { product: { select: { nome: true } } },
  });

  return NextResponse.json(movements);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const acesso = await checkAcesso(session.user.id);
  if (!acesso.liberado) return NextResponse.json({ error: 'Assinatura inativa' }, { status: 402 });

  const body = await req.json();
  const { productId, tipo, qty, motivo } = body as {
    productId: string;
    tipo: string;
    qty: number;
    motivo?: string;
  };

  if (!productId || !tipo || !qty || qty <= 0) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
  }

  if (!['entrada', 'saida', 'ajuste'].includes(tipo)) {
    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.userId !== session.user.id) {
    return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
  }

  if (tipo === 'saida' && product.estoque < qty) {
    return NextResponse.json({ error: `Estoque insuficiente. Disponível: ${product.estoque}` }, { status: 422 });
  }

  const userId = session.user!.id as string;

  const movement = await prisma.$transaction(async (tx) => {
    const mov = await tx.stockMovement.create({
      data: { userId, productId, tipo, qty, motivo: motivo || null },
      include: { product: { select: { nome: true } } },
    });

    const delta = tipo === 'entrada' ? qty : tipo === 'saida' ? -qty : 0;
    if (tipo !== 'ajuste') {
      await tx.product.update({
        where: { id: productId },
        data: { estoque: { increment: delta } },
      });
    } else {
      // ajuste define o estoque absoluto
      await tx.product.update({
        where: { id: productId },
        data: { estoque: qty },
      });
    }

    return mov;
  });

  return NextResponse.json(movement, { status: 201 });
}
