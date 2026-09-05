'use client';

import { useState } from 'react';
import { Printer, MessageCircle, Link2, Check } from 'lucide-react';

// Só dígitos: se o contato do cliente for um telefone, o WhatsApp já abre na conversa dele.
function linkWhatsApp(texto: string, contato?: string | null) {
  const digitos = (contato ?? '').replace(/\D/g, '');
  const numero = digitos.length >= 10 ? (digitos.length <= 11 ? `55${digitos}` : digitos) : '';
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

export function ReciboAcoes({
  url,
  numero,
  empresa,
  total,
  contatoCliente,
}: {
  url: string;
  numero: string;
  empresa: string;
  total: string;
  contatoCliente?: string | null;
}) {
  const [copiado, setCopiado] = useState(false);

  const texto = `Recibo ${numero} — ${empresa}\nTotal: ${total}\n\nVeja o recibo: ${url}`;

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      window.prompt('Copie o link do recibo:', url);
    }
  }

  return (
    <div className="no-print flex flex-wrap gap-2 mb-4">
      <button
        onClick={() => window.print()}
        className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition"
      >
        <Printer size={16} /> Imprimir / Salvar PDF
      </button>

      <a
        href={linkWhatsApp(texto, contatoCliente)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition"
      >
        <MessageCircle size={16} /> Enviar no WhatsApp
      </a>

      <button
        onClick={copiarLink}
        className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold hover:bg-slate-50 transition"
      >
        {copiado ? <Check size={16} className="text-emerald-600" /> : <Link2 size={16} />}
        {copiado ? 'Link copiado!' : 'Copiar link'}
      </button>
    </div>
  );
}
