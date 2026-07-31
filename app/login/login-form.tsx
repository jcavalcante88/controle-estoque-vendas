'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, Loader2, Key, Mail, Lock, User } from 'lucide-react';
import Link from 'next/link';

export default function LoginForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  function set(field: string, val: string) {
    setForm((f) => ({ ...f, [field]: val }));
    setError('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'register') {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.error ?? 'Erro ao criar conta');
          return;
        }
      }

      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        callbackUrl: '/dashboard',
        redirect: false,
      });

      if (result?.error) {
        setError('Email ou senha incorretos');
      } else if (result?.url) {
        window.location.href = result.url;
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSocial(provider: string) {
    setSocialLoading(provider);
    await signIn(provider, { callbackUrl: '/dashboard' });
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#0f0500]">
      {/* Blobs animados */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      {/* Card glassmorphism */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30 mb-4">
            <Key size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Chaveiro Pro</h1>
          <p className="text-amber-200/60 text-sm mt-1">Sistema de Gestão</p>
        </div>

        <div className="glass-card p-8">
          {/* Tabs */}
          <div className="flex rounded-xl bg-white/5 p-1 mb-7">
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(''); }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    mode === m
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  {m === 'login' ? 'Entrar' : 'Criar conta'}
                </button>
              ))}
            </div>

          <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="glass-input-wrap">
                  <User size={16} className="glass-input-icon" />
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    className="glass-input"
                  />
                </div>
              )}

              <div className="glass-input-wrap">
                <Mail size={16} className="glass-input-icon" />
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  required
                  className="glass-input"
                />
              </div>

              <div className="glass-input-wrap">
                <Lock size={16} className="glass-input-icon" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Senha"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  required
                  className="glass-input pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {error && (
                <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-gray-900 font-bold text-sm hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/30 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {mode === 'login' ? 'Entrar' : 'Criar conta grátis'}
              </button>

              {mode === 'login' && (
                <div className="text-center">
                  <Link href="/forgot-password" className="text-amber-400 hover:text-amber-300 text-sm transition-colors">
                    Esqueceu sua senha?
                  </Link>
                </div>
              )}
            </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs">ou continue com</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Social */}
          <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleSocial('google')}
                  disabled={!!socialLoading}
                  className="social-btn"
                >
                  {socialLoading === 'google' ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"/>
                      <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"/>
                      <path fill="#4A90D9" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/>
                      <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"/>
                    </svg>
                  )}
                  Google
                </button>
                <button
                  onClick={() => handleSocial('github')}
                  disabled={!!socialLoading}
                  className="social-btn"
                >
                  {socialLoading === 'github' ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                    </svg>
                  )}
                  GitHub
                </button>
              </div>

          {mode === 'register' && (
            <p className="text-center text-white/30 text-xs mt-6">
              2 meses grátis · Sem cartão de crédito
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
