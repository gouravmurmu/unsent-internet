"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Burst } from "@/components/burst";
import { sendKindness } from "@/lib/api";
import { useIdList } from "@/lib/local-store";
import { KINDNESS_REACTIONS, type KindnessId } from "@/lib/notes";

export function KindnessButton({ noteId }: { noteId: string }) {
  const reacted = useIdList("reacted");
  const [open, setOpen] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [sent, setSent] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const menuId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const already = reacted.has(noteId);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function choose(id: KindnessId, label: string) {
    setOpen(false);
    setBusy(true);
    setError(false);
    try {
      await sendKindness(noteId, id);
      reacted.add(noteId);
      setSent(label);
      setBurstKey((k) => k + 1);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={menuId}
        disabled={already || busy}
        onClick={() => setOpen((o) => !o)}
        className="relative inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-display transition-colors hover:bg-white/70 disabled:cursor-default disabled:hover:bg-transparent"
      >
        <span aria-hidden="true" className={already ? "text-[#e5568a]" : ""}>{already ? "♥" : "♡"}</span>
        {already ? "Kindness sent" : busy ? "Sending…" : "Send kindness"}
        {burstKey > 0 && <Burst key={burstKey} />}
      </button>

      {open && (
        <ul
          id={menuId}
          className="anim-fade-up absolute bottom-full left-0 z-20 mb-2 w-64 rounded-[8px] border-2 border-ink bg-paper p-1.5 shadow-[4px_4px_0_0_var(--color-ink)]"
        >
          {KINDNESS_REACTIONS.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => choose(r.id, r.label)}
                className="w-full rounded-md px-3 py-2 text-left font-hand text-xl leading-tight hover:bg-pink-soft focus-visible:bg-pink-soft"
              >
                {r.label}
              </button>
            </li>
          ))}
        </ul>
      )}

      <span role="status" className="sr-only">
        {sent ? `Sent: ${sent}` : ""}
      </span>
      {error && <span className="ml-2 text-sm text-[#b42357]">Couldn&apos;t send that. Try again?</span>}
    </div>
  );
}
