"use client";

import { useRef, useState } from "react";
import { report } from "@/lib/api";
import { REPORT_REASONS, type ReportReason } from "@/lib/notes";

type Props = {
  target: { kind: "note" | "reply"; id: string };
  /** Called once a report is sent, so the caller can hide the content locally. */
  onReported?: () => void;
  className?: string;
};

export function ReportButton({ target, onReported, className = "" }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  function open() {
    setReason(null);
    setState("idle");
    ref.current?.showModal();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) return;
    setState("sending");
    try {
      await report(target, reason);
      setState("done");
    } catch {
      setState("error");
    }
  }

  function close() {
    // onClose below fires for this and for Escape, and hides the reported item.
    ref.current?.close();
  }

  return (
    <>
      <button type="button" onClick={open} className={className}>
        Report
      </button>
      <dialog ref={ref} className="paper-dialog" aria-labelledby={`report-${target.id}`} onClose={() => state === "done" && onReported?.()}>
        {state === "done" ? (
          <div className="p-6">
            <h2 id={`report-${target.id}`} className="font-display text-2xl font-semibold">Thank you for looking out</h2>
            <p className="mt-2 text-ink-soft">
              We&apos;ve hidden this {target.kind} for you. A person will review it.
            </p>
            {reason === "risk" && (
              <p className="mt-3 rounded-md border border-ink/20 bg-butter-soft p-3 text-sm">
                If someone is in immediate danger, please contact local emergency services. This site can&apos;t reach
                people directly.
              </p>
            )}
            <button type="button" onClick={close} className="btn btn-secondary mt-5">Close</button>
          </div>
        ) : (
          <form onSubmit={submit} className="p-6">
            <h2 id={`report-${target.id}`} className="font-display text-2xl font-semibold">Report this {target.kind}</h2>
            <p className="mt-1 text-sm text-ink-soft">Reports are anonymous. What&apos;s wrong with it?</p>
            <fieldset className="mt-4 space-y-1.5">
              <legend className="sr-only">Reason</legend>
              {REPORT_REASONS.map((r) => (
                <label key={r.id} className="flex cursor-pointer items-start gap-2.5 rounded-md px-2 py-1.5 hover:bg-cream">
                  <input
                    type="radio"
                    name="reason"
                    value={r.id}
                    checked={reason === r.id}
                    onChange={() => setReason(r.id)}
                    className="mt-1 accent-[#e5568a]"
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </fieldset>
            {state === "error" && <p className="mt-3 text-sm text-[#b42357]">That didn&apos;t go through. Please try again.</p>}
            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => ref.current?.close()} className="btn btn-secondary">Cancel</button>
              <button type="submit" disabled={!reason || state === "sending"} className="btn btn-primary disabled:opacity-50">
                {state === "sending" ? "Sending…" : "Send report"}
              </button>
            </div>
          </form>
        )}
      </dialog>
    </>
  );
}
