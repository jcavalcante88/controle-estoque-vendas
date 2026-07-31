"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Erro ao enviar email");
        return;
      }

      setSent(true);
    } catch (err) {
      setError("Erro ao processar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/20 rounded-full mb-4">
            <span className="text-2xl">🔑</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Chaveiro Pro</h1>
          <p className="text-slate-400 mt-1">Recuperar Acesso</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur-sm">
          {!sent ? (
            <>
              <h2 className="text-xl font-semibold text-white mb-2">
                Esqueceu sua senha?
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                Digite seu email para receber um link de recuperação
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      required
                      className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-white font-medium rounded-lg transition"
                >
                  {loading ? "Enviando..." : "Enviar Link de Recuperação"}
                </button>
              </form>

              <div className="mt-4 pt-4 border-t border-slate-700">
                <Link
                  href="/login"
                  className="flex items-center justify-center text-slate-400 hover:text-white text-sm transition"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar para login
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                  <span className="text-2xl">✓</span>
                </div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Email Enviado!
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                  Verifique seu email ({email}) para obter o link de recuperação.
                  O link expira em 1 hora.
                </p>

                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-6">
                  <p className="text-blue-400 text-sm">
                    💡 Não recebeu? Verifique a pasta de spam/lixo
                  </p>
                </div>

                <Link
                  href="/login"
                  className="flex items-center justify-center bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 rounded-lg transition"
                >
                  Voltar para Login
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-4">
          © 2026 Chaveiro Pro. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
