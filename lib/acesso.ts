import { prisma } from "@/lib/prisma";

export type AcessoStatus = {
  liberado: boolean;
  motivo: "trialing" | "active" | "trial_expirado" | "sem_assinatura" | "pagamento_pendente" | "cancelado";
  diasRestantesTrial: number | null;
};

// Valor da assinatura mensal, em centavos (R$ 49,99).
export const PRECO_MENSAL_CENTAVOS = 4999;
export const PRECO_MENSAL_TEXTO = "R$ 49,99/mês";

// Dono do sistema: acesso liberado para sempre, sem trial nem cobrança.
// OWNER_EMAILS (separados por vírgula) na Vercel substitui a lista padrão.
const DONOS = (process.env.OWNER_EMAILS || "jerrycamargodores@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// Só vale se a conta estiver ligada ao Google: assim ninguém ganha o acesso
// do dono criando uma conta com senha usando o mesmo e-mail.
async function ehDono(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, accounts: { where: { provider: "google" }, select: { id: true } } },
  });
  if (!user?.email || user.accounts.length === 0) return false;
  return DONOS.includes(user.email.toLowerCase());
}

// Usado dentro das páginas do dashboard (Server Component) para decidir
// se o usuário pode usar o sistema ou se deve ser mandado pra tela de cobrança.
export async function checkAcesso(userId: string): Promise<AcessoStatus> {
  if (await ehDono(userId)) {
    return { liberado: true, motivo: "active", diasRestantesTrial: null };
  }

  const sub = await prisma.subscription.findUnique({ where: { userId } });

  if (!sub) {
    return { liberado: false, motivo: "sem_assinatura", diasRestantesTrial: null };
  }

  const agora = new Date();

  if (sub.status === "trialing" && sub.trialEndsAt) {
    const msRestante = sub.trialEndsAt.getTime() - agora.getTime();
    const diasRestantes = Math.ceil(msRestante / (1000 * 60 * 60 * 24));
    if (msRestante > 0) {
      return { liberado: true, motivo: "trialing", diasRestantesTrial: diasRestantes };
    }
    return { liberado: false, motivo: "trial_expirado", diasRestantesTrial: 0 };
  }

  if (sub.status === "active") {
    return { liberado: true, motivo: "active", diasRestantesTrial: null };
  }

  if (sub.status === "past_due") {
    return { liberado: false, motivo: "pagamento_pendente", diasRestantesTrial: null };
  }

  return { liberado: false, motivo: "cancelado", diasRestantesTrial: null };
}
