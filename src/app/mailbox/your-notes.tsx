"use client";

import { useEffect, useId, useState } from "react";
import { ApiError, findMyNotes, removeMyNote, type OwnNote } from "@/lib/api";
import { useRecoveryCode } from "@/lib/local-store";
import { MOOD_META, timeAgo } from "@/lib/notes";

const STATUS_LABEL: Record<OwnNote["status"], string> = {
  published: "Out in the world",
  pending_review: "Waiting for a moderator",
  hidden: "Hidden by a moderator",
};

/** Find and take down your own published notes with your private recovery code. */
export function YourNotes() {
  const [stored, setStored] = useRecoveryCode();
  const [code, setCode] = useState("");
  const [notes, setNotes] = useState<OwnNote[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shown, setShown] = useState(false);
  const inputId = useId();

  useEffect(() => {
    if (stored && !code) setCode(stored);
  }, [stored, code]);

  async function look(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setError(null);
    try {
      setNotes(await findMyNotes(code));
    } catch (err) {
      setNotes(null);
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function takeDown(id: string) {
    if (!window.confirm("Take this note down for good? This can't be undone.")) return;
    try {
      await removeMyNote(code, id);
      setNotes((prev) => prev?.filter((n) => n.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't take that down. Please try again.");
    }
  }

  const isStored = !!stored && code.replace(/[\s-]/g, "").toUpperCase() === stored.replace(/-/g, "");

  return (
    <section aria-labelledby="yours-title">
      <h2 id="yours-title" className="font-display text-2xl font-semibold">Notes you&apos;ve sent</h2>
      <p className="mt-1 max-w-xl text-ink-soft">
        When you publish, you get a private recovery code. With it you can see your notes and take them down, from
        any device. We can&apos;t recover a lost code, because we don&apos;t know who you are.
      </p>

      <form onSubmit={look} className="mt-5 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor={inputId} className="block text-sm font-semibold">Recovery code</label>
          <input
            id={inputId}
            type={shown ? "text" : "password"}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            placeholder="XXXX-XXXX-XXXX-XXXX-XXXX"
            className="mt-1 w-[19rem] max-w-full rounded-md border-2 border-ink/40 bg-white px-3 py-2 font-pixel tracking-wider focus:border-ink focus:outline-none"
          />
        </div>
        <button type="button" onClick={() => setShown((s) => !s)} className="btn btn-secondary min-h-10 px-3 py-1.5 text-sm">
          {shown ? "Hide" : "Show"}
        </button>
        <button type="submit" disabled={busy || !code.trim()} className="btn btn-primary min-h-10 px-4 py-1.5 text-sm disabled:opacity-50">
          {busy ? "Looking…" : "Find my notes"}
        </button>
      </form>
      {stored && isStored && <p className="mt-2 text-sm text-ink-soft">This code is saved in this browser.</p>}
      {code && !isStored && notes && notes.length > 0 && (
        <button type="button" onClick={() => setStored(code.trim().toUpperCase())} className="mt-2 text-sm underline">
          Remember this code in this browser
        </button>
      )}
      {error && <p role="alert" className="mt-3 text-sm text-[#b42357]">{error}</p>}

      {notes && (
        <div className="mt-6" aria-live="polite">
          {notes.length === 0 ? (
            <p className="font-hand text-2xl text-ink-soft">No notes found for this code.</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {notes.map((n) => (
                <li key={n.id} className="flex flex-col rounded-[6px] border-2 border-ink/70 bg-paper p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-pixel text-xs uppercase tracking-wider">{STATUS_LABEL[n.status]}</span>
                    <span className="font-hand text-lg text-ink-soft">{timeAgo(n.publishedAt)}</span>
                  </div>
                  {n.mood && <span className="mt-1 text-xs text-ink-soft">{MOOD_META[n.mood].label}</span>}
                  <p className="mt-2 line-clamp-5 flex-1 whitespace-pre-line break-words">{n.body}</p>
                  <button type="button" onClick={() => takeDown(n.id)} className="btn btn-secondary mt-3 min-h-9 self-start px-3 py-1 text-sm">
                    Take it down
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
