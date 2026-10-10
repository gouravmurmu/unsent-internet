import { getDb } from "@/server/db";
import { fail, fromError, ok, readJson } from "@/server/http";
import { getVisitor, hashRecoveryCode, normaliseRecoveryCode } from "@/server/visitor";

/** Look up the notes published with a recovery code. POST so the code never appears in URLs or logs. */
export async function POST(req: Request) {
  const db = getDb();
  if (!db) return fromError(new Error("not_configured"));
  const input = await readJson(req);
  if (input instanceof Response) return input;
  const code = normaliseRecoveryCode(input.code);
  if (!code) return fail(400, "That doesn't look like a recovery code. It's 20 letters and numbers.");

  try {
    const visitor = await getVisitor();
    const { data, error } = await db.rpc("notes_for_recovery", {
      p_recovery_hash: hashRecoveryCode(code),
      p_ip: visitor.ipHash ?? visitor.sessionHash,
    });
    if (error) return fromError(error);
    return ok({ notes: data });
  } catch (err) {
    return fromError(err);
  }
}
