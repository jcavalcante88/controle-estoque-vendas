import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkAcesso } from '@/lib/acesso';
import { sendReciboEmail } from '@/lib/email';
import type { ReciboData } from '@/lib/recibo';

// Envia o recibo da venda por e-mail para o cliente.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const acesso = await checkAcesso(session.user.id);
  if (!acesso.liberado) return NextResponse.json({ error: 'Assinatura inativa' }, { status: 402 });

  const { id } = await params;
  const { email } = (await req.json()) as { email?: string };

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: 'Informe um e-mail válido do cliente' }, { status: 400 });
  }

  const sale = await prisma.sale.findFirst({
    where: { id, userId: session.user.id },
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

  if (!sale) return NextResponse.json({ error: 'Venda não encontrada' }, { status: 404 });

  const data: ReciboData = {
    numero: sale.numero,
    token: sale.token,
    createdAt: sale.createdAt,
    total: sale.total,
    clienteNome: sale.clienteNome,
    clienteContato: sale.clienteContato,
    pagamento: sale.pagamento,
    empresa: {
      nome: sale.user.empresaNome || sale.user.name,
      documento: sale.user.empresaDocumento,
      telefone: sale.user.empresaTelefone,
      endereco: sale.user.empresaEndereco,
    },
    items: sale.items.map((i) => ({ nome: i.product.nome, qty: i.qty, price: i.price })),
  };

  try {
    await sendReciboEmail(email.trim(), data);
  } catch (error) {
    console.error('Erro ao enviar recibo por e-mail:', error);
    return NextResponse.json({ error: 'Não foi possível enviar o e-mail. Tente novamente.' }, { status: 502 });
  }

  // Guarda o contato usado, para o próximo envio já vir preenchido
  if (!sale.clienteContato) {
    await prisma.sale.update({ where: { id: sale.id }, data: { clienteContato: email.trim() } });
  }

  return NextResponse.json({ ok: true });
}
