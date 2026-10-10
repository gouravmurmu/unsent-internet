import "server-only";
import { NextResponse } from "next/server";

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export function fail(status: number, message: string) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

const MESSAGES: Record<string, [number, string]> = {
  not_configured: [503, "The mailbox isn't open yet. Please try again a little later."],
  rate_limited: [429, "That's a lot of mail at once. Take a breath and try again in a little while."],
  duplicate: [409, "You've already sent this exact note."],
  not_found: [404, "That note isn't here anymore."],
  invalid: [400, "Something about that request didn't look right."],
};

/** Maps database and setup errors to friendly responses without leaking details. */
export function fromError(err: unknown) {
  const text = err instanceof Error ? err.message : typeof err === "object" && err && "message" in err ? String(err.message) : "";
  for (const key of Object.keys(MESSAGES)) {
    if (text.includes(key)) return fail(...MESSAGES[key]);
  }
  if (/check constraint/.test(text)) return fail(400, "That doesn't fit. Please check the length and try again.");
  console.error("api error", text);
  return fail(500, "Something went wrong on our side. Please try again.");
}

/**
 * Reads a small JSON body from a same-origin request. Cross-site form posts
 * and oversized bodies are refused.
 */
export async function readJson(req: Request, maxBytes = 8_000): Promise<Record<string, unknown> | Response> {
  const origin = req.headers.get("origin");
  if (origin) {
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
    try {
      if (new URL(origin).host !== host) return fail(403, "Requests must come from this site.");
    } catch {
      return fail(403, "Requests must come from this site.");
    }
  }
  if (!req.headers.get("content-type")?.includes("application/json")) return fail(415, "Expected JSON.");
  const text = await req.text();
  if (text.length > maxBytes) return fail(413, "That's too long to send.");
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : fail(400, "Expected a JSON object.");
  } catch {
    return fail(400, "That request couldn't be read.");
  }
}
