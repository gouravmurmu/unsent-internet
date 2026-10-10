import { getDb } from "@/server/db";
import { fromError, ok, UUID_RE } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const db = getDb();
  if (!db) return fromError(new Error("not_configured"));
  const exclude = new URL(req.url).searchParams.get("exclude");
  const { data, error } = await db.rpc("random_note", { p_exclude: exclude && UUID_RE.test(exclude) ? exclude : null });
  if (error) return fromError(error);
  return ok({ note: data ?? null });
}
