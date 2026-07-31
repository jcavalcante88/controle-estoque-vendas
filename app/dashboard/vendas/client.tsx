'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Trash2, CheckCircle } from 'lucide-react';

interface Product { id: string; nome: string; preco: number; estoque: number }
interface CartItem { productId: string; nome: string; preco: number; qty: number }
interface Sale { id: string; total: number; createdAt: string; items: { qty: number; price: number; product: { nome: string } }[] }

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function VendasClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const [pRes, sRes] = await Promise.all([fetch('/api/products'), fetch('/api/sales')]);
    if (pRes.ok) setProducts(await pRes.json());
    if (sRes.ok) setSales(await sRes.json());
    setLoading(false);
  }

  function addToCart() {
    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;
    const existing = cart.find((c) => c.productId === product.id);
    const total = (existing?.qty ?? 0) + selectedQty;
    if (total > product.estoque) { alert(`Estoque insuficiente. Disponível: ${product.estoque}`); return; }
    if (existing) setCart(cart.map((c) => c.productId === product.id ? { ...c, qty: c.qty + selectedQty } : c));
    else setCart([...cart, { productId: product.id, nome: product.nome, preco: product.preco, qty: selectedQty }]);
    setSelectedProduct(''); setSelectedQty(1);
  }

  function updateQty(productId: string, qty: number) {
    if (qty <= 0) { setCart(cart.filter((c) => c.productId !== productId)); return; }
    const p = products.find((p) => p.id === productId);
    if (p && qty > p.estoque) { alert(`Estoque insuficiente. Disponível: ${p.estoque}`); return; }
    setCart(cart.map((c) => c.productId === productId ? { ...c, qty } : c));
  }

  const total = cart.reduce((s, c) => s + c.preco * c.qty, 0);

  async function handleFinalize() {
    if (cart.length === 0) { alert('Adicione pelo menos um produto.'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/sales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: cart.map((c) => ({ productId: c.productId, qty: c.qty, price: c.preco })) }) });
      if (!res.ok) { const e = await res.json(); alert(e.error ?? 'Erro ao finalizar venda'); return; }
      setCart([]); setSuccess(true); setTimeout(() => setSuccess(false), 3000); fetchAll();
    } finally { setSaving(false); }
  }

  if (loading) return <div className="text-center text-white/40 py-20">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Vendas</h1>
        <p className="text-sm text-white/40">Registre vendas e veja o histórico</p>
      </div>

      {success && (
        <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl">
          <CheckCircle size={18} /> <span className="font-medium text-sm">Venda registrada com sucesso!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Carrinho */}
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white flex items-center gap-2 mb-5">
            <ShoppingCart size={17} className="text-amber-400" /> Nova Venda
          </h2>
          <div className="flex gap-2 mb-5">
            <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="glass-input flex-1" style={{ paddingLeft: '12px' }}>
              <option value="" className="bg-[#1a0a00]">Selecione um produto</option>
              {products.filter((p) => p.estoque > 0).map((p) => (
                <option key={p.id} value={p.id} className="bg-[#1a0a00]">{p.nome} — {fmt(p.preco)} (est: {p.estoque})</option>
              ))}
            </select>
            <input type="number" min={1} value={selectedQty} onChange={(e) => setSelectedQty(Number(e.target.value))} className="glass-input w-16 text-center" style={{ paddingLeft: '8px', paddingRight: '8px' }} />
            <button onClick={addToCart} disabled={!selectedProduct} className="px-3 py-2 bg-amber-500/15 border border-amber-500/25 text-amber-400 rounded-xl hover:bg-amber-500/25 disabled:opacity-40 transition">
              <Plus size={18} />
            </button>
          </div>

          {cart.length === 0 ? (
            <p className="text-sm text-white/30 text-center py-10">Carrinho vazio</p>
          ) : (
            <>
              <ul className="space-y-2 mb-5">
                {cart.map((item) => (
                  <li key={item.productId} className="flex items-center gap-3 py-2.5 border-b border-white/5">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{item.nome}</p>
                      <p className="text-xs text-white/40">{fmt(item.preco)} / un</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateQty(item.productId, item.qty - 1)} className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 text-sm font-bold flex items-center justify-center">−</button>
                      <span className="w-7 text-center text-sm font-medium text-white">{item.qty}</span>
                      <button onClick={() => updateQty(item.productId, item.qty + 1)} className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 text-sm font-bold flex items-center justify-center">+</button>
                    </div>
                    <span className="text-sm font-semibold text-white w-20 text-right">{fmt(item.preco * item.qty)}</span>
                    <button onClick={() => setCart(cart.filter((c) => c.productId !== item.productId))} className="text-red-400/60 hover:text-red-400"><Trash2 size={14} /></button>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between items-center py-3 border-t border-white/10">
                <span className="font-semibold text-white">Total</span>
                <span className="text-xl font-bold text-green-400">{fmt(total)}</span>
              </div>
              <button onClick={handleFinalize} disabled={saving}
                className="mt-4 w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-900 font-bold rounded-xl disabled:opacity-60 transition shadow-lg shadow-amber-500/20">
                {saving ? 'Finalizando...' : 'Finalizar Venda'}
              </button>
            </>
          )}
        </div>

        {/* Histórico */}
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white mb-5">Histórico de Vendas</h2>
          {sales.length === 0 ? (
            <p className="text-sm text-white/30 text-center py-10">Nenhuma venda registrada</p>
          ) : (
            <div className="space-y-3 max-h-[520px] overflow-y-auto">
              {sales.map((sale) => (
                <div key={sale.id} className="bg-white/5 border border-white/8 rounded-xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs text-white/30">{new Date(sale.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    <span className="text-base font-bold text-green-400">{fmt(sale.total)}</span>
                  </div>
                  <ul className="space-y-1">
                    {sale.items.map((item, i) => (
                      <li key={i} className="text-xs text-white/50 flex justify-between">
                        <span>{item.product.nome} × {item.qty}</span>
                        <span>{fmt(item.price * item.qty)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
