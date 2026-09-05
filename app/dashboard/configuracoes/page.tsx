'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Loader2, Receipt } from 'lucide-react';

type Empresa = {
  empresaNome: string;
  empresaDocumento: string;
  empresaTelefone: string;
  empresaEndereco: string;
};

const EMPRESA_VAZIA: Empresa = {
  empresaNome: '',
  empresaDocumento: '',
  empresaTelefone: '',
  empresaEndereco: '',
};

export default function ConfiguracoesPage() {
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const [empresa, setEmpresa] = useState<Empresa>(EMPRESA_VAZIA);
  const [empresaLoading, setEmpresaLoading] = useState(true);
  const [empresaSaving, setEmpresaSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings/empresa')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setEmpresa({
            empresaNome: data.empresaNome ?? '',
            empresaDocumento: data.empresaDocumento ?? '',
            empresaTelefone: data.empresaTelefone ?? '',
            empresaEndereco: data.empresaEndereco ?? '',
          });
        }
      })
      .finally(() => setEmpresaLoading(false));
  }, []);

  async function handleSaveEmpresa() {
    setEmpresaSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/settings/empresa', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empresa),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erro ao salvar os dados do negócio');
        return;
      }

      setSuccess('Dados do recibo salvos!');
    } finally {
      setEmpresaSaving(false);
    }
  }

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

  const campo = (
    label: string,
    chave: keyof Empresa,
    placeholder: string
  ) => (
    <div>
      <label className="block text-xs text-white/50 mb-1.5">{label}</label>
      <input
        value={empresa[chave]}
        onChange={(e) => setEmpresa({ ...empresa, [chave]: e.target.value })}
        placeholder={placeholder}
        className="glass-input"
        style={{ paddingLeft: '12px' }}
      />
    </div>
  );

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

      {/* Dados do recibo */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
          <Receipt size={18} className="text-emerald-400" /> Dados do Recibo
        </h2>
        <p className="text-white/50 text-sm mb-5">
          Essas informações aparecem no cabeçalho do recibo que você entrega ao cliente.
        </p>

        {empresaLoading ? (
          <p className="text-white/40 text-sm py-4">Carregando...</p>
        ) : (
          <div className="space-y-4">
            {campo('Nome do negócio', 'empresaNome', 'Ex: Loja do Jerry')}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {campo('CNPJ ou CPF', 'empresaDocumento', '00.000.000/0000-00')}
              {campo('Telefone / WhatsApp', 'empresaTelefone', '(00) 00000-0000')}
            </div>
            {campo('Endereço', 'empresaEndereco', 'Rua, número, bairro, cidade')}

            <button
              onClick={handleSaveEmpresa}
              disabled={empresaSaving}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-gray-900 font-bold text-sm disabled:opacity-60 transition flex items-center justify-center gap-2"
            >
              {empresaSaving && <Loader2 size={16} className="animate-spin" />}
              Salvar dados
            </button>
          </div>
        )}
      </div>

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
