"use client";

import { useEffect, useState } from "react";
import { NoteCard } from "@/components/note-card";
import { ErrorState, NoteGridSkeleton } from "@/components/note-states";
import { listNotes } from "@/lib/api";
import type { Note } from "@/lib/notes";

export function LatestNotes({ limit = 6 }: { limit?: number }) {
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let live = true;
    setError(false);
    listNotes({ feed: "fresh", mood: null })
      .then((n) => live && setNotes(n.slice(0, limit)))
      .catch(() => live && setError(true));
    return () => {
      live = false;
    };
  }, [limit, attempt]);

  if (error) return <ErrorState onRetry={() => setAttempt((a) => a + 1)} />;
  if (!notes) return <NoteGridSkeleton count={limit} />;
  return (
    <div className="grid items-start gap-x-7 gap-y-9 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map((note, i) => (
        <NoteCard key={note.id} note={note} index={i} showReplies={false} />
      ))}
    </div>
  );
}
