"use client";

import type { KindnessId, Mood, Note, Reply, ReportReason } from "@/lib/notes";

/**
 * The one place the UI talks to for notes, reactions, replies and reports.
 * Everything goes through this site's own /api routes; the browser never
 * talks to the database directly.
 */

export type Feed = "fresh" | "kindness";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function call<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: init?.method ?? "GET",
      headers: init?.body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ApiError("You seem to be offline. Check your connection and try again.", 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data?.error ?? "Something went wrong. Please try again.", res.status);
  return data as T;
}

export async function listNotes(opts: { feed: Feed; mood: Mood | null }): Promise<Note[]> {
  const qs = new URLSearchParams({ feed: opts.feed });
  if (opts.mood) qs.set("mood", opts.mood);
  return (await call<{ notes: Note[] }>(`/api/notes?${qs}`)).notes;
}

export async function randomNote(excludeId?: string): Promise<Note | null> {
  const qs = excludeId ? `?exclude=${encodeURIComponent(excludeId)}` : "";
  return (await call<{ note: Note | null }>(`/api/notes/random${qs}`)).note;
}

export async function publishNote(input: {
  body: string;
  mood: Mood | null;
  recoveryCode: string | null;
  website?: string;
}): Promise<{ note: Note; recoveryCode: string; held: boolean; risk: boolean }> {
  return call("/api/notes", { method: "POST", body: input });
}

export async function sendKindness(noteId: string, reaction: KindnessId): Promise<void> {
  await call(`/api/notes/${encodeURIComponent(noteId)}/kindness`, { method: "POST", body: { reaction } });
}

export async function listReplies(noteId: string): Promise<Reply[]> {
  return (await call<{ replies: Reply[] }>(`/api/notes/${encodeURIComponent(noteId)}/replies`)).replies;
}

export async function postReply(
  noteId: string,
  body: string,
  website = "",
): Promise<{ reply: Reply; held: boolean; risk: boolean }> {
  return call(`/api/notes/${encodeURIComponent(noteId)}/replies`, { method: "POST", body: { body, website } });
}

export async function report(target: { kind: "note" | "reply"; id: string }, reason: ReportReason): Promise<void> {
  await call("/api/reports", { method: "POST", body: { ...target, reason } });
}

export type OwnNote = Note & { status: "published" | "pending_review" | "hidden" };

export async function findMyNotes(code: string): Promise<OwnNote[]> {
  return (await call<{ notes: OwnNote[] }>("/api/recovery", { method: "POST", body: { code } })).notes;
}

export async function removeMyNote(code: string, id: string): Promise<void> {
  await call("/api/recovery/remove", { method: "POST", body: { code, id } });
}
