import { getDb } from "@/server/db";
import { fail, fromError, ok, readJson, UUID_RE } from "@/server/http";
import { hashRecoveryCode, normaliseRecoveryCode } from "@/server/visitor";

/** Take down one of your own notes, proven by its recovery code. */
export async function POST(req: Request) {
  const db = getDb();
  if (!db) return fromError(new Error("not_configured"));
  const input = await readJson(req);
  if (input instanceof Response) return input;
  const code = normaliseRecoveryCode(input.code);
  const id = typeof input.id === "string" && UUID_RE.test(input.id) ? input.id : null;
  if (!code || !id) return fail(400, "Something about that request didn't look right.");

  const { data, error } = await db.rpc("remove_own_note", { p_note: id, p_recovery_hash: hashRecoveryCode(code) });
  if (error) return fromError(error);
  if (!data) return fail(404, "That note couldn't be found with this code.");
  return ok({ removed: true });
}
