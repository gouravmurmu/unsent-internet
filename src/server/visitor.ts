import "server-only";
import { createHash, createHmac, randomBytes, randomUUID } from "node:crypto";
import { cookies, headers } from "next/headers";
import { serverSecret } from "@/server/db";

const COOKIE = "unsent_sid";
const ONE_YEAR = 60 * 60 * 24 * 365;

export type Visitor = {
  /** Keyed hash of the anonymous session cookie. Used for rate limits and one-kindness-per-note. */
  sessionHash: string;
  /** Keyed hash of the IP address, only used for rate limiting. Raw IPs are never stored. */
  ipHash: string | null;
};

function keyedHash(secret: string, value: string): string {
  return createHmac("sha256", secret).update(value).digest("base64url").slice(0, 32);
}

/**
 * Identify the visitor pseudonymously. Sets a random session cookie the first
 * time; it carries no personal information and isn't used for tracking.
 */
export async function getVisitor(): Promise<Visitor> {
  const secret = serverSecret();
  if (!secret) throw new Error("not_configured");

  const jar = await cookies();
  let sid = jar.get(COOKIE)?.value;
  if (!sid || !/^[0-9a-f-]{36}$/.test(sid)) {
    sid = randomUUID();
    jar.set(COOKIE, sid, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ONE_YEAR,
    });
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || null;

  return {
    sessionHash: keyedHash(secret, `sid:${sid}`),
    ipHash: ip ? keyedHash(secret, `ip:${ip}`) : null,
  };
}

// ---- Recovery codes --------------------------------------------------------

// Crockford-style alphabet: no I, L, O or U, so codes are easy to copy by hand.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export function newRecoveryCode(): string {
  const bytes = randomBytes(20);
  let out = "";
  for (const b of bytes) out += ALPHABET[b % 32];
  return out.match(/.{4}/g)!.join("-");
}

/** Uppercases and strips separators; returns null if it can't be a valid code. */
export function normaliseRecoveryCode(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const raw = input.toUpperCase().replace(/[\s-]/g, "");
  if (raw.length !== 20 || [...raw].some((c) => !ALPHABET.includes(c))) return null;
  return raw.match(/.{4}/g)!.join("-");
}

export function hashRecoveryCode(code: string): string {
  return createHash("sha256").update(`recovery:${code}`).digest("hex");
}
