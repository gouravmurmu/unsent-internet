import { getDb } from "@/server/db";
import { fail, fromError, ok, readJson, UUID_RE } from "@/server/http";
import { getVisitor } from "@/server/visitor";
import { REPORT_REASONS } from "@/lib/notes";

export async function POST(req: Request) {
  const db = getDb();
  if (!db) return fromError(new Error("not_configured"));
  const input = await readJson(req);
  if (input instanceof Response) return input;

  const kind = input.kind === "note" || input.kind === "reply" ? input.kind : null;
  const id = typeof input.id === "string" && UUID_RE.test(input.id) ? input.id : null;
  const reason = REPORT_REASONS.find((r) => r.id === input.reason)?.id;
  if (!kind || !id || !reason) return fail(400, "Something about that report didn't look right.");

  try {
    const visitor = await getVisitor();
    const { error } = await db.rpc("report_content", {
      p_type: kind,
      p_target: id,
      p_reason: reason,
      p_session: visitor.sessionHash,
      p_ip: visitor.ipHash,
    });
    if (error) return fromError(error);
    return ok({ reported: true });
  } catch (err) {
    return fromError(err);
  }
}
