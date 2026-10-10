import { getDb } from "@/server/db";
import { fail, fromError, ok, readJson, UUID_RE } from "@/server/http";
import { getVisitor } from "@/server/visitor";
import { KINDNESS_REACTIONS } from "@/lib/notes";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) return fail(404, "That note isn't here anymore.");
  const db = getDb();
  if (!db) return fromError(new Error("not_configured"));
  const input = await readJson(req);
  if (input instanceof Response) return input;
  const reaction = KINDNESS_REACTIONS.find((r) => r.id === input.reaction);
  if (!reaction) return fail(400, "Pick one of the kind words.");

  try {
    const visitor = await getVisitor();
    const { error } = await db.rpc("send_kindness", {
      p_note: id,
      p_kind: reaction.id,
      p_session: visitor.sessionHash,
      p_ip: visitor.ipHash,
    });
    if (error) return fromError(error);
    return ok({ sent: true });
  } catch (err) {
    return fromError(err);
  }
}
