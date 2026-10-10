"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { NoteCard } from "@/components/note-card";
import { EmptyState, ErrorState, NoteGridSkeleton } from "@/components/note-states";
import { listNotes, type Feed } from "@/lib/api";
import { MOOD_META, MOODS, type Mood, type Note } from "@/lib/notes";
import { LostAndFound } from "./lost-and-found";

type View = Feed | "lost";

const VIEWS: { id: View; label: string; blurb: string }[] = [
  { id: "fresh", label: "Fresh Notes", blurb: "The newest notes, as they arrive." },
  { id: "lost", label: "Lost & Found", blurb: "One note, picked at random, just for you." },
  { id: "kindness", label: "Notes That Need Kindness", blurb: "Notes nobody has answered yet. Maybe you could be the first." },
];

function parseView(v: string | null): View {
  return v === "lost" || v === "kindness" ? v : "fresh";
}

function parseMood(m: string | null): Mood | null {
  return MOODS.includes(m as Mood) ? (m as Mood) : null;
}

export function DiscoverFeed() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const view = parseView(params.get("view"));
  const mood = parseMood(params.get("mood"));

  const [notes, setNotes] = useState<Note[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const setParams = useCallback(
    (next: { view?: View; mood?: Mood | null }) => {
      const sp = new URLSearchParams(params.toString());
      const v = next.view ?? view;
      const m = next.mood === undefined ? mood : next.mood;
      if (v === "fresh") sp.delete("view");
      else sp.set("view", v);
      if (m) sp.set("mood", m);
      else sp.delete("mood");
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, view, mood, router, pathname],
  );

  useEffect(() => {
    if (view === "lost") return;
    let live = true;
    setNotes(null);
    setError(false);
    listNotes({ feed: view, mood })
      .then((n) => live && setNotes(n))
      .catch(() => live && setError(true));
    return () => {
      live = false;
    };
  }, [view, mood, attempt]);

  const current = VIEWS.find((v) => v.id === view)!;

  return (
    <div className="mt-8">
      <nav aria-label="Ways to discover" className="flex flex-wrap gap-2 border-b-2 border-dashed border-ink/20 pb-4">
        {VIEWS.map((v) => {
          const active = v.id === view;
          return (
            <button
              key={v.id}
              type="button"
              aria-current={active ? "page" : undefined}
              onClick={() => setParams({ view: v.id })}
              className={`rounded-t-[8px] border-2 px-4 py-2 font-display transition-colors ${
                active ? "border-ink bg-cloud" : "border-ink/25 bg-paper hover:border-ink hover:bg-cloud/40"
              }`}
            >
              {v.label}
            </button>
          );
        })}
      </nav>
      <p className="mt-4 font-hand text-2xl">{current.blurb}</p>

      {view !== "lost" && (
        <fieldset className="mt-4">
          <legend className="sr-only">Filter by mood</legend>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={mood === null}
              onClick={() => setParams({ mood: null })}
              className={`rounded-full border-2 px-3 py-1 font-display text-sm ${mood === null ? "border-ink bg-ink text-cream" : "border-ink/30 bg-white hover:border-ink"}`}
            >
              All moods
            </button>
            {MOODS.map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mood === m}
                onClick={() => setParams({ mood: mood === m ? null : m })}
                className={`rounded-full border-2 px-3 py-1 font-display text-sm ${
                  mood === m ? `border-ink ${MOOD_META[m].chip}` : "border-ink/30 bg-white hover:border-ink"
                }`}
              >
                {MOOD_META[m].label}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="mt-10">
        {view === "lost" ? (
          <LostAndFound />
        ) : error ? (
          <ErrorState onRetry={() => setAttempt((a) => a + 1)} />
        ) : !notes ? (
          <NoteGridSkeleton />
        ) : notes.length === 0 ? (
          <EmptyState title={view === "kindness" ? "Everyone's been heard" : "No notes here yet"}>
            {view === "kindness" ? (
              <p>Every note has had a little kindness. That&apos;s a nice thing.</p>
            ) : (
              <p>
                {mood ? `Nothing in ${MOOD_META[mood].label} yet. ` : ""}
                <Link href="/write" className="underline decoration-pink decoration-wavy underline-offset-4">Be the first to leave one.</Link>
              </p>
            )}
          </EmptyState>
        ) : (
          <div className="grid items-start gap-x-7 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note, i) => (
              <NoteCard key={note.id} note={note} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
