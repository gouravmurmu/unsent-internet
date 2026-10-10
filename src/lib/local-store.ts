"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Mood, Note } from "@/lib/notes";

/**
 * Small wrapper around localStorage for things that only ever live in this
 * browser: drafts, saved notes and which notes you've already been kind to.
 * Every access is guarded because storage can be blocked or full.
 */

const PREFIX = "unsent:";
const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

export function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = readRaw(key);
  const hit = cache.get(key);
  // Return the same object for unchanged storage so useSyncExternalStore stays stable.
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  if (raw !== null) {
    try {
      value = JSON.parse(raw) as T;
    } catch {
      value = fallback;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

export function writeLocal<T>(key: string, value: T): boolean {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    listeners.forEach((l) => l());
    return true;
  } catch {
    return false;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key?.startsWith(PREFIX)) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useLocal<T>(key: string, fallback: T): [T, (next: T | ((prev: T) => T)) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => readLocal(key, fallback),
    () => fallback,
  );
  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = readLocal(key, fallback);
      writeLocal(key, typeof next === "function" ? (next as (p: T) => T)(prev) : next);
    },
    [key, fallback],
  );
  return [value, set];
}

// ---- Drafts ----------------------------------------------------------------

export type Draft = { id: string; body: string; mood: Mood | null; updatedAt: string };

const NO_DRAFTS: Draft[] = [];

export function useDrafts() {
  return useLocal<Draft[]>("drafts", NO_DRAFTS);
}

// ---- Saved notes -----------------------------------------------------------

const NO_SAVED: Note[] = [];

export function useSavedNotes() {
  const [saved, setSaved] = useLocal<Note[]>("saved", NO_SAVED);
  const isSaved = useCallback((id: string) => saved.some((n) => n.id === id), [saved]);
  const toggle = useCallback(
    (note: Note) =>
      setSaved((prev) => (prev.some((n) => n.id === note.id) ? prev.filter((n) => n.id !== note.id) : [note, ...prev])),
    [setSaved],
  );
  return { saved, isSaved, toggle, setSaved };
}

// ---- Reactions and reports you've made from this browser -------------------

const NO_IDS: string[] = [];

export function useIdList(key: "reacted" | "hidden") {
  const [ids, setIds] = useLocal<string[]>(key, NO_IDS);
  const has = useCallback((id: string) => ids.includes(id), [ids]);
  const add = useCallback((id: string) => setIds((prev) => (prev.includes(id) ? prev : [...prev, id])), [setIds]);
  return { ids, has, add };
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

// ---- Recovery code ---------------------------------------------------------

/** The private code that lets this writer find and take down their notes. */
export function useRecoveryCode() {
  return useLocal<string | null>("recovery-code", null);
}
