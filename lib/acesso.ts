import { prisma } from "@/lib/prisma";

export type AcessoStatus = {
  liberado: boolean;
  motivo: "trialing" | "active" | "trial_expirado" | "sem_assinatura" | "pagamento_pendente" | "cancelado";
  diasRestantesTrial: number | null;
};

// Usado dentro das páginas do dashboard (Server Component) para decidir
// se o usuário pode usar o sistema ou se deve ser mandado pra tela de cobrança.
export async function checkAcesso(userId: string): Promise<AcessoStatus> {
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
