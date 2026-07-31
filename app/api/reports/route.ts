import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkAcesso } from '@/lib/acesso';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const acesso = await checkAcesso(session.user.id);
  if (!acesso.liberado) return NextResponse.json({ error: 'Assinatura inativa' }, { status: 402 });

  const { searchParams } = new URL(req.url);
  const dias = Number(searchParams.get('dias') ?? '7');

  const inicio = new Date();
  inicio.setDate(inicio.getDate() - dias);
  inicio.setHours(0, 0, 0, 0);

  const userId = session.user.id;

  const [sales, products] = await Promise.all([
    prisma.sale.findMany({
      where: { userId, createdAt: { gte: inicio } },
      orderBy: { createdAt: 'asc' },
      include: { items: { include: { product: { select: { nome: true } } } } },
    }),
    prisma.product.findMany({ where: { userId } }),
  ]);

  // Vendas por dia
  const porDiaMap = new Map<string, { total: number; qtd: number }>();
  for (const sale of sales) {
    const dia = sale.createdAt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const prev = porDiaMap.get(dia) ?? { total: 0, qtd: 0 };
    porDiaMap.set(dia, { total: prev.total + sale.total, qtd: prev.qtd + 1 });
  }
  const vendasPorDia = Array.from(porDiaMap.entries()).map(([data, v]) => ({ data, ...v }));

  // Estoque por categoria
  const catMap = new Map<string, { qtd: number; valor: number }>();
  for (const p of products) {
    const prev = catMap.get(p.categoria) ?? { qtd: 0, valor: 0 };
    catMap.set(p.categoria, { qtd: prev.qtd + p.estoque, valor: prev.valor + p.custo * p.estoque });
  }
  const estoquePorCategoria = Array.from(catMap.entries())
    .map(([categoria, v]) => ({ categoria, ...v }))
    .sort((a, b) => b.qtd - a.qtd);

  // Top produtos
  const prodMap = new Map<string, { nome: string; totalVendido: number; receita: number }>();
  for (const sale of sales) {
    for (const item of sale.items) {
      const key = item.product.nome;
      const prev = prodMap.get(key) ?? { nome: key, totalVendido: 0, receita: 0 };
      prodMap.set(key, {
        nome: key,
        totalVendido: prev.totalVendido + item.qty,
        receita: prev.receita + item.price * item.qty,
      });
    }
  }
  const topProdutos = Array.from(prodMap.values())
    .sort((a, b) => b.totalVendido - a.totalVendido)
    .slice(0, 10);

  const receitaTotal = sales.reduce((s, v) => s + v.total, 0);

  return NextResponse.json({
    vendasPorDia,
    estoquePorCategoria,
    topProdutos,
    resumo: {
      totalVendas: sales.length,
      receitaTotal,
      ticketMedio: sales.length > 0 ? receitaTotal / sales.length : 0,
    },
  });
}
