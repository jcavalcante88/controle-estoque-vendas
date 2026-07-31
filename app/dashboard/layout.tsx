import { auth } from '@/lib/auth';
import { checkAcesso } from '@/lib/acesso';
import { redirect } from 'next/navigation';
import { DashboardSidebar } from './sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const acesso = await checkAcesso(session.user.id);

  let trialInfo: string | undefined;
  if (acesso.motivo === 'trialing' && acesso.diasRestantesTrial !== null) {
    trialInfo = `Trial: ${acesso.diasRestantesTrial} dias restantes`;
  }

  return (
    <div className="flex min-h-screen bg-[#0f0500] relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="blob blob-1" style={{ opacity: 0.12 }} />
        <div className="blob blob-2" style={{ opacity: 0.08 }} />
      </div>
      <DashboardSidebar
        userName={session.user.name ?? session.user.email ?? 'Usuário'}
        trialInfo={trialInfo}
      />
      <main className="flex-1 p-4 pt-16 lg:p-8 overflow-auto min-h-screen relative z-10">
        {children}
      </main>
    </div>
  );
}
