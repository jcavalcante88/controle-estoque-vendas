import { prisma } from "@/lib/prisma";

async function resetAllTrials() {
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 60);

  const result = await prisma.subscription.updateMany({
    data: { trialEndsAt, status: "trialing" },
  });

  console.log(`✅ ${result.count} usuários tiveram o trial resetado para ${trialEndsAt.toLocaleDateString('pt-BR')}`);
  console.log(`📅 Novo trial expira em: ${trialEndsAt.toLocaleDateString('pt-BR')} às ${trialEndsAt.toLocaleTimeString('pt-BR')}`);
  process.exit(0);
}

resetAllTrials().catch((err) => {
  console.error("❌ Erro:", err.message);
  process.exit(1);
});
