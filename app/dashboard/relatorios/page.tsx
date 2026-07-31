import { auth } from '@/lib/auth';
import { checkAcesso } from '@/lib/acesso';
import { redirect } from 'next/navigation';
import { RelatoriosClient } from './client';

export default async function RelatoriosPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const acesso = await checkAcesso(session.user.id);
  if (!acesso.liberado) redirect('/dashboard');

  return <RelatoriosClient />;
}
