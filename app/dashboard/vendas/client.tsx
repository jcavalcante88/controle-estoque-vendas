'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Trash2, CheckCircle, Receipt, MessageCircle, Mail, Link2, Check, Loader2 } from 'lucide-react';
import { PAGAMENTOS, numeroRecibo } from '@/lib/recibo';

interface Product { id: string; nome: string; preco: number; estoque: number }
interface CartItem { productId: string; nome: string; preco: number; qty: number }
interface Sale {
  id: string;
  numero: number;
  token: string;
  total: number;
  createdAt: string;
  clienteNome: string | null;
  clienteContato: string | null;
  pagamento: string | null;
  items: { qty: number; price: number; product: { nome: string } }[];
}

const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const urlRecibo = (token: string) =>
  typeof window === 'undefined' ? `/recibo/${token}` : `${window.location.origin}/recibo/${token}`;

function linkWhatsApp(sale: Sale) {
  const texto = `Recibo ${numeroRecibo(sale.numero)}\nTotal: ${fmt(sale.total)}\n\nVeja o recibo da sua compra: ${urlRecibo(sale.token)}`;
  const digitos = (sale.clienteContato ?? '').replace(/\D/g, '');
  const numero = digitos.length >= 10 ? (digitos.length <= 11 ? `55${digitos}` : digitos) : '';
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

// Painel que aparece assim que a venda e fechada: imprimir, mandar no WhatsApp ou por e-mail.
function ReciboPainel({ sale, onFechar }: { sale: Sale; onFechar: () => void }) {
  const [copiado, setCopiado] = useState(false);
  const [mostrarEmail, setMostrarEmail] = useState(false);
  const [email, setEmail] = useState(sale.clienteContato?.includes('@') ? sale.clienteContato : '');
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState('');

  async function copiar() {
    try {
      await navigator.clipboard.writeText(urlRecibo(sale.token));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      window.prompt('Copie o link do recibo:', urlRecibo(sale.token));
    }
  }

  async function enviarEmail() {
    setEnviando(true);
    setErro('');
    try {
      const res = await fetch(`/api/sales/${sale.id}/enviar-recibo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const e = await res.json();
        setErro(e.error ?? 'Erro ao enviar');
        return;
      }
      setEnviado(true);
      setMostrarEmail(false);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <CheckCircle size={20} className="text-emerald-400" />
          <div>
            <p className="font-semibold text-white text-sm">Venda registrada!</p>
            <p className="text-xs text-white/50">
              Recibo {numeroRecibo(sale.numero)} · {fmt(sale.total)}
            </p>
          </div>
        </div>
        <button onClick={onFechar} className="text-white/30 hover:text-white/70 text-sm">Fechar</button>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={`/recibo/${sale.token}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-emerald-400 to-cyan-500 text-gray-900 rounded-lg text-xs font-bold hover:from-emerald-300 hover:to-cyan-400 transition"
        >
          <Receipt size={15} /> Ver / Imprimir PDF
        </a>

        <a
          href={linkWhatsApp(sale)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3.5 py-2 bg-white/5 border border-white/10 text-white/80 rounded-lg text-xs font-semibold hover:bg-white/10 transition"
        >
          <MessageCircle size={15} className="text-emerald-400" /> WhatsApp
        </a>

        <button
          onClick={() => setMostrarEmail((v) => !v)}
          className="flex items-center gap-2 px-3.5 py-2 bg-white/5 border border-white/10 text-white/80 rounded-lg text-xs font-semibold hover:bg-white/10 transition"
        >
          <Mail size={15} className="text-cyan-400" /> {enviado ? 'E-mail enviado!' : 'E-mail'}
        </button>

        <button
          onClick={copiar}
          className="flex items-center gap-2 px-3.5 py-2 bg-white/5 border border-white/10 text-white/80 rounded-lg text-xs font-semibold hover:bg-white/10 transition"
        >
          {copiado ? <Check size={15} className="text-emerald-400" /> : <Link2 size={15} />}
          {copiado ? 'Copiado!' : 'Copiar link'}
        </button>
      </div>

      {mostrarEmail && (
        <div className="mt-3">
          <div className="flex gap-2">
            <input
              type="email"
              value={email ?? ''}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@docliente.com"
              className="glass-input flex-1"
              style={{ paddingLeft: '12px' }}
            />
            <button
              onClick={enviarEmail}
              disabled={enviando || !email}
              className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-xl text-xs font-semibold hover:bg-cyan-500/30 disabled:opacity-40 transition flex items-center gap-2"
            >
              {enviando && <Loader2 size={14} className="animate-spin" />} Enviar
            </button>
          </div>
          {erro && <p className="text-xs text-red-400 mt-2">{erro}</p>}
        </div>
      )}
    </div>
  );
}

export function VendasClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ultimaVenda, setUltimaVenda] = useState<Sale | null>(null);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedQty, setSelectedQty] = useState(1);
  const [clienteNome, setClienteNome] = useState('');
  const [clienteContato, setClienteContato] = useState('');
  const [pagamento, setPagamento] = useState('');

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
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((c) => ({ productId: c.productId, qty: c.qty, price: c.preco })),
          clienteNome,
          clienteContato,
          pagamento,
        }),
      });
      if (!res.ok) { const e = await res.json(); alert(e.error ?? 'Erro ao finalizar venda'); return; }
      const venda: Sale = await res.json();
      setCart([]); setClienteNome(''); setClienteContato(''); setPagamento('');
      setUltimaVenda(venda);
      fetchAll();
    } finally { setSaving(false); }
  }

  if (loading) return <div className="text-center text-white/40 py-20">Carregando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Vendas</h1>
        <p className="text-sm text-white/40">Registre vendas, gere o recibo e envie ao cliente</p>
      </div>

      {ultimaVenda && <ReciboPainel sale={ultimaVenda} onFechar={() => setUltimaVenda(null)} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Carrinho */}
        <div className="glass-card p-6">
          <h2 className="font-semibold text-white flex items-center gap-2 mb-5">
            <ShoppingCart size={17} className="text-emerald-400" /> Nova Venda
          </h2>
          <div className="flex gap-2 mb-5">
            <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)} className="glass-input flex-1" style={{ paddingLeft: '12px' }}>
              <option value="" className="bg-[#1a0a00]">Selecione um produto</option>
              {products.filter((p) => p.estoque > 0).map((p) => (
                <option key={p.id} value={p.id} className="bg-[#1a0a00]">{p.nome} — {fmt(p.preco)} (est: {p.estoque})</option>
              ))}
            </select>
            <input type="number" min={1} value={selectedQty} onChange={(e) => setSelectedQty(Number(e.target.value))} className="glass-input w-16 text-center" style={{ paddingLeft: '8px', paddingRight: '8px' }} />
            <button onClick={addToCart} disabled={!selectedProduct} className="px-3 py-2 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 rounded-xl hover:bg-emerald-500/25 disabled:opacity-40 transition">
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

              {/* Dados que vao no recibo — todos opcionais */}
              <div className="space-y-2 pb-3 border-t border-white/10">
                <p className="text-[11px] uppercase tracking-wider text-white/30 font-semibold pt-3">Dados do recibo (opcional)</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={clienteNome}
                    onChange={(e) => setClienteNome(e.target.value)}
                    placeholder="Nome do cliente"
                    className="glass-input"
                    style={{ paddingLeft: '12px' }}
                  />
                  <input
                    value={clienteContato}
                    onChange={(e) => setClienteContato(e.target.value)}
                    placeholder="WhatsApp ou e-mail"
                    className="glass-input"
                    style={{ paddingLeft: '12px' }}
                  />
                </div>
                <select value={pagamento} onChange={(e) => setPagamento(e.target.value)} className="glass-input" style={{ paddingLeft: '12px' }}>
                  <option value="" className="bg-[#1a0a00]">Forma de pagamento</option>
                  {PAGAMENTOS.map((p) => (
                    <option key={p.valor} value={p.valor} className="bg-[#1a0a00]">{p.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between items-center py-3 border-t border-white/10">
                <span className="font-semibold text-white">Total</span>
                <span className="text-xl font-bold text-green-400">{fmt(total)}</span>
              </div>
              <button onClick={handleFinalize} disabled={saving}
                className="mt-4 w-full py-3 bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-gray-900 font-bold rounded-xl disabled:opacity-60 transition shadow-lg shadow-emerald-500/20">
                {saving ? 'Finalizando...' : 'Finalizar Venda e Gerar Recibo'}
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
                    <div>
                      <p className="text-xs text-white/30">{new Date(sale.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      <p className="text-xs text-white/50 mt-0.5">
                        Recibo {numeroRecibo(sale.numero)}
                        {sale.clienteNome && <span className="text-white/30"> · {sale.clienteNome}</span>}
                      </p>
                    </div>
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
                  <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
                    <a
                      href={`/recibo/${sale.token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-white/70 rounded-lg text-[11px] font-semibold hover:bg-white/10 transition"
                    >
                      <Receipt size={13} className="text-emerald-400" /> Recibo
                    </a>
                    <a
                      href={linkWhatsApp(sale)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-white/70 rounded-lg text-[11px] font-semibold hover:bg-white/10 transition"
                    >
                      <MessageCircle size={13} className="text-emerald-400" /> Enviar
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
