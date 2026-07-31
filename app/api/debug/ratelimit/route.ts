import { NextResponse } from "next/server";

export async function GET() {
  const hasUrl = !!process.env.UPSTASH_REDIS_REST_URL;
  const hasToken = !!process.env.UPSTASH_REDIS_REST_TOKEN;

  const info: any = {
    env: process.env.NODE_ENV,
    hasUpstashUrl: hasUrl,
    hasUpstashToken: hasToken,
    url: hasUrl ? process.env.UPSTASH_REDIS_REST_URL!.substring(0, 30) + "..." : "NÃO CONFIGURADO",
    status: hasUrl && hasToken ? "✅ Variáveis encontradas" : "❌ Variáveis faltando",
  };

  try {
    if (hasUrl && hasToken) {
      const { Redis } = await import("@upstash/redis");
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });

      const ping = await redis.ping();
      info.redisStatus = ping ? "✅ Conectado ao Upstash" : "❌ Falha na conexão";
    }
  } catch (error) {
    info.error = `❌ Erro: ${error instanceof Error ? error.message : "Desconhecido"}`;
  }

  return NextResponse.json(info);
}
