import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const headersList = await headers();
  
  const ip = headersList.get("x-forwarded-for") || "127.0.0.1";
  
  return NextResponse.json({
    ip,
    "x-forwarded-for": headersList.get("x-forwarded-for"),
    "cf-connecting-ip": headersList.get("cf-connecting-ip"),
    "x-real-ip": headersList.get("x-real-ip"),
  });
}
