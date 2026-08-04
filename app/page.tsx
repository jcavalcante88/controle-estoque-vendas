import Link from "next/link";
import { Store, Package, Boxes, ShoppingCart, BarChart3, Shield, Smartphone } from "lucide-react";
import { auth } from "@/lib/auth";

const features = [
  { icon: Package, title: "Produtos", desc: "Cadastro completo com custo, preço e margem automática" },
  { icon: Boxes, title: "Estoque", desc: "Controle de entradas e saídas com histórico detalhado" },
  { icon: ShoppingCart, title: "Vendas", desc: "Carrinho de compras com baixa automática no estoque" },
  { icon: BarChart3, title: "Relatórios", desc: "Vendas por dia, top produtos e estoque por categoria" },
  { icon: Shield, title: "Seguro", desc: "Dados isolados por cliente, acesso protegido por login" },
  { icon: Smartphone, title: "Em qualquer lugar", desc: "Funciona no celular, tablet e computador, sem instalar nada" },
];

export default async function HomePage() {
  // Se o usuário já estiver logado, os botões levam direto ao dashboard
  const session = await auth();
  const dest = session?.user?.id ? "/dashboard" : "/login";

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden bg-[#070d14]">
      {/* Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Store size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg">Estoque &amp; Vendas</span>
        </div>
        <Link
          href={dest}
          className="text-sm font-semibold text-emerald-300 hover:text-emerald-200 transition-colors"
        >
          Entrar →
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
          ✦ 2 meses grátis · Sem cartão de crédito
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight mb-6 max-w-3xl">
          Controle total do seu{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">
            estoque e das suas vendas
          </span>
        </h1>

        <p className="text-white/50 text-lg max-w-lg mb-4 leading-relaxed">
          Sem mais cadernos, planilhas ou perda de vendas. Tudo o que entra e sai do seu negócio em um único lugar.
        </p>
        <p className="text-white/40 text-sm max-w-lg mb-10">
          Para lojas, distribuidoras, oficinas, papelarias, mercadinhos — qualquer negócio que compra e vende.
        </p>

        <Link
          href={dest}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-gray-900 font-bold text-base hover:from-emerald-300 hover:to-cyan-400 transition-all shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 duration-200"
        >
          {session?.user?.id ? "Ir para o painel" : "Começar grátis"}
          <span className="text-lg">→</span>
        </Link>

        {/* Cards de features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full mt-20">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="glass-card p-5 text-left hover:-translate-y-1 transition-transform duration-300"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                <Icon size={18} className="text-emerald-400" />
              </div>
              <h3 className="text-white font-semibold mb-1">{title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative z-10 bg-gradient-to-r from-emerald-500/5 to-cyan-600/5 border-t border-emerald-500/10 py-16 px-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Pronto para saber quanto você realmente lucra?</h2>
        <p className="text-white/50 mb-8 max-w-md mx-auto">2 meses grátis. Sem cartão de crédito. Cancela quando quiser.</p>
        <Link
          href={dest}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 text-gray-900 font-bold text-base hover:from-emerald-300 hover:to-cyan-400 transition-all shadow-xl shadow-emerald-500/30"
        >
          Começar Agora
          <span className="text-lg">→</span>
        </Link>
      </section>

      <footer className="relative z-10 text-center text-white/20 text-xs py-6 border-t border-white/5">
        © 2026 Controle Estoque &amp; Vendas · Todos os direitos reservados
      </footer>
    </div>
  );
}
