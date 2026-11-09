'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Archive, RotateCcw, Info, AlertTriangle, PackageOpen } from 'lucide-react';

interface Product { id: string; nome: string; categoria: string; custo: number; preco: number; estoque: number; minimo: number }

const fmt = (v: number) => `R$ ${v.toFixed(2)}`;
const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function ProdutosClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [formData, setFormData] = useState({ nome: '', categoria: '', custo: 0, preco: 0, estoque: 0, minimo: 0 });
  const [verArquivados, setVerArquivados] = useState(false);
  const [aviso, setAviso] = useState('');

  useEffect(() => { fetchProducts(verArquivados); }, [verArquivados]);

  async function fetchProducts(arquivados = verArquivados) {
    setLoading(true);
    const res = await fetch(`/api/products${arquivados ? '?arquivados=1' : ''}`);
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

  async function handleDelete(id: string, nome: string) {
    if (!confirm(`Excluir "${nome}"?\n\nSe ele já apareceu em alguma venda, será arquivado em vez de apagado — assim o histórico e os recibos continuam corretos.`)) return;
    setAviso('');

    const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(data.error ?? 'Erro ao excluir produto');
      return;
    }

    if (data.arquivado) {
      setAviso(`"${nome}" foi arquivado porque já tem histórico (${data.vendas ?? 0} venda(s)). Ele saiu do catálogo, mas os relatórios e recibos antigos seguem intactos. Para vê-lo de novo, use "Ver arquivados".`);
    }

    fetchProducts();
  }

  async function handleRestaurar(id: string, nome: string) {
    const res = await fetch('/api/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, restaurar: true }),
    });

    if (!res.ok) { alert('Erro ao restaurar produto'); return; }

    setAviso(`"${nome}" voltou para o catálogo.`);
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
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-gray-900 font-bold px-4 py-2 rounded-xl transition shadow-lg shadow-emerald-500/20">
          <Plus size={18} /> Novo Produto
        </button>
      </div>

      {/* No celular: busca em linha inteira, filtros embaixo lado a lado */}
      <div className="grid grid-cols-2 gap-3 lg:flex">
        <div className="col-span-2 lg:flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
          <input type="text" placeholder="Buscar por nome..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input w-full pl-9" />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="glass-input px-4 min-w-0 w-full lg:w-auto">
          <option value="" className="bg-[#1a0a00]">Todas categorias</option>
          {categories.map((c) => <option key={c} value={c} className="bg-[#1a0a00]">{c}</option>)}
        </select>
        <button
          onClick={() => { setAviso(''); setVerArquivados((v) => !v); }}
          className={`flex items-center justify-center gap-2 px-4 rounded-xl border text-sm font-medium whitespace-nowrap transition ${
            verArquivados
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
              : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
          }`}
        >
          <Archive size={15} /> {verArquivados ? 'Ver catálogo' : 'Ver arquivados'}
        </button>
      </div>

      {aviso && (
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 text-amber-200/90 px-4 py-3 rounded-xl text-sm">
          <Info size={17} className="flex-shrink-0 mt-0.5 text-amber-400" />
          <p className="flex-1">{aviso}</p>
          <button onClick={() => setAviso('')} className="text-amber-200/50 hover:text-amber-200 text-xs">Fechar</button>
        </div>
      )}

      {verArquivados && (
        <p className="text-sm text-white/40">
          Produtos arquivados não aparecem no catálogo nem na tela de vendas, mas continuam no histórico.
        </p>
      )}

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
                  <td className="px-5 py-4"><span className="px-2 py-1 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full whitespace-nowrap">{p.categoria}</span></td>
                  <td className="px-5 py-4 text-white/70">{fmt(p.custo)}</td>
                  <td className="px-5 py-4 text-white/70">{fmt(p.preco)}</td>
                  <td className="px-5 py-4 text-white/70">{margem}%</td>
                  <td className="px-5 py-4">
                    <span className={low ? 'text-red-400 font-semibold' : 'text-white/70'}>{p.estoque} {low && '⚠️'}</span>
                  </td>
                  <td className="px-5 py-4 flex gap-2">
                    {verArquivados ? (
                      <button onClick={() => handleRestaurar(p.id, p.nome)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-semibold text-white/70 hover:bg-white/10 transition">
                        <RotateCcw size={13} className="text-emerald-400" /> Restaurar
                      </button>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(p)} className="p-2 hover:bg-white/10 rounded-lg transition"><Edit2 size={15} className="text-blue-400" /></button>
                        <button onClick={() => handleDelete(p.id, p.nome)} className="p-2 hover:bg-white/10 rounded-lg transition"><Trash2 size={15} className="text-red-400" /></button>
                      </>
                    )}
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
        <div className="lg:hidden flex flex-col items-center text-center gap-3 py-14 px-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <PackageOpen size={26} className="text-emerald-400" />
          </div>
          <p className="text-white/70 font-medium">Nenhum produto encontrado</p>
          {!verArquivados && !searchTerm && !categoryFilter && (
            <button onClick={() => setShowModal(true)} className="mt-1 inline-flex items-center gap-2 bg-gradient-to-r from-emerald-400 to-cyan-500 text-gray-900 font-bold px-4 py-2 rounded-xl text-sm">
              <Plus size={16} /> Cadastrar primeiro produto
            </button>
          )}
        </div>
      ) : (
        <div className="lg:hidden space-y-4">
          <p className="text-xs text-white/40 px-1">
            {filtered.length} {filtered.length === 1 ? 'produto' : 'produtos'}
          </p>
          {filtered.map((p) => {
            const margem = p.preco > 0 ? Math.round(((p.preco - p.custo) / p.preco) * 100) : 0;
            const lucro = p.preco - p.custo;
            const low = p.estoque <= p.minimo;
            const zerado = p.estoque <= 0;
            // Barra de estoque: cheia quando tem o dobro do mínimo (ou mais).
            const referencia = Math.max(p.minimo * 2, 1);
            const nivel = Math.min(100, Math.max(zerado ? 0 : 6, Math.round((p.estoque / referencia) * 100)));
            const corMargem =
              margem >= 30 ? 'text-emerald-300 bg-emerald-500/15 border-emerald-500/25'
              : margem >= 15 ? 'text-amber-300 bg-amber-500/15 border-amber-500/25'
              : 'text-red-300 bg-red-500/15 border-red-500/25';
            return (
              <div
                key={p.id}
                className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-md shadow-lg shadow-black/20 ${
                  low ? 'border-red-500/25' : 'border-white/10'
                }`}
              >
                {/* Faixa colorida no topo */}
                <div className={`h-1 w-full bg-gradient-to-r ${low ? 'from-red-500 to-amber-400' : 'from-emerald-400 to-cyan-500'}`} />

                <div className="p-4 space-y-4">
                  {/* Cabeçalho: inicial, nome, categoria e preço */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/25 to-cyan-500/25 border border-emerald-400/20 flex items-center justify-center text-lg font-bold text-emerald-300 uppercase">
                      {p.nome.trim().charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-[15px] leading-snug line-clamp-2 break-words">{p.nome}</p>
                      {p.categoria && (
                        <span className="inline-block mt-1.5 max-w-full truncate text-[11px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          {p.categoria}
                        </span>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-[10px] uppercase tracking-wider text-white/40">Venda</p>
                      <p className="text-lg font-extrabold text-white leading-tight">{brl(p.preco)}</p>
                    </div>
                  </div>

                  {/* Números do produto */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-black/20 border border-white/5 px-2.5 py-2">
                      <p className="text-[10px] uppercase tracking-wider text-white/40">Custo</p>
                      <p className="text-sm font-semibold text-white/90 truncate">{brl(p.custo)}</p>
                    </div>
                    <div className="rounded-xl bg-black/20 border border-white/5 px-2.5 py-2">
                      <p className="text-[10px] uppercase tracking-wider text-white/40">Lucro/un</p>
                      <p className={`text-sm font-semibold truncate ${lucro >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{brl(lucro)}</p>
                    </div>
                    <div className="rounded-xl bg-black/20 border border-white/5 px-2.5 py-2">
                      <p className="text-[10px] uppercase tracking-wider text-white/40">Margem</p>
                      <span className={`inline-block mt-0.5 text-xs font-bold px-1.5 py-0.5 rounded-md border ${corMargem}`}>{margem}%</span>
                    </div>
                  </div>

                  {/* Estoque com barra */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/50">
                        Estoque: <span className={`font-bold ${low ? 'text-red-300' : 'text-white'}`}>{p.estoque} un</span>
                        <span className="text-white/30"> · mín. {p.minimo}</span>
                      </span>
                      {low ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-300 bg-red-500/15 border border-red-500/25 px-2 py-0.5 rounded-full">
                          <AlertTriangle size={11} /> {zerado ? 'Sem estoque' : 'Estoque baixo'}
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">Em dia</span>
                      )}
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${low ? 'from-red-500 to-amber-400' : 'from-emerald-400 to-cyan-500'}`}
                        style={{ width: `${nivel}%` }}
                      />
                    </div>
                  </div>

                  {/* Ações com botões grandes para o dedo */}
                  {verArquivados ? (
                    <button onClick={() => handleRestaurar(p.id, p.nome)} className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-sm font-semibold text-emerald-300 active:scale-[0.98] transition">
                      <RotateCcw size={15} /> Restaurar
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => handleEdit(p)} className="flex items-center justify-center gap-2 py-2.5 bg-blue-500/10 border border-blue-500/25 rounded-xl text-sm font-semibold text-blue-300 active:scale-[0.98] transition">
                        <Edit2 size={15} /> Editar
                      </button>
                      <button onClick={() => handleDelete(p.id, p.nome)} className="flex items-center justify-center gap-2 py-2.5 bg-red-500/10 border border-red-500/25 rounded-xl text-sm font-semibold text-red-300 active:scale-[0.98] transition">
                        <Trash2 size={15} /> Excluir
                      </button>
                    </div>
                  )}
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
              <button onClick={handleSave} className="flex-1 py-2.5 bg-gradient-to-r from-emerald-400 to-cyan-500 text-gray-900 font-bold rounded-xl hover:from-emerald-300 hover:to-cyan-400 transition text-sm">Salvar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
