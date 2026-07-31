import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { theme } = await req.json();

  if (!["light", "dark"].includes(theme)) {
    return NextResponse.json({ error: "Tema inválido" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { theme },
  });

  return NextResponse.json({ ok: true, theme }, { status: 200 });
}
