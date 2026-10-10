"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkle } from "@/components/doodles";
import { Envelope } from "@/components/envelope";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { ApiError, publishNote } from "@/lib/api";
import { newId, readLocal, useDrafts, type Draft } from "@/lib/local-store";
import {
  MOOD_META,
  MOODS,
  NOTE_MAX_LENGTH,
  WRITING_PROMPTS,
  timeAgo,
  validateNoteBody,
  type Mood,
} from "@/lib/notes";

type Phase = "writing" | "sending" | "folding" | "sealing" | "flying" | "done";

export function WritingRoom() {
  const params = useSearchParams();
  const reducedMotion = useReducedMotion();
  const [, setDrafts] = useDrafts();

  const [body, setBody] = useState("");
  const [mood, setMood] = useState<Mood | null>(null);
  const [promptIndex, setPromptIndex] = useState(0);
  const [keepDraft, setKeepDraft] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("writing");
  const [error, setError] = useState<string | null>(null);

  const editorId = useId();
  const counterId = useId();
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Open a draft from the Mailbox (?draft=<id>).
  useEffect(() => {
    const id = params.get("draft");
    if (!id) return;
    const draft = readLocal<Draft[]>("drafts", []).find((d) => d.id === id);
    if (draft) {
      setBody(draft.body);
      setMood(draft.mood);
      setDraftId(draft.id);
      setKeepDraft(true);
      setDraftSavedAt(draft.updatedAt);
    }
  }, [params]);

  // Start on a random prompt (client-only, so the server render stays stable).
  useEffect(() => {
    setPromptIndex(Math.floor(Math.random() * WRITING_PROMPTS.length));
  }, []);

  // Autosave the draft to this browser when the writer has opted in.
  useEffect(() => {
    if (!keepDraft || phase !== "writing" || !body.trim()) return;
    const t = setTimeout(() => {
      const id = draftId ?? newId();
      const updatedAt = new Date().toISOString();
      setDrafts((prev) => [{ id, body, mood, updatedAt }, ...prev.filter((d) => d.id !== id)]);
      setDraftId(id);
      setDraftSavedAt(updatedAt);
    }, 600);
    return () => clearTimeout(t);
  }, [body, mood, keepDraft, draftId, phase, setDrafts]);

  function toggleDraft(on: boolean) {
    setKeepDraft(on);
    if (!on && draftId) {
      setDrafts((prev) => prev.filter((d) => d.id !== draftId));
      setDraftId(null);
      setDraftSavedAt(null);
    }
  }

  const prompt = WRITING_PROMPTS[promptIndex];
  const length = body.length;
  const nearLimit = length > NOTE_MAX_LENGTH * 0.9;

  function shuffle() {
    setPromptIndex((i) => {
      let next = i;
      while (next === i) next = Math.floor(Math.random() * WRITING_PROMPTS.length);
      return next;
    });
  }

  function applyPrompt() {
    setBody(prompt.replace(/…$/, " "));
    editorRef.current?.focus();
  }

  async function letItGo(e: React.FormEvent) {
    e.preventDefault();
    const problem = validateNoteBody(body);
    if (problem) {
      setError(problem);
      editorRef.current?.focus();
      return;
    }
    setError(null);
    setPhase("sending");
    try {
      await publishNote({ body, mood });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong and your note wasn't sent. It's still here, so you can try again.");
      setPhase("writing");
      return;
    }
    if (draftId) setDrafts((prev) => prev.filter((d) => d.id !== draftId));

    if (reducedMotion) {
      setPhase("done");
      return;
    }
    setPhase("folding");
    setTimeout(() => setPhase("sealing"), 600);
    setTimeout(() => setPhase("flying"), 1150);
    setTimeout(() => setPhase("done"), 2200);
  }

  function writeAnother() {
    setBody("");
    setMood(null);
    setDraftId(null);
    setDraftSavedAt(null);
    setPhase("writing");
    shuffle();
  }

  if (phase === "folding" || phase === "sealing" || phase === "flying") {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4" aria-live="polite">
        <p className="sr-only">Sending your note.</p>
        <div className={`relative w-72 ${phase === "flying" ? "anim-fly-away" : "anim-envelope-in"}`}>
          {phase === "folding" && (
            <div className="anim-fold-in absolute inset-x-6 -top-24 z-10 rounded-[4px] border-2 border-ink bg-paper p-3 font-hand text-lg leading-tight">
              {body.slice(0, 90)}
              {body.length > 90 ? "…" : ""}
            </div>
          )}
          <Envelope flapClass={phase === "folding" ? "[transform:rotateX(180deg)]" : "anim-flap-close"} />
        </div>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="anim-fade-up mx-auto max-w-lg px-4 py-20 text-center sm:px-6" role="status">
        <Sparkle className="animate-twinkle mx-auto h-10 w-10 text-butter" />
        <h1 className="mt-4 font-display text-4xl font-semibold">It&apos;s out there now.</h1>
        <p className="mt-2 font-hand text-3xl">You can let it rest.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/discover" className="btn btn-secondary">Read what others left behind</Link>
          <button type="button" onClick={writeAnother} className="btn btn-primary">Write another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
      <p className="font-hand text-2xl text-ink-soft">the writing room</p>
      <h1 className="font-display text-4xl font-semibold sm:text-5xl">Write the thing you never sent.</h1>
      <p className="mt-2 max-w-xl text-ink-soft">
        No name, no account. Leave out real names, addresses or anything that could identify you or someone else.
      </p>

      <form onSubmit={letItGo} className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_1fr]">
        {/* Diary */}
        <div className="relative rounded-[10px] border-2 border-ink bg-paper shadow-[6px_6px_0_0_var(--color-ink)]">
          <div className="absolute inset-y-0 left-7 w-px bg-pink/60" aria-hidden="true" />
          <div className="p-5 pl-12 sm:p-8 sm:pl-14">
            {/* Prompt */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-pixel text-xs uppercase tracking-wider text-ink-soft">Need a nudge?</span>
              <span className="font-hand text-2xl" aria-live="polite">{prompt}</span>
              <span className="flex gap-1">
                <button type="button" onClick={shuffle} className="rounded-full border-[1.5px] border-ink/40 px-2.5 py-0.5 text-sm hover:bg-butter-soft">
                  ↻ Shuffle
                </button>
                <button
                  type="button"
                  onClick={applyPrompt}
                  disabled={body.trim().length > 0}
                  className="rounded-full border-[1.5px] border-ink/40 px-2.5 py-0.5 text-sm hover:bg-butter-soft disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  Start with this
                </button>
              </span>
            </div>

            {/* Editor */}
            <label htmlFor={editorId} className="sr-only">Your note</label>
            <textarea
              id={editorId}
              ref={editorRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={NOTE_MAX_LENGTH}
              aria-describedby={counterId}
              aria-invalid={error ? true : undefined}
              placeholder="Dear…"
              rows={11}
              className="ruled mt-5 block w-full resize-y bg-transparent text-lg leading-[1.7rem] placeholder:font-hand placeholder:text-2xl placeholder:text-ink-soft/60 focus:outline-none"
            />

            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span id={counterId} className={`font-pixel ${nearLimit ? "text-[#b42357]" : "text-ink-soft"}`}>
                {length} / {NOTE_MAX_LENGTH}
              </span>
              <label className="inline-flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={keepDraft} onChange={(e) => toggleDraft(e.target.checked)} className="h-4 w-4 accent-[#e5568a]" />
                Keep a draft in this browser
              </label>
            </div>
            {keepDraft && (
              <p className="mt-1 text-right text-xs text-ink-soft" aria-live="polite" suppressHydrationWarning>
                {draftSavedAt ? `Draft saved ${timeAgo(draftSavedAt)}, only on this device.` : "Drafts save as you type, only on this device."}
              </p>
            )}

            {/* Mood */}
            <fieldset className="mt-6">
              <legend className="font-display text-lg font-medium">
                How does it feel? <span className="font-sans text-sm font-normal text-ink-soft">(optional)</span>
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {MOODS.map((m) => {
                  const meta = MOOD_META[m];
                  const checked = mood === m;
                  return (
                    <label
                      key={m}
                      className={`cursor-pointer rounded-full border-2 px-3 py-1 font-display text-sm transition-colors has-[:focus-visible]:outline-dashed has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 ${
                        checked ? `border-ink ${meta.chip}` : "border-ink/30 bg-white hover:border-ink"
                      }`}
                    >
                      <input
                        type="radio"
                        name="mood"
                        value={m}
                        checked={checked}
                        onChange={() => setMood(m)}
                        onClick={() => checked && setMood(null)}
                        className="sr-only"
                      />
                      {meta.label}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {error && (
              <p role="alert" className="mt-5 rounded-md border-2 border-[#b42357]/40 bg-pink-soft px-3 py-2 text-sm">
                {error}
              </p>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <button type="submit" disabled={phase === "sending"} className="btn btn-primary px-7 text-lg">
                {phase === "sending" ? "Sending…" : "Let it go ✉"}
              </button>
              <span className="text-sm text-ink-soft">Once it&apos;s out, it&apos;s out. It won&apos;t be linked to you.</span>
            </div>
          </div>
        </div>

        {/* Live preview */}
        <aside aria-label="Preview" className="lg:sticky lg:top-6 lg:self-start">
          <p className="font-pixel text-xs uppercase tracking-wider text-ink-soft">How it will look</p>
          <div
            className={`relative mt-3 rotate-[1deg] rounded-[6px] border-2 border-ink/80 ${mood ? MOOD_META[mood].paper : "bg-paper"} p-5 pt-6 shadow-[var(--shadow-paper)]`}
          >
            <span className="tape" aria-hidden="true" />
            <div className="mb-3 flex items-center justify-between">
              {mood ? (
                <span className={`rounded-full border-[1.5px] border-ink px-2.5 py-0.5 font-display text-xs font-medium ${MOOD_META[mood].chip}`}>
                  {MOOD_META[mood].label}
                </span>
              ) : (
                <span />
              )}
              <span className="font-hand text-lg text-ink-soft">just now</span>
            </div>
            <p className="ruled min-h-[6.8rem] whitespace-pre-line break-words text-[1.02rem] leading-[1.7rem]">
              {body.trim() || <span className="font-hand text-xl text-ink-soft/70">Your words will appear here…</span>}
            </p>
          </div>

          <div className="mt-8 rounded-[8px] border-2 border-dashed border-ink/30 p-4 text-sm leading-relaxed text-ink-soft">
            <p className="font-display text-base font-medium text-ink">A gentle note</p>
            <p className="mt-1">
              This is a place to put words down, not a crisis service. If you&apos;re thinking about hurting yourself or
              you&apos;re in danger, please reach out to local emergency services or a crisis line where you live.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
