// Dados e formatação do recibo de venda.
// Usado tanto pela página pública (/recibo/[token]) quanto pelo e-mail enviado ao cliente.

export type ReciboItem = {
  nome: string;
  qty: number;
  price: number;
};

export type ReciboEmpresa = {
  nome?: string | null;
  documento?: string | null;
  telefone?: string | null;
  endereco?: string | null;
};

export type ReciboData = {
  numero: number;
  token: string;
  createdAt: Date | string;
  total: number;
  clienteNome?: string | null;
  clienteContato?: string | null;
  pagamento?: string | null;
  empresa: ReciboEmpresa;
  items: ReciboItem[];
};

export const PAGAMENTOS = [
  { valor: 'dinheiro', label: 'Dinheiro' },
  { valor: 'pix', label: 'PIX' },
  { valor: 'debito', label: 'Cartão de débito' },
  { valor: 'credito', label: 'Cartão de crédito' },
  { valor: 'outro', label: 'Outro' },
] as const;

export const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const fmtDataHora = (d: Date | string) =>
  new Date(d).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export const numeroRecibo = (n: number) => `#${String(n).padStart(4, '0')}`;

export const pagamentoLabel = (valor?: string | null) =>
  PAGAMENTOS.find((p) => p.valor === valor)?.label ?? null;

export function reciboUrl(token: string) {
  const base =
    process.env.NEXTAUTH_URL?.replace(/\/$/, '') ||
    'https://controle-estoque-vendas.vercel.app';
  return `${base}/recibo/${token}`;
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Versão HTML do recibo para envio por e-mail (tabelas + estilo inline: clientes de e-mail
// não entendem flex/grid nem folhas de estilo externas).
export function reciboEmailHtml(data: ReciboData): string {
  const empresaNome = data.empresa.nome || 'Recibo de compra';
  const linhaEmpresa = [data.empresa.documento, data.empresa.telefone, data.empresa.endereco]
    .filter(Boolean)
    .map((t) => esc(String(t)))
    .join(' &middot; ');

  const itens = data.items
    .map(
      (i) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;">
            ${esc(i.nome)}<br />
            <span style="color:#6b7280;font-size:12px;">${i.qty} × ${fmtBRL(i.price)}</span>
          </td>
          <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;text-align:right;white-space:nowrap;">
            ${fmtBRL(i.price * i.qty)}
          </td>
        </tr>`
    )
    .join('');

  const pagamento = pagamentoLabel(data.pagamento);
  const linhas: string[] = [`<strong>Data:</strong> ${fmtDataHora(data.createdAt)}`];
  if (data.clienteNome) linhas.push(`<strong>Cliente:</strong> ${esc(data.clienteNome)}`);
  if (pagamento) linhas.push(`<strong>Pagamento:</strong> ${esc(pagamento)}`);

  return `<!DOCTYPE html>
<html lang="pt-BR">
  <body style="margin:0;padding:24px;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
      <tr>
        <td style="background:#070d14;padding:24px;">
          <p style="margin:0;color:#34d399;font-size:20px;font-weight:bold;">${esc(empresaNome)}</p>
          ${linhaEmpresa ? `<p style="margin:6px 0 0;color:#9ca3af;font-size:12px;">${linhaEmpresa}</p>` : ''}
        </td>
      </tr>
      <tr>
        <td style="padding:24px;">
          <p style="margin:0 0 4px;color:#6b7280;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Recibo ${numeroRecibo(data.numero)}</p>
          <p style="margin:0 0 20px;color:#374151;font-size:13px;line-height:1.7;">${linhas.join('<br />')}</p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            ${itens}
            <tr>
              <td style="padding:16px 0 0;color:#111827;font-size:16px;font-weight:bold;">Total</td>
              <td style="padding:16px 0 0;color:#059669;font-size:20px;font-weight:bold;text-align:right;">${fmtBRL(data.total)}</td>
            </tr>
          </table>

          <p style="margin:24px 0 0;text-align:center;">
            <a href="${reciboUrl(data.token)}" style="background:#10b981;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block;">Ver recibo online</a>
          </p>
        </td>
      </tr>
      <tr>
        <td style="background:#f3f4f6;padding:16px;text-align:center;color:#6b7280;font-size:11px;">
          Obrigado pela preferência! Este recibo comprova a compra realizada.
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
