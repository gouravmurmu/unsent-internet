import { getDb } from "@/server/db";
import { fail, fromError, ok, readJson } from "@/server/http";
import { screenText } from "@/server/screening";
import { cleanText } from "@/server/text";
import { getVisitor, hashRecoveryCode, newRecoveryCode, normaliseRecoveryCode } from "@/server/visitor";
import { MOODS, validateNoteBody, type Mood } from "@/lib/notes";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const db = getDb();
  if (!db) return fromError(new Error("not_configured"));
  const url = new URL(req.url);
  const feed = url.searchParams.get("feed") === "kindness" ? "kindness" : "fresh";
  const moodParam = url.searchParams.get("mood");
  const mood = MOODS.includes(moodParam as Mood) ? moodParam : null;

  const { data, error } = await db.rpc("list_notes", { p_feed: feed, p_mood: mood, p_limit: 30 });
  if (error) return fromError(error);
  return ok({ notes: data });
}

export async function POST(req: Request) {
  const db = getDb();
  if (!db) return fromError(new Error("not_configured"));
  const input = await readJson(req);
  if (input instanceof Response) return input;

  // Honeypot: a field people never see, so only bots fill it in.
  if (input.website) return fail(400, "That couldn't be sent.");
  const body = cleanText(input.body);
  const problem = validateNoteBody(body);
  if (problem) return fail(400, problem);
  const screening = screenText(body);
  if (screening.block) return fail(400, screening.block);
  const mood = MOODS.includes(input.mood as Mood) ? (input.mood as Mood) : null;

  // Reuse the writer's existing recovery code if their browser sent one, so all
  // their notes can be found with a single code.
  const recoveryCode = normaliseRecoveryCode(input.recoveryCode) ?? newRecoveryCode();

  try {
    const visitor = await getVisitor();
    const { data, error } = await db.rpc("submit_note", {
      p_body: body,
      p_mood: mood,
      p_session: visitor.sessionHash,
      p_ip: visitor.ipHash,
      p_recovery_hash: hashRecoveryCode(recoveryCode),
      p_hold: screening.hold,
      p_flags: screening.flags,
    });
    if (error) return fromError(error);
    const { status, ...note } = data as { status: string };
    return ok({ note, recoveryCode, held: status !== "published", risk: screening.risk }, 201);
  } catch (err) {
    return fromError(err);
  }
}
