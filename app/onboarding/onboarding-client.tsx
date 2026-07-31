"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, CheckCircle2, Loader2 } from "lucide-react";

interface OnboardingClientProps {
  userId: string;
  userName: string;
}

export default function OnboardingClient({ userName }: OnboardingClientProps) {
  const [step, setStep] = useState<"intro" | "product" | "sale" | "done">("intro");
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [cost, setCost] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreateProduct() {
    if (!productName || !price || !cost) {
      alert("Preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: productName,
          categoria: "Exemplo",
          preco: parseFloat(price),
          custo: parseFloat(cost),
          estoque: 10,
          minimo: 2,
        }),
      });

      if (res.ok) {
        setStep("sale");
      } else {
        alert("Erro ao criar produto");
      }
    } catch (error) {
      alert("Erro ao criar produto");
    } finally {
      setLoading(false);
    }
  }

  const marginValue = price && cost ? (parseFloat(price) - parseFloat(cost)) / parseFloat(price) * 100 : 0;
  const margin = marginValue > 0 ? marginValue.toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0500] to-[#1a0e04] flex flex-col items-center justify-center px-6 py-12">
      <div className="max-w-2xl w-full">

        {/* INTRO */}
        {step === "intro" && (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-white">Bem-vindo, {userName}! 👋</h1>
              <p className="text-lg text-white/60">Vamos configurar em 2 minutos e você já vê o poder do sistema.</p>
            </div>

            <div className="space-y-4 text-left bg-white/5 border border-white/10 rounded-2xl p-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">1</div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Cadastre seu primeiro produto</h3>
                  <p className="text-white/60 text-sm">Em 20 segundos. Escolha qualquer chave da sua loja.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">2</div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Registre uma venda</h3>
                  <p className="text-white/60 text-sm">O estoque baixa sozinho e você vê quanto ganhou.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 font-bold">3</div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Aproveite o trial</h3>
                  <p className="text-white/60 text-sm">2 meses completos pra testar antes de pagar.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep("product")}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 font-bold text-base hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
            >
              Começar agora
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* PRODUCT STEP */}
        {step === "product" && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Cadastre seu primeiro produto</h2>
              <p className="text-white/60">Pode ser qualquer chave, cópia ou material que você vende.</p>
            </div>

            <div className="space-y-4 bg-white/5 border border-white/10 rounded-2xl p-8">
              <div>
                <label className="block text-white font-semibold mb-2">Nome do produto</label>
                <input
                  type="text"
                  placeholder="Ex: Chave tetra inox"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-semibold mb-2">Custo (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.50"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-white font-semibold mb-2">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="2.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {marginValue > 0 && (
                <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 text-center">
                  <p className="text-white/60 text-sm">Sua margem de lucro:</p>
                  <p className="text-3xl font-bold text-green-400">{margin}%</p>
                </div>
              )}

              <button
                onClick={handleCreateProduct}
                disabled={loading || !productName || !price || !cost}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 font-bold hover:from-amber-300 hover:to-amber-400 disabled:opacity-60 transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    Próximo
                    <ChevronRight size={20} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* SALE STEP */}
        {step === "sale" && (
          <div className="space-y-8 text-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Agora registre uma venda!</h2>
              <p className="text-white/60">Vá em "Vendas" no painel e adicione esse produto ao carrinho.</p>
            </div>

            <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border border-amber-500/30 rounded-2xl p-8 space-y-4">
              <p className="text-white/80">👇 O que vai acontecer:</p>
              <ul className="space-y-3 text-left text-white/70">
                <li className="flex gap-3">
                  <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />
                  <span>O estoque <b>baixa automaticamente</b></span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />
                  <span>Você vê o <b>lucro da venda</b> na hora</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />
                  <span><b>Sem digitação errada</b>, tudo automático</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <Link
                href="/dashboard/vendas"
                className="inline-flex w-full items-center justify-center gap-2 py-3 px-8 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 font-bold hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/30"
              >
                Ir para Vendas
                <ChevronRight size={20} />
              </Link>
              <button
                onClick={() => setStep("done")}
                className="w-full py-3 text-white/60 hover:text-white/80 transition-colors"
              >
                Pular e voltar depois
              </button>
            </div>
          </div>
        )}

        {/* DONE */}
        {step === "done" && (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-400 flex items-center justify-center mx-auto">
                <CheckCircle2 size={40} className="text-green-400" />
              </div>
              <h1 className="text-3xl font-bold text-white">Você está pronto! 🎉</h1>
              <p className="text-lg text-white/60">Agora explore o sistema completo. Você tem 2 meses para testar tudo.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3 text-left">
              <p className="text-white/60 text-sm">📍 O que você pode fazer:</p>
              <ul className="space-y-2 text-white/70 text-sm">
                <li>• Cadastrar mais produtos em "Produtos"</li>
                <li>• Ver relatórios de vendas em "Relatórios"</li>
                <li>• Controlar estoque em "Estoque"</li>
                <li>• Mudar suas preferências em "Configurações"</li>
              </ul>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex w-full items-center justify-center gap-2 py-3 px-8 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 font-bold hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/30"
            >
              Ir ao Dashboard
              <ChevronRight size={20} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
