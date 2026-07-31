import { auth } from '@/lib/auth';
import { checkAcesso } from '@/lib/acesso';
import { redirect } from 'next/navigation';
import { EstoqueClient } from './client';

export default async function EstoquePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const acesso = await checkAcesso(session.user.id);
  if (!acesso.liberado) redirect('/dashboard');

  return <EstoqueClient />;
}
