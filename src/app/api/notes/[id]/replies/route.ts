import { getDb } from "@/server/db";
import { fail, fromError, ok, readJson, UUID_RE } from "@/server/http";
import { cleanText } from "@/server/text";
import { getVisitor } from "@/server/visitor";
import { validateReplyBody } from "@/lib/notes";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) return ok({ replies: [] });
  const db = getDb();
  if (!db) return fromError(new Error("not_configured"));
  const { data, error } = await db.rpc("list_replies", { p_note: id });
  if (error) return fromError(error);
  return ok({ replies: data });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) return fail(404, "That note isn't here anymore.");
  const db = getDb();
  if (!db) return fromError(new Error("not_configured"));
  const input = await readJson(req);
  if (input instanceof Response) return input;
  const body = cleanText(input.body);
  const problem = validateReplyBody(body);
  if (problem) return fail(400, problem);

  try {
    const visitor = await getVisitor();
    const { data, error } = await db.rpc("post_reply", {
      p_note: id,
      p_body: body,
      p_session: visitor.sessionHash,
      p_ip: visitor.ipHash,
    });
    if (error) return fromError(error);
    return ok({ reply: data }, 201);
  } catch (err) {
    return fromError(err);
  }
}
