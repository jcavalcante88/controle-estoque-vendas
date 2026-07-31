import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerLimiter } from "@/lib/ratelimit";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  // Rate limiting: máximo 3 cadastros por hora por email
  const { success } = await registerLimiter.limit(`register:${email}`);

  if (!success) {
    return NextResponse.json(
      { error: "Muitas tentativas de cadastro neste email. Tente novamente em 1 hora." },
      { status: 429 }
    );
  }

  if (!email || !password) {
    return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Senha deve ter ao menos 6 caracteres" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Este email já está cadastrado" }, { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name: name || email.split("@")[0],
      email,
      password: hashed,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
