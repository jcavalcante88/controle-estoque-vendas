'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Package } from 'lucide-react';

interface ReportData {
  vendasPorDia: { data: string; total: number; qtd: number }[];
  estoquePorCategoria: { categoria: string; qtd: number; valor: number }[];
  topProdutos: { nome: string; totalVendido: number; receita: number }[];
  resumo: { totalVendas: number; receitaTotal: number; ticketMedio: number };
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function RelatoriosClient() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('7');

  useEffect(() => { fetchReport(); }, [periodo]);

  async function fetchReport() {
    setLoading(true);
    const res = await fetch(`/api/reports?dias=${periodo}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }

  if (loading) return <div className="text-center text-white/40 py-20">Carregando relatório...</div>;
  if (!data) return <div className="text-center text-white/40 py-20">Erro ao carregar.</div>;

  const maxVenda = Math.max(...data.vendasPorDia.map((d) => d.total), 1);
  const maxEstoque = Math.max(...data.estoquePorCategoria.map((c) => c.qtd), 1);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Relatórios</h1>
          <p className="text-sm text-white/40">Análise de vendas e estoque</p>
        </div>
        <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} className="glass-input px-4" style={{ paddingLeft: '12px' }}>
          <option value="7" className="bg-[#1a0a00]">Últimos 7 dias</option>
          <option value="30" className="bg-[#1a0a00]">Últimos 30 dias</option>
          <option value="90" className="bg-[#1a0a00]">Últimos 90 dias</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Vendas no período', value: String(data.resumo.totalVendas), icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
          { label: 'Receita total', value: fmt(data.resumo.receitaTotal), icon: BarChart3, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
          { label: 'Ticket médio', value: fmt(data.resumo.ticketMedio), icon: Package, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
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
          <h2 className="font-semibold text-white mb-5">Vendas por Dia</h2>
          {data.vendasPorDia.length === 0 ? (
            <p className="text-sm text-white/30 text-center py-8">Nenhuma venda no período</p>
          ) : (
            <div className="space-y-4">
              {data.vendasPorDia.map((d) => (
                <div key={d.data}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-white/60">{d.data}</span>
                    <span className="font-medium text-white">{fmt(d.total)} <span className="text-white/40 font-normal">({d.qtd})</span></span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all" style={{ width: `${Math.round((d.total / maxVenda) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="font-semibold text-white mb-5">Estoque por Categoria</h2>
          {data.estoquePorCategoria.length === 0 ? (
            <p className="text-sm text-white/30 text-center py-8">Nenhum produto cadastrado</p>
          ) : (
            <div className="space-y-4">
              {data.estoquePorCategoria.map((c) => (
                <div key={c.categoria}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-white/60">{c.categoria}</span>
                    <span className="font-medium text-white">{c.qtd} un <span className="text-white/40 font-normal">— {fmt(c.valor)}</span></span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all" style={{ width: `${Math.round((c.qtd / maxEstoque) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-6 lg:col-span-2">
          <h2 className="font-semibold text-white mb-5">Produtos Mais Vendidos</h2>
          {data.topProdutos.length === 0 ? (
            <p className="text-sm text-white/30 text-center py-8">Nenhuma venda no período</p>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[400px]">
              <thead>
                <tr className="border-b border-white/10">
                  {['#', 'Produto', 'Qtd vendida', 'Receita'].map((h) => (
                    <th key={h} className={`pb-3 text-xs font-semibold text-white/40 uppercase ${h === '#' || h === 'Produto' ? 'text-left' : 'text-right'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.topProdutos.map((p, i) => (
                  <tr key={p.nome} className="border-b border-white/5">
                    <td className="py-3 text-sm text-white/30 font-medium">{i + 1}</td>
                    <td className="py-3 text-sm font-medium text-white">{p.nome}</td>
                    <td className="py-3 text-sm text-white/60 text-right">{p.totalVendido}</td>
                    <td className="py-3 text-sm font-semibold text-green-400 text-right">{fmt(p.receita)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
