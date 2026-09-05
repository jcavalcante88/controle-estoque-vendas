import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const CAMPOS = ['empresaNome', 'empresaDocumento', 'empresaTelefone', 'empresaEndereco'] as const;

// Dados que aparecem no cabeçalho do recibo entregue ao cliente.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      empresaNome: true,
      empresaDocumento: true,
      empresaTelefone: true,
      empresaEndereco: true,
    },
  });

  return NextResponse.json(user);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });

  const body = (await req.json()) as Record<string, unknown>;

  const data: Record<string, string | null> = {};
  for (const campo of CAMPOS) {
    const valor = body[campo];
    if (typeof valor === 'string') data[campo] = valor.trim().slice(0, 200) || null;
    else if (valor === null) data[campo] = null;
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: {
      empresaNome: true,
      empresaDocumento: true,
      empresaTelefone: true,
      empresaEndereco: true,
    },
  });

  return NextResponse.json(user);
}
