import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import LoginForm from './login-form';

export default async function LoginPage() {
  // Se já estiver logado, vai direto para o painel (não força login/cadastro de novo)
  const session = await auth();
  if (session?.user?.id) redirect('/dashboard');

  return <LoginForm />;
}
