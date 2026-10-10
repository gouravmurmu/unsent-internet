"use client";

import { MOCK_NOTES, MOCK_REPLIES } from "@/lib/mock-notes";
import { newId, readLocal, writeLocal } from "@/lib/local-store";
import {
  validateNoteBody,
  validateReplyBody,
  type KindnessId,
  type Mood,
  type Note,
  type Reply,
  type ReportReason,
} from "@/lib/notes";

/**
 * The one place the UI talks to for notes, reactions, replies and reports.
 *
 * PROTOTYPE: everything here is backed by sample data plus this browser's
 * localStorage, so anything you publish is only visible to you. Step 3 swaps
 * these functions for calls to the server without changing their signatures.
 */

export type Feed = "fresh" | "kindness";

export class ApiError extends Error {}

const LATENCY_MS = 250;
const wait = () => new Promise((r) => setTimeout(r, LATENCY_MS));

type ProtoState = {
  notes: Note[];
  replies: Reply[];
  /** Extra kindness counts added from this browser, keyed by note id. */
  kindness: Record<string, number>;
};

const EMPTY_STATE: ProtoState = { notes: [], replies: [], kindness: {} };

function load(): ProtoState {
  return readLocal<ProtoState>("prototype", EMPTY_STATE);
}

function save(state: ProtoState) {
  writeLocal("prototype", state);
}

function allNotes(): Note[] {
  const state = load();
  const replies = allReplies();
  return [...state.notes, ...MOCK_NOTES].map((n) => ({
    ...n,
    kindnessCount: n.kindnessCount + (state.kindness[n.id] ?? 0),
    replyCount: replies.filter((r) => r.noteId === n.id).length,
  }));
}

function allReplies(): Reply[] {
  return [...MOCK_REPLIES, ...load().replies];
}

export async function listNotes(opts: { feed: Feed; mood: Mood | null }): Promise<Note[]> {
  await wait();
  let notes = allNotes();
  if (opts.mood) notes = notes.filter((n) => n.mood === opts.mood);
  if (opts.feed === "kindness") {
    // Notes that have had little or no response yet, oldest first so nobody waits too long.
    return notes
      .filter((n) => n.kindnessCount < 3 && n.replyCount === 0)
      .sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));
  }
  return notes.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function randomNote(excludeId?: string): Promise<Note | null> {
  await wait();
  const pool = allNotes().filter((n) => n.id !== excludeId);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function publishNote(input: { body: string; mood: Mood | null }): Promise<Note> {
  await wait();
  const problem = validateNoteBody(input.body);
  if (problem) throw new ApiError(problem);
  const note: Note = {
    id: newId(),
    body: input.body.trim(),
    mood: input.mood,
    publishedAt: new Date().toISOString(),
    kindnessCount: 0,
    replyCount: 0,
  };
  const state = load();
  save({ ...state, notes: [note, ...state.notes] });
  return note;
}

export async function sendKindness(noteId: string, reaction: KindnessId): Promise<void> {
  void reaction;
  await wait();
  const state = load();
  save({ ...state, kindness: { ...state.kindness, [noteId]: (state.kindness[noteId] ?? 0) + 1 } });
}

export async function listReplies(noteId: string): Promise<Reply[]> {
  await wait();
  return allReplies()
    .filter((r) => r.noteId === noteId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function postReply(noteId: string, body: string): Promise<Reply> {
  await wait();
  const problem = validateReplyBody(body);
  if (problem) throw new ApiError(problem);
  const reply: Reply = { id: newId(), noteId, body: body.trim(), createdAt: new Date().toISOString() };
  const state = load();
  save({ ...state, replies: [...state.replies, reply] });
  return reply;
}

export async function report(target: { kind: "note" | "reply"; id: string }, reason: ReportReason): Promise<void> {
  void target;
  void reason;
  // Not sent anywhere yet: reports reach the moderation queue in step 4.
  await wait();
}
