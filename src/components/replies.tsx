"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ReportButton } from "@/components/report-dialog";
import { SupportResources } from "@/components/support-resources";
import { listReplies, postReply, ApiError } from "@/lib/api";
import { useIdList } from "@/lib/local-store";
import { REPLY_MAX_LENGTH, timeAgo, validateReplyBody, type Reply } from "@/lib/notes";

/** Flat list of short replies under a note, plus a small form to add one. */
export function Replies({ noteId, initialCount }: { noteId: string; initialCount: number }) {
  const [open, setOpen] = useState(false);
  const [replies, setReplies] = useState<Reply[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ held: boolean; risk: boolean } | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const hidden = useIdList("hidden");
  const panelId = useId();
  const inputId = useId();

  useEffect(() => {
    if (!open || replies) return;
    let live = true;
    listReplies(noteId)
      .then((r) => live && setReplies(r))
      .catch(() => live && setLoadError(true));
    return () => {
      live = false;
    };
  }, [open, replies, noteId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const problem = validateReplyBody(draft);
    if (problem) return setFormError(problem);
    setSending(true);
    setFormError(null);
    setNotice(null);
    try {
      const { reply, held, risk } = await postReply(noteId, draft, honeypotRef.current?.value ?? "");
      if (!held) setReplies((prev) => [...(prev ?? []), reply]);
      if (held || risk) setNotice({ held, risk });
      setDraft("");
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "That didn't go through. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const visible = replies?.filter((r) => !hidden.has(r.id));
  const count = visible?.length ?? initialCount;
  const left = REPLY_MAX_LENGTH - draft.length;

  return (
    <div className="mt-3">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="rounded-full px-2 py-1 font-hand text-lg leading-none text-ink-soft hover:bg-white/70"
      >
        {open ? "hide replies" : count === 0 ? "leave a few kind words" : `${count} kind ${count === 1 ? "reply" : "replies"}`}
      </button>

      {open && (
        <div id={panelId} className="anim-fade-up mt-2 space-y-2">
          {!replies && !loadError && <div className="skeleton h-10" aria-label="Loading replies" />}
          {loadError && <p className="text-sm text-[#b42357]">Couldn&apos;t load replies right now.</p>}
          {visible && visible.length > 0 && (
            <ul className="space-y-2">
              {visible.map((r) => (
                <li key={r.id} className="rounded-md border border-ink/15 bg-white/60 px-3 py-2 text-[0.95rem]">
                  <p className="whitespace-pre-line">{r.body}</p>
                  <div className="mt-1 flex items-center justify-between text-xs text-ink-soft">
                    <time dateTime={r.createdAt} suppressHydrationWarning>{timeAgo(r.createdAt)}</time>
                    <ReportButton
                      target={{ kind: "reply", id: r.id }}
                      onReported={() => hidden.add(r.id)}
                      className="rounded px-1.5 py-0.5 hover:bg-white"
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={submit} className="pt-1">
            <label htmlFor={inputId} className="sr-only">Write a kind reply</label>
            <input ref={honeypotRef} type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
            <textarea
              id={inputId}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={REPLY_MAX_LENGTH}
              rows={2}
              placeholder="Something kind, in a sentence or two…"
              className="w-full resize-none rounded-md border-2 border-ink/30 bg-white/80 px-3 py-2 text-[0.95rem] placeholder:text-ink-soft/70 focus:border-ink focus:outline-none"
            />
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className={`font-pixel text-xs ${left < 20 ? "text-[#b42357]" : "text-ink-soft"}`} aria-live="polite">
                {left} left
              </span>
              <button type="submit" disabled={sending} className="btn btn-secondary min-h-9 px-3 py-1 text-sm">
                {sending ? "Sending…" : "Reply"}
              </button>
            </div>
            {formError && <p role="alert" className="mt-1 text-sm text-[#b42357]">{formError}</p>}
            {notice?.held && (
              <p role="status" className="mt-1 text-sm text-ink-soft">
                Thank you. A person will read your reply before it appears.
              </p>
            )}
          </form>
          {notice?.risk && <SupportResources className="mt-2" />}
        </div>
      )}
    </div>
  );
}
