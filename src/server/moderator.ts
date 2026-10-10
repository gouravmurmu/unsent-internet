import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { serverSecret } from "@/server/db";

/**
 * A single shared moderator password (MODERATOR_PASSWORD), checked on the
 * server. Signing in sets a signed, short-lived cookie; changing the password
 * signs everyone out.
 */

export const MOD_COOKIE = "unsent_mod";
const SESSION_SECONDS = 60 * 60 * 12;

export function moderatorPassword(): string | null {
  const pw = process.env.MODERATOR_PASSWORD;
  return pw && pw.length >= 12 ? pw : null;
}

function sign(expires: number): string | null {
  const secret = serverSecret();
  const pw = moderatorPassword();
  if (!secret || !pw) return null;
  return createHmac("sha256", secret).update(`moderator:${pw}:${expires}`).digest("base64url");
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export async function startModeratorSession() {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const sig = sign(expires);
  if (!sig) return;
  (await cookies()).set(MOD_COOKIE, `${expires}.${sig}`, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/moderate",
    maxAge: SESSION_SECONDS,
  });
}

export async function endModeratorSession() {
  (await cookies()).delete({ name: MOD_COOKIE, path: "/moderate" });
}

export async function isModerator(): Promise<boolean> {
  const value = (await cookies()).get(MOD_COOKIE)?.value;
  if (!value) return false;
  const [exp, sig] = value.split(".");
  const expires = Number(exp);
  if (!sig || !Number.isInteger(expires) || expires < Date.now() / 1000) return false;
  const expected = sign(expires);
  return expected !== null && safeEqual(sig, expected);
}
