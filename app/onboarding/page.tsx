import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import OnboardingClient from "./onboarding-client";

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <OnboardingClient
      userId={session.user.id}
      userName={session.user.name || session.user.email || "Usuário"}
    />
  );
}
