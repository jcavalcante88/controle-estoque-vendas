'use client';

import Link from 'next/link';
import { Package, DollarSign, TrendingUp, AlertTriangle, Clock } from 'lucide-react';

interface Props {
  totalProdutos: number; valorEstoque: number; vendasHoje: number; vendasMes: number;
  produtosBaixo: { id: string; nome: string; estoque: number; minimo: number }[];
  vendasRecentes: { id: string; total: number; createdAt: string; itens: number }[];
  statusAssinatura?: { status: string; diasRestantesTrial: number | null };
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtData = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

export function VisaoGeralClient({ totalProdutos, valorEstoque, vendasHoje, vendasMes, produtosBaixo, vendasRecentes, statusAssinatura }: Props) {
  const cards = [
    { label: 'Produtos', value: String(totalProdutos), icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { label: 'Valor em estoque', value: fmt(valorEstoque), icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
    { label: 'Vendas hoje', value: fmt(vendasHoje), icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Vendas este mês', value: fmt(vendasMes), icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Visão Geral</h1>
        <p className="text-sm text-white/40">Resumo do seu negócio hoje</p>
      </div>

      {statusAssinatura?.status === 'trialing' && statusAssinatura.diasRestantesTrial !== null && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-amber-400" />
            <div>
              <p className="text-white font-medium">
                {statusAssinatura.diasRestantesTrial} {statusAssinatura.diasRestantesTrial === 1 ? 'dia' : 'dias'} de trial restantes
              </p>
              <p className="text-sm text-white/60">Assine para continuar usando após o trial</p>
            </div>
          </div>
          <form method="POST" action="/api/stripe/checkout">
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition text-sm font-semibold"
            >
              Assinar agora
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="glass-card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 border ${bg}`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-white/40 mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <AlertTriangle size={17} className="text-amber-400" /> Estoque Baixo
            </h2>
            <Link href="/dashboard/estoque" className="text-xs text-amber-400 hover:text-amber-300">Ver tudo →</Link>
          </div>
          {produtosBaixo.length === 0 ? (
            <p className="text-sm text-white/30 text-center py-6">Nenhum produto com estoque baixo 🎉</p>
          ) : (
            <ul className="space-y-2">
              {produtosBaixo.slice(0, 6).map((p) => (
                <li key={p.id} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-sm text-white/80">{p.nome}</span>
                  <span className="text-sm font-medium text-red-400">{p.estoque}/{p.minimo} min</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-white">Vendas Recentes</h2>
            <Link href="/dashboard/vendas" className="text-xs text-amber-400 hover:text-amber-300">Ver tudo →</Link>
          </div>
          {vendasRecentes.length === 0 ? (
            <p className="text-sm text-white/30 text-center py-6">Nenhuma venda registrada ainda</p>
          ) : (
            <ul className="space-y-2">
              {vendasRecentes.map((v) => (
                <li key={v.id} className="flex justify-between py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-sm text-white/80">{v.itens} {v.itens === 1 ? 'item' : 'itens'}</p>
                    <p className="text-xs text-white/30">{fmtData(v.createdAt)}</p>
                  </div>
                  <span className="text-sm font-semibold text-green-400">{fmt(v.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
