"use client";

import { useEffect, useRef, useState } from "react";
import { Envelope } from "@/components/envelope";
import { NoteCard } from "@/components/note-card";
import { EmptyState, ErrorState } from "@/components/note-states";
import { randomNote } from "@/lib/api";
import type { Note } from "@/lib/notes";

export function LostAndFound() {
  const [note, setNote] = useState<Note | null | undefined>(undefined);
  const [error, setError] = useState(false);
  const [draw, setDraw] = useState(0);
  const lastId = useRef<string | undefined>(undefined);

  useEffect(() => {
    let live = true;
    setError(false);
    setNote(undefined);
    randomNote(lastId.current)
      .then((n) => {
        if (!live) return;
        lastId.current = n?.id ?? lastId.current;
        setNote(n);
      })
      .catch(() => live && setError(true));
    return () => {
      live = false;
    };
  }, [draw]);

  if (error) return <ErrorState onRetry={() => setDraw((d) => d + 1)} />;
  if (note === null) return <EmptyState title="The lost & found is empty">Check back once a few notes have been left.</EmptyState>;

  return (
    <div className="mx-auto max-w-md">
      <div className="relative pt-4" aria-live="polite" aria-busy={note === undefined}>
        {note === undefined ? (
          <Envelope className="mx-auto max-w-xs" />
        ) : (
          <div key={note.id} className="relative">
            <Envelope flapClass="anim-flap-open" className="anim-fade-up mx-auto -mb-24 max-w-xs" />
            <div className="anim-letter-rise relative z-10">
              <NoteCard note={note} flat />
            </div>
          </div>
        )}
      </div>
      <div className="mt-8 text-center">
        <button type="button" onClick={() => setDraw((d) => d + 1)} disabled={note === undefined} className="btn btn-secondary">
          ✉ Open another
        </button>
      </div>
    </div>
  );
}
