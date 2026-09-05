import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { fmtBRL, fmtDataHora, numeroRecibo, pagamentoLabel, reciboUrl } from '@/lib/recibo';
import { ReciboAcoes } from './recibo-acoes';

export const dynamic = 'force-dynamic';

// Página pública: quem tem o link vê o recibo, sem precisar de login.
// O token é aleatório e único por venda.
export default async function ReciboPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const sale = await prisma.sale.findUnique({
    where: { token },
    include: {
      items: { include: { product: { select: { nome: true } } } },
      user: {
        select: {
          name: true,
          empresaNome: true,
          empresaDocumento: true,
          empresaTelefone: true,
          empresaEndereco: true,
        },
      },
    },
  });

  if (!sale) notFound();

  const empresaNome = sale.user.empresaNome || sale.user.name || 'Recibo de compra';
  const subtitulo = [sale.user.empresaDocumento, sale.user.empresaTelefone, sale.user.empresaEndereco]
    .filter(Boolean)
    .join(' · ');
  const pagamento = pagamentoLabel(sale.pagamento);

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 print:bg-white print:p-0">
      <div className="max-w-lg mx-auto">
        <ReciboAcoes
          url={reciboUrl(sale.token)}
          numero={numeroRecibo(sale.numero)}
          empresa={empresaNome}
          total={fmtBRL(sale.total)}
          contatoCliente={sale.clienteContato}
        />

        <div className="recibo-page bg-white rounded-2xl shadow-lg overflow-hidden print:shadow-none print:rounded-none">
          {/* Cabeçalho do negócio */}
          <div className="bg-slate-900 text-white px-7 py-6 print:bg-slate-900">
            <h1 className="text-xl font-bold text-emerald-400">{empresaNome}</h1>
            {subtitulo && <p className="text-xs text-slate-400 mt-1.5">{subtitulo}</p>}
          </div>

          <div className="px-7 py-6">
            <div className="flex justify-between items-start pb-5 border-b border-slate-200">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Recibo</p>
                <p className="text-2xl font-bold text-slate-900 tabular-nums">{numeroRecibo(sale.numero)}</p>
              </div>
              <div className="text-right text-xs text-slate-500 leading-relaxed">
                <p>{fmtDataHora(sale.createdAt)}</p>
                {pagamento && <p className="mt-1">Pagamento: {pagamento}</p>}
              </div>
            </div>

            {(sale.clienteNome || sale.clienteContato) && (
              <div className="py-4 border-b border-slate-200">
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">Cliente</p>
                {sale.clienteNome && <p className="text-sm font-medium text-slate-900">{sale.clienteNome}</p>}
                {sale.clienteContato && <p className="text-xs text-slate-500">{sale.clienteContato}</p>}
              </div>
            )}

            {/* Itens */}
            <table className="w-full mt-5">
              <thead>
                <tr className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  <th className="text-left pb-2">Item</th>
                  <th className="text-center pb-2 w-14">Qtd</th>
                  <th className="text-right pb-2 w-24">Valor</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="py-2.5 text-sm text-slate-900">
                      {item.product.nome}
                      <span className="block text-xs text-slate-400">{fmtBRL(item.price)} / un</span>
                    </td>
                    <td className="py-2.5 text-sm text-slate-600 text-center tabular-nums">{item.qty}</td>
                    <td className="py-2.5 text-sm font-medium text-slate-900 text-right tabular-nums">
                      {fmtBRL(item.price * item.qty)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center mt-5 pt-4 border-t-2 border-slate-900">
              <span className="font-semibold text-slate-900">Total</span>
              <span className="text-2xl font-bold text-emerald-600 tabular-nums">{fmtBRL(sale.total)}</span>
            </div>

            <p className="text-center text-xs text-slate-400 mt-8">
              Obrigado pela preferência! Este documento comprova a compra realizada.
            </p>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 mt-4 no-print">
          Recibo gerado por Controle Estoque &amp; Vendas
        </p>
      </div>
    </div>
  );
}
