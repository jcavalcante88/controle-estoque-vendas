'use client';

import { useState, useEffect } from 'react';
import { ArrowUpCircle, ArrowDownCircle, SlidersHorizontal, AlertTriangle } from 'lucide-react';

interface Product { id: string; nome: string; categoria: string; estoque: number; minimo: number; custo: number }
interface Movement { id: string; tipo: string; qty: number; motivo: string | null; createdAt: string; product: { nome: string } }

const fmt = (v: number) => `R$ ${v.toFixed(2)}`;

export function EstoqueClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ productId: '', tipo: 'entrada', qty: 1, motivo: '' });

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [pRes, mRes] = await Promise.all([fetch('/api/products'), fetch('/api/stock')]);
    if (pRes.ok) setProducts(await pRes.json());
    if (mRes.ok) setMovements(await mRes.json());
    setLoading(false);
  }

  async function handleSave() {
    if (!form.productId || form.qty <= 0) { alert('Selecione um produto e informe a quantidade.'); return; }
    const res = await fetch('/api/stock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (!res.ok) { const e = await res.json(); alert(e.error ?? 'Erro ao registrar'); return; }
    setShowModal(false); setForm({ productId: '', tipo: 'entrada', qty: 1, motivo: '' });
    fetchAll();
  }

  const tipoCor: Record<string, string> = { entrada: 'text-green-400 bg-green-500/10 border-green-500/20', saida: 'text-red-400 bg-red-500/10 border-red-500/20', ajuste: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
  const tipoLabel: Record<string, string> = { entrada: 'Entrada', saida: 'Saída', ajuste: 'Ajuste' };

  if (loading) return <div className="text-center text-white/40 py-20">Carregando...</div>;
  const baixo = products.filter((p) => p.estoque <= p.minimo);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Estoque</h1>
          <p className="text-sm text-white/40">Controle de entradas e saídas</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-900 font-bold px-4 py-2 rounded-xl transition shadow-lg shadow-amber-500/20">
          <SlidersHorizontal size={18} /> Movimentar
        </button>
      </div>

      {baixo.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
          <p className="text-sm font-semibold text-amber-400 flex items-center gap-2 mb-2">
            <AlertTriangle size={16} /> {baixo.length} produto(s) abaixo do mínimo
          </p>
          <div className="flex flex-wrap gap-2">
            {baixo.map((p) => (
              <span key={p.id} className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-1 rounded-full">
                {p.nome}: {p.estoque}/{p.minimo}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Desktop: Tabela */}
      <div className="glass-card overflow-hidden hidden lg:block">
        <div className="px-5 py-4 border-b border-white/10">
          <h2 className="font-semibold text-white">Estoque atual</h2>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead className="border-b border-white/10">
            <tr>
              {['Produto', 'Categoria', 'Estoque', 'Mínimo', 'Status'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-white/40 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-white/30">Nenhum produto cadastrado</td></tr>
            ) : products.map((p) => {
              const low = p.estoque <= p.minimo;
              return (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-4 font-medium text-white max-w-xs truncate">{p.nome}</td>
                  <td className="px-5 py-4"><span className="px-2 py-1 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full whitespace-nowrap">{p.categoria}</span></td>
                  <td className="px-5 py-4 font-semibold"><span className={low ? 'text-red-400' : 'text-white'}>{p.estoque}</span></td>
                  <td className="px-5 py-4 text-white/50">{p.minimo}</td>
                  <td className="px-5 py-4">
                    {low
                      ? <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium text-red-400 bg-red-500/10 border border-red-500/20"><AlertTriangle size={11} /> Baixo</span>
                      : <span className="text-xs px-2 py-1 rounded-full font-medium text-green-400 bg-green-500/10 border border-green-500/20">OK</span>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>

      {/* Mobile: Cards */}
      {products.length === 0 ? (
        <div className="lg:hidden text-center text-white/30 py-10">Nenhum produto cadastrado</div>
      ) : (
        <div className="lg:hidden space-y-3">
          {products.map((p) => {
            const low = p.estoque <= p.minimo;
            return (
              <div key={p.id} className="glass-card p-4 space-y-3">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{p.nome}</p>
                    <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded-full inline-block mt-1">{p.categoria}</span>
                  </div>
                  <div>
                    {low
                      ? <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium text-red-400 bg-red-500/10 border border-red-500/20"><AlertTriangle size={12} /> Baixo</span>
                      : <span className="text-xs px-2 py-1 rounded-full font-medium text-green-400 bg-green-500/10 border border-green-500/20">OK</span>
                    }
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-white/40 mb-1">Atual</p>
                    <p className={`text-sm font-semibold ${low ? 'text-red-400' : 'text-white'}`}>{p.estoque}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Mínimo</p>
                    <p className="text-sm font-medium text-white/70">{p.minimo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Custo Un.</p>
                    <p className="text-sm font-medium text-white">{fmt(p.custo)}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <h2 className="font-semibold text-white">Histórico de Movimentações</h2>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[520px]">
          <thead className="border-b border-white/10">
            <tr>
              {['Data', 'Produto', 'Tipo', 'Qtd', 'Motivo'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-white/40 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {movements.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-white/30">Nenhuma movimentação registrada</td></tr>
            ) : movements.map((m) => (
              <tr key={m.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                <td className="px-5 py-4 text-sm text-white/50">{new Date(m.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                <td className="px-5 py-4 text-sm font-medium text-white">{m.product.nome}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium border ${tipoCor[m.tipo] ?? ''}`}>
                    {m.tipo === 'entrada' ? <ArrowUpCircle size={11} /> : m.tipo === 'saida' ? <ArrowDownCircle size={11} /> : null}
                    {tipoLabel[m.tipo] ?? m.tipo}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-white/70">{m.qty}</td>
                <td className="px-5 py-4 text-sm text-white/40">{m.motivo ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="glass-card max-w-md w-full mx-4 p-7" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-6">Nova Movimentação</h2>
            <div className="space-y-4">
              {[
                { label: 'Produto', el: <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} className="glass-input w-full" style={{ paddingLeft: '12px' }}><option value="" className="bg-[#1a0a00]">Selecione</option>{products.map((p) => <option key={p.id} value={p.id} className="bg-[#1a0a00]">{p.nome} (est: {p.estoque})</option>)}</select> },
                { label: 'Tipo', el: <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="glass-input w-full" style={{ paddingLeft: '12px' }}><option value="entrada" className="bg-[#1a0a00]">Entrada</option><option value="saida" className="bg-[#1a0a00]">Saída</option><option value="ajuste" className="bg-[#1a0a00]">Ajuste</option></select> },
                { label: 'Quantidade', el: <input type="number" min={1} value={form.qty} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })} className="glass-input w-full" style={{ paddingLeft: '12px' }} /> },
                { label: 'Motivo (opcional)', el: <input type="text" value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} placeholder="Ex: compra, perda..." className="glass-input w-full" style={{ paddingLeft: '12px' }} /> },
              ].map(({ label, el }) => (
                <div key={label}><label className="block text-sm text-white/50 mb-1">{label}</label>{el}</div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-white/10 rounded-xl text-white/60 hover:bg-white/5 transition text-sm">Cancelar</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 font-bold rounded-xl hover:from-amber-300 transition text-sm">Registrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
