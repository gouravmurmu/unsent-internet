"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { NoteCard } from "@/components/note-card";
import { EmptyState } from "@/components/note-states";
import { useDrafts, useSavedNotes } from "@/lib/local-store";
import { MOOD_META, timeAgo } from "@/lib/notes";

const noop = () => () => {};

export function Mailbox() {
  // Local data only exists in the browser; render placeholders on the server.
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const { saved } = useSavedNotes();
  const [drafts, setDrafts] = useDrafts();

  return (
    <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-14">
        <section aria-labelledby="drafts-title">
          <h2 id="drafts-title" className="font-display text-2xl font-semibold">Unsent drafts</h2>
          <div className="mt-5">
            {!mounted ? (
              <div className="skeleton h-24" />
            ) : drafts.length === 0 ? (
              <EmptyState title="No drafts tucked away">
                <p>
                  Turn on &ldquo;Keep a draft in this browser&rdquo; in the{" "}
                  <Link href="/write" className="underline decoration-pink decoration-wavy underline-offset-4">writing room</Link>{" "}
                  and unfinished notes will wait here.
                </p>
              </EmptyState>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2">
                {drafts.map((d) => (
                  <li key={d.id} className="flex flex-col rounded-[6px] border-2 border-dashed border-ink/50 bg-paper p-4">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      {d.mood ? (
                        <span className={`rounded-full border-[1.5px] border-ink px-2 py-0.5 font-display text-xs ${MOOD_META[d.mood].chip}`}>
                          {MOOD_META[d.mood].label}
                        </span>
                      ) : (
                        <span className="font-pixel text-xs text-ink-soft">draft</span>
                      )}
                      <span className="font-hand text-lg text-ink-soft">{timeAgo(d.updatedAt)}</span>
                    </div>
                    <p className="mt-2 line-clamp-4 flex-1 whitespace-pre-line break-words">{d.body}</p>
                    <div className="mt-3 flex gap-2">
                      <Link href={`/write?draft=${encodeURIComponent(d.id)}`} className="btn btn-primary min-h-9 px-3 py-1 text-sm">
                        Keep writing
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDrafts((prev) => prev.filter((x) => x.id !== d.id))}
                        className="btn btn-secondary min-h-9 px-3 py-1 text-sm"
                      >
                        Throw away
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section aria-labelledby="saved-title">
          <h2 id="saved-title" className="font-display text-2xl font-semibold">Saved notes</h2>
          <div className="mt-5">
            {!mounted ? (
              <div className="skeleton h-24" />
            ) : saved.length === 0 ? (
              <EmptyState title="Nothing saved yet">
                <p>
                  Tap &ldquo;Save&rdquo; on any note in{" "}
                  <Link href="/discover" className="underline decoration-pink decoration-wavy underline-offset-4">Discover</Link>{" "}
                  to keep it here.
                </p>
              </EmptyState>
            ) : (
              <div className="grid items-start gap-x-7 gap-y-9 sm:grid-cols-2">
                {saved.map((note, i) => (
                  <NoteCard key={note.id} note={note} index={i} showReplies={false} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <div className="rounded-[8px] border-2 border-ink bg-cloud p-5">
          <h2 className="font-display text-lg font-semibold">What stays where</h2>
          <dl className="mt-3 space-y-3 text-sm leading-relaxed">
            <div>
              <dt className="font-semibold">Only in this browser</dt>
              <dd>Drafts and saved notes. They don&apos;t follow you to other devices and disappear if you clear your browser data.</dd>
            </div>
            <div>
              <dt className="font-semibold">On our server</dt>
              <dd>Notes you publish, kind reactions and replies, so other people can read them. None of it is tied to a name or account.</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-[8px] border-2 border-dashed border-ink/40 p-5 text-sm leading-relaxed">
          <h2 className="font-display text-lg font-semibold">Finding your own notes</h2>
          <p className="mt-2 text-ink-soft">
            Coming soon: when you publish, you&apos;ll get a private recovery code. Keep it somewhere safe and you can
            look up or take down your notes later, from any device.
          </p>
        </div>
      </aside>
    </div>
  );
}
