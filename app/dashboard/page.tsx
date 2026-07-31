import { auth } from '@/lib/auth';
import { checkAcesso } from '@/lib/acesso';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { VisaoGeralClient } from './visao-geral-client';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const acesso = await checkAcesso(session.user.id);
  if (!acesso.liberado) {
    return <AssinaturaWall motivo={acesso.motivo} />;
  }

  const userId = session.user.id;
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  const agora = new Date();
  const inicioDia = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);

  const [produtos, vendasHoje, vendasMes, vendasRecentes] = await Promise.all([
    prisma.product.findMany({ where: { userId } }),
    prisma.sale.aggregate({
      where: { userId, createdAt: { gte: inicioDia } },
      _sum: { total: true },
    }),
    prisma.sale.aggregate({
      where: { userId, createdAt: { gte: inicioMes } },
      _sum: { total: true },
    }),
    prisma.sale.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { items: { include: { product: true } } },
    }),
  ]);

  const totalEstoque = produtos.reduce((s, p) => s + p.custo * p.estoque, 0);
  const produtosBaixo = produtos.filter((p) => p.estoque <= p.minimo);

  const diasRestantesTrial = sub?.status === 'trialing' && sub.trialEndsAt
    ? Math.ceil((sub.trialEndsAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <VisaoGeralClient
      totalProdutos={produtos.length}
      valorEstoque={totalEstoque}
      vendasHoje={vendasHoje._sum.total ?? 0}
      vendasMes={vendasMes._sum.total ?? 0}
      produtosBaixo={produtosBaixo.map((p) => ({ id: p.id, nome: p.nome, estoque: p.estoque, minimo: p.minimo }))}
      vendasRecentes={vendasRecentes.map((v) => ({
        id: v.id,
        total: v.total,
        createdAt: v.createdAt.toISOString(),
        itens: v.items.length,
      }))}
      statusAssinatura={{
        status: sub?.status ?? 'sem_assinatura',
        diasRestantesTrial,
      }}
    />
  );
}

function AssinaturaWall({ motivo }: { motivo: string }) {
  const msgs: Record<string, { titulo: string; desc: string }> = {
    trial_expirado: { titulo: 'Seu trial expirou', desc: 'Assine para continuar usando o Chaveiro Pro.' },
    pagamento_pendente: { titulo: 'Pagamento pendente', desc: 'Regularize seu pagamento para reativar o acesso.' },
    cancelado: { titulo: 'Assinatura cancelada', desc: 'Reative sua assinatura para voltar a usar o sistema.' },
    sem_assinatura: { titulo: 'Sem assinatura', desc: 'Crie uma assinatura para começar a usar o sistema.' },
  };
  const info = msgs[motivo] ?? { titulo: 'Acesso bloqueado', desc: 'Entre em contato com o suporte.' };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
      <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-3xl">🔒</div>
      <h2 className="text-2xl font-bold text-gray-900">{info.titulo}</h2>
      <p className="text-gray-600 max-w-sm">{info.desc}</p>
      <form method="POST" action="/api/stripe/checkout">
        <button
          type="submit"
          className="mt-2 inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 font-bold rounded-lg hover:from-amber-500 hover:to-amber-600 transition"
        >
          Assinar agora →
        </button>
      </form>
    </div>
  );
}
