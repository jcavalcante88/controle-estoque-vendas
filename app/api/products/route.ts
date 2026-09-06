import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkAcesso } from "@/lib/acesso";

// IMPORTANTE: toda consulta usa "where: { userId }" — isso é o que garante
// que o cliente A nunca veja os produtos do cliente B. É a base do multi-cliente.

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const acesso = await checkAcesso(session.user.id);
  if (!acesso.liberado) {
    return NextResponse.json({ error: "Assinatura inativa", motivo: acesso.motivo }, { status: 402 });
  }

  // ?arquivados=1 lista só os arquivados (tela de produtos, para restaurar)
  const { searchParams } = new URL(req.url);
  const arquivados = searchParams.get("arquivados") === "1";

  const products = await prisma.product.findMany({
    where: {
      userId: session.user.id,
      arquivadoEm: arquivados ? { not: null } : null,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const acesso = await checkAcesso(session.user.id);
  if (!acesso.liberado) {
    return NextResponse.json({ error: "Assinatura inativa", motivo: acesso.motivo }, { status: 402 });
  }

  const body = await req.json();
  const product = await prisma.product.create({
    data: {
      userId: session.user.id,
      nome: body.nome,
      categoria: body.categoria || "Geral",
      custo: Number(body.custo) || 0,
      preco: Number(body.preco) || 0,
      estoque: Number(body.estoque) || 0,
      minimo: Number(body.minimo) || 0,
    },
  });
  return NextResponse.json(product, { status: 201 });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const acesso = await checkAcesso(session.user.id);
  if (!acesso.liberado) {
    return NextResponse.json({ error: "Assinatura inativa", motivo: acesso.motivo }, { status: 402 });
  }

  const body = await req.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "ID do produto é obrigatório" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.userId !== session.user.id) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }

  // Tirar um produto do arquivo e devolver para o catálogo
  if (body.restaurar) {
    const restaurado = await prisma.product.update({
      where: { id },
      data: { arquivadoEm: null },
    });
    return NextResponse.json(restaurado);
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      nome: body.nome || product.nome,
      categoria: body.categoria || product.categoria,
      custo: body.custo !== undefined ? Number(body.custo) : product.custo,
      preco: body.preco !== undefined ? Number(body.preco) : product.preco,
      estoque: body.estoque !== undefined ? Number(body.estoque) : product.estoque,
      minimo: body.minimo !== undefined ? Number(body.minimo) : product.minimo,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const acesso = await checkAcesso(session.user.id);
  if (!acesso.liberado) {
    return NextResponse.json({ error: "Assinatura inativa", motivo: acesso.motivo }, { status: 402 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID do produto é obrigatório" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: { _count: { select: { saleItems: true, stockMovements: true } } },
  });

  if (!product || product.userId !== session.user.id) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }

  // Produto que já apareceu em venda ou movimentação não pode ser apagado:
  // isso apagaria linhas do histórico e mudaria relatórios e recibos já emitidos.
  // Nesse caso ele é arquivado — some do catálogo, mas o passado continua íntegro.
  const temHistorico = product._count.saleItems > 0 || product._count.stockMovements > 0;

  if (temHistorico) {
    if (product.arquivadoEm) {
      return NextResponse.json({ arquivado: true, jaArquivado: true });
    }

    await prisma.product.update({
      where: { id },
      data: { arquivadoEm: new Date() },
    });

    return NextResponse.json({
      arquivado: true,
      vendas: product._count.saleItems,
      movimentacoes: product._count.stockMovements,
    });
  }

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (error) {
    // Rede de segurança: se o produto ganhou histórico entre a contagem e o delete,
    // o Postgres barra por foreign key (P2003) — nesse caso arquivamos.
    if ((error as { code?: string }).code === "P2003") {
      await prisma.product.update({ where: { id }, data: { arquivadoEm: new Date() } });
      return NextResponse.json({ arquivado: true });
    }
    throw error;
  }
}
