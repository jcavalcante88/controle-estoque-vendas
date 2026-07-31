import Link from "next/link";
import { Key, Package, Boxes, ShoppingCart, BarChart3, Shield } from "lucide-react";
import { auth } from "@/lib/auth";

const features = [
  { icon: Package, title: "Produtos", desc: "Cadastro completo com custo, preço e margem automática" },
  { icon: Boxes, title: "Estoque", desc: "Controle de entradas e saídas com histórico detalhado" },
  { icon: ShoppingCart, title: "Vendas", desc: "Carrinho de compras com baixa automática no estoque" },
  { icon: BarChart3, title: "Relatórios", desc: "Vendas por dia, top produtos e estoque por categoria" },
  { icon: Shield, title: "Seguro", desc: "Dados isolados por cliente, acesso protegido por login" },
  { icon: Key, title: "Especializado", desc: "Feito sob medida para chaveiros e serralherias" },
];

export default async function HomePage() {
  // Se o usuário já estiver logado, os botões levam direto ao dashboard
  const session = await auth();
  const dest = session?.user?.id ? "/dashboard" : "/login";

  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden bg-[#0f0500]">
      {/* Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
            <Key size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg">Chaveiro Pro</span>
        </div>
        <Link
          href={dest}
          className="text-sm font-semibold text-amber-300 hover:text-amber-200 transition-colors"
        >
          Entrar →
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
          ✦ 2 meses grátis · Sem cartão de crédito
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight mb-6 max-w-2xl">
          Gestão completa para{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
            chaveiros
          </span>
        </h1>

        <p className="text-white/50 text-lg max-w-lg mb-4 leading-relaxed">
          Sem mais cadernos, planilhas ou perda de vendas. Seu estoque e suas vendas em um único lugar.
        </p>
        <p className="text-white/40 text-sm max-w-lg mb-10">
          Usado por chaveiros que querem parar de perder dinheiro e começar a lucrar mais.
        </p>

        <Link
          href={dest}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 font-bold text-base hover:from-amber-300 hover:to-amber-400 transition-all shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:-translate-y-0.5 duration-200"
        >
          {session?.user?.id ? "Ir para o painel" : "Começar grátis"}
          <span className="text-lg">→</span>
        </Link>

        {/* Vídeo Demo */}
        <div className="w-full max-w-2xl mt-16 mb-20 rounded-3xl overflow-hidden shadow-2xl shadow-amber-500/20 border border-amber-500/10">
          <iframe
            width="100%"
            height="400"
            src="https://www.youtube.com/embed/O_WJdzyA7HM"
            title="Demo Chaveiro Pro"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="rounded-3xl"
          />
        </div>


        {/* Cards de features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full mt-8">
          {features.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className="glass-card p-5 text-left hover:-translate-y-1 transition-transform duration-300"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3">
                <Icon size={18} className="text-amber-400" />
              </div>
              <h3 className="text-white font-semibold mb-1">{title}</h3>
              <p className="text-white/40 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative z-10 bg-gradient-to-r from-amber-500/5 to-amber-600/5 border-t border-amber-500/10 py-16 px-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Pronto para parar de perder dinheiro?</h2>
        <p className="text-white/50 mb-8 max-w-md mx-auto">2 meses grátis. Sem cartão de crédito. Cancela quando quiser.</p>
        <Link
          href={dest}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 font-bold text-base hover:from-amber-300 hover:to-amber-400 transition-all shadow-xl shadow-amber-500/30"
        >
          Começar Agora
          <span className="text-lg">→</span>
        </Link>
      </section>

      <footer className="relative z-10 text-center text-white/20 text-xs py-6 border-t border-white/5">
        © 2026 Chaveiro Pro · Todos os direitos reservados
      </footer>
    </div>
  );
}
