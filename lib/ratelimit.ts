import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Mock para desenvolvimento (quando Upstash não está configurado)
class MockRatelimit {
  async limit(_key: string) {
    console.warn("⚠️ Rate limiting DESATIVADO (usando mock). Configure UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN");
    return { success: true };
  }
}

let loginLimiterInstance: Ratelimit | MockRatelimit | null = null;
let registerLimiterInstance: Ratelimit | MockRatelimit | null = null;
let passwordResetLimiterInstance: Ratelimit | MockRatelimit | null = null;

function initLoginLimiter() {
  if (loginLimiterInstance) return loginLimiterInstance;

  const hasUrl = !!process.env.UPSTASH_REDIS_REST_URL;
  const hasToken = !!process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!hasUrl || !hasToken) {
    console.warn("❌ Upstash não configurado. Rate limiting DESATIVADO!");
    loginLimiterInstance = new MockRatelimit();
    return loginLimiterInstance;
  }

  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    loginLimiterInstance = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "15 m"),
      analytics: true,
      prefix: "ratelimit:login",
    });

    console.log("✅ Rate limiting ATIVADO - Login");
  } catch (error) {
    console.error("❌ Erro ao conectar Upstash (login):", error);
    loginLimiterInstance = new MockRatelimit();
  }

  return loginLimiterInstance;
}

function initRegisterLimiter() {
  if (registerLimiterInstance) return registerLimiterInstance;

  const hasUrl = !!process.env.UPSTASH_REDIS_REST_URL;
  const hasToken = !!process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!hasUrl || !hasToken) {
    console.warn("❌ Upstash não configurado. Rate limiting DESATIVADO!");
    registerLimiterInstance = new MockRatelimit();
    return registerLimiterInstance;
  }

  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    registerLimiterInstance = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 h"),
      analytics: true,
      prefix: "ratelimit:register",
    });

    console.log("✅ Rate limiting ATIVADO - Register");
  } catch (error) {
    console.error("❌ Erro ao conectar Upstash (register):", error);
    registerLimiterInstance = new MockRatelimit();
  }

  return registerLimiterInstance;
}

function initPasswordResetLimiter() {
  if (passwordResetLimiterInstance) return passwordResetLimiterInstance;

  const hasUrl = !!process.env.UPSTASH_REDIS_REST_URL;
  const hasToken = !!process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!hasUrl || !hasToken) {
    console.warn("❌ Upstash não configurado. Rate limiting DESATIVADO!");
    passwordResetLimiterInstance = new MockRatelimit();
    return passwordResetLimiterInstance;
  }

  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    passwordResetLimiterInstance = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "30 m"),
      analytics: true,
      prefix: "ratelimit:password-reset",
    });

    console.log("✅ Rate limiting ATIVADO - Password Reset");
  } catch (error) {
    console.error("❌ Erro ao conectar Upstash (password reset):", error);
    passwordResetLimiterInstance = new MockRatelimit();
  }

  return passwordResetLimiterInstance;
}

export const loginLimiter = {
  limit: async (key: string) => initLoginLimiter().limit(key),
};

export const registerLimiter = {
  limit: async (key: string) => initRegisterLimiter().limit(key),
};

export const passwordResetLimiter = {
  limit: async (key: string) => initPasswordResetLimiter().limit(key),
};
