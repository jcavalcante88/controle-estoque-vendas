'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';

interface Product { id: string; nome: string; categoria: string; custo: number; preco: number; estoque: number; minimo: number }

const fmt = (v: number) => `R$ ${v.toFixed(2)}`;

export function ProdutosClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [formData, setFormData] = useState({ nome: '', categoria: '', custo: 0, preco: 0, estoque: 0, minimo: 0 });

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    setLoading(true);
    const res = await fetch('/api/products');
    if (res.ok) setProducts(await res.json());
    setLoading(false);
  }

  async function handleSave() {
    if (!formData.nome) { alert('Nome é obrigatório'); return; }
    const method = editingId ? 'PUT' : 'POST';
    const body = editingId ? { ...formData, id: editingId } : formData;
    const res = await fetch('/api/products', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) { alert('Erro ao salvar produto'); return; }
    setShowModal(false); setEditingId(null);
    setFormData({ nome: '', categoria: '', custo: 0, preco: 0, estoque: 0, minimo: 0 });
    fetchProducts();
  }

  async function handleDelete(id: string) {
    if (!confirm('Deletar este produto?')) return;
    await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
    fetchProducts();
  }

  function handleEdit(p: Product) { setEditingId(p.id); setFormData(p); setShowModal(true); }

  const categories = [...new Set(products.map((p) => p.categoria))];
  const filtered = products.filter((p) =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase()) && (!categoryFilter || p.categoria === categoryFilter)
  );

  if (loading) return <div className="text-center text-white/40 py-20">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Produtos</h1>
          <p className="text-sm text-white/40">Gerencie seu catálogo</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-900 font-bold px-4 py-2 rounded-xl transition shadow-lg shadow-amber-500/20">
          <Plus size={18} /> Novo Produto
        </button>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
          <input type="text" placeholder="Buscar por nome..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input w-full pl-9" />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="glass-input px-4">
          <option value="" className="bg-[#1a0a00]">Todas categorias</option>
          {categories.map((c) => <option key={c} value={c} className="bg-[#1a0a00]">{c}</option>)}
        </select>
      </div>

      {/* Desktop: Tabela */}
      <div className="glass-card overflow-hidden hidden lg:block">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="border-b border-white/10">
            <tr>
              {['Produto', 'Categoria', 'Custo', 'Venda', 'Margem', 'Estoque', 'Ações'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-white/30">Nenhum produto encontrado</td></tr>
            ) : filtered.map((p) => {
              const margem = p.preco > 0 ? Math.round(((p.preco - p.custo) / p.preco) * 100) : 0;
              const low = p.estoque <= p.minimo;
              return (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-4 font-medium text-white max-w-xs truncate">{p.nome}</td>
                  <td className="px-5 py-4"><span className="px-2 py-1 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full whitespace-nowrap">{p.categoria}</span></td>
                  <td className="px-5 py-4 text-white/70">{fmt(p.custo)}</td>
                  <td className="px-5 py-4 text-white/70">{fmt(p.preco)}</td>
                  <td className="px-5 py-4 text-white/70">{margem}%</td>
                  <td className="px-5 py-4">
                    <span className={low ? 'text-red-400 font-semibold' : 'text-white/70'}>{p.estoque} {low && '⚠️'}</span>
                  </td>
                  <td className="px-5 py-4 flex gap-2">
                    <button onClick={() => handleEdit(p)} className="p-2 hover:bg-white/10 rounded-lg transition"><Edit2 size={15} className="text-blue-400" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-white/10 rounded-lg transition"><Trash2 size={15} className="text-red-400" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>

      {/* Mobile: Cards */}
      {filtered.length === 0 ? (
        <div className="lg:hidden text-center text-white/30 py-10">Nenhum produto encontrado</div>
      ) : (
        <div className="lg:hidden space-y-3">
          {filtered.map((p) => {
            const margem = p.preco > 0 ? Math.round(((p.preco - p.custo) / p.preco) * 100) : 0;
            const low = p.estoque <= p.minimo;
            return (
              <div key={p.id} className="glass-card p-4 space-y-3">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{p.nome}</p>
                    <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded-full inline-block mt-1">{p.categoria}</span>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleEdit(p)} className="p-2 hover:bg-white/10 rounded-lg transition"><Edit2 size={16} className="text-blue-400" /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 hover:bg-white/10 rounded-lg transition"><Trash2 size={16} className="text-red-400" /></button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-white/40 mb-1">Custo</p>
                    <p className="text-sm font-medium text-white">{fmt(p.custo)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Venda</p>
                    <p className="text-sm font-medium text-white">{fmt(p.preco)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Margem</p>
                    <p className="text-sm font-medium text-amber-400">{margem}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/40 mb-1">Estoque</p>
                    <p className={`text-sm font-medium ${low ? 'text-red-400' : 'text-white'}`}>{p.estoque} {low && '⚠️'}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="glass-card max-w-md w-full mx-4 p-7" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-white mb-6">{editingId ? 'Editar' : 'Novo'} Produto</h2>
            <div className="space-y-4">
              {[
                { label: 'Nome', key: 'nome', type: 'text' },
                { label: 'Categoria', key: 'categoria', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-sm text-white/50 mb-1">{label}</label>
                  <input type={type} value={(formData as any)[key]} onChange={(e) => setFormData({ ...formData, [key]: e.target.value })} className="glass-input w-full" style={{ paddingLeft: '12px' }} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                {[['Custo (R$)', 'custo'], ['Venda (R$)', 'preco'], ['Estoque', 'estoque'], ['Mínimo', 'minimo']].map(([label, key]) => (
                  <div key={key}>
                    <label className="block text-sm text-white/50 mb-1">{label}</label>
                    <input type="number" step="0.01" value={(formData as any)[key]}
                      onChange={(e) => setFormData({ ...formData, [key]: Number(e.target.value) })}
                      className="glass-input w-full" style={{ paddingLeft: '12px' }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-white/10 rounded-xl text-white/60 hover:bg-white/5 transition text-sm">Cancelar</button>
              <button onClick={handleSave} className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 font-bold rounded-xl hover:from-amber-300 hover:to-amber-400 transition text-sm">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
