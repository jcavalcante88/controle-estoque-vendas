'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function ConfiguracoesPage() {
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  async function handleCancelSubscription() {
    setCancelLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/settings/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erro ao cancelar assinatura');
        return;
      }

      setSuccess('Assinatura cancelada com sucesso!');
      setShowCancelConfirm(false);
    } finally {
      setCancelLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
        <p className="text-white/50">Gerencie suas preferências e conta</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {/* Assinatura */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Assinatura e Pagamento</h2>

        {showCancelConfirm ? (
          <div className="space-y-4">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-3">
              <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-medium text-sm mb-1">Tem certeza?</p>
                <p className="text-red-400/80 text-sm">Ao cancelar, você perderá acesso ao sistema no final do período de cobrança.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-2 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-colors text-sm font-medium"
              >
                Voltar
              </button>

              <button
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
                className="flex-1 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {cancelLoading && <Loader2 size={16} className="animate-spin" />}
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-white/60 text-sm">Cancele seu plano ou atualize seu método de pagamento.</p>

            <button
              onClick={() => setShowCancelConfirm(true)}
              className="w-full py-2.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium"
            >
              Cancelar Plano
            </button>

            <button
              disabled
              className="w-full py-2.5 rounded-lg border border-white/10 bg-white/5 text-white/40 cursor-not-allowed text-sm font-medium"
              title="Funcionalidade em desenvolvimento"
            >
              Atualizar Método de Pagamento
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
