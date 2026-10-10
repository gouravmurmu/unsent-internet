"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb } from "@/server/db";
import { UUID_RE } from "@/server/http";
import {
  endModeratorSession,
  isModerator,
  moderatorPassword,
  safeEqual,
  startModeratorSession,
} from "@/server/moderator";
import { getVisitor } from "@/server/visitor";

export async function login(formData: FormData) {
  const db = getDb();
  const pw = moderatorPassword();
  if (!db || !pw) redirect("/moderate");

  // Slow down guessing: 5 tries per browser and 20 per network every 15 minutes.
  const visitor = await getVisitor();
  const { error } = await db.rpc("enforce_rate_limit", {
    p_action: "moderator_login",
    p_session: visitor.sessionHash,
    p_ip: visitor.ipHash,
    p_session_limit: 5,
    p_ip_limit: 20,
    p_window: "15 minutes",
  });
  if (error) redirect("/moderate?e=wait");

  const attempt = formData.get("password");
  if (typeof attempt !== "string" || !safeEqual(attempt, pw)) redirect("/moderate?e=wrong");

  await startModeratorSession();
  redirect("/moderate");
}

export async function logout() {
  await endModeratorSession();
  redirect("/moderate");
}

export async function moderate(formData: FormData) {
  if (!(await isModerator())) redirect("/moderate");
  const db = getDb();
  if (!db) redirect("/moderate");

  const kind = formData.get("kind");
  const id = formData.get("id");
  const action = formData.get("decision");
  if (
    (kind !== "note" && kind !== "reply") ||
    typeof id !== "string" ||
    !UUID_RE.test(id) ||
    (action !== "approve" && action !== "hide" && action !== "remove")
  ) {
    redirect("/moderate?e=invalid");
  }

  const { error } = await db.rpc("moderate", { p_type: kind, p_target: id, p_action: action, p_actor: "moderator" });
  if (error) {
    console.error("moderate failed", error.message);
    redirect("/moderate?e=failed");
  }
  revalidatePath("/moderate");
  redirect("/moderate?done=" + action);
}
