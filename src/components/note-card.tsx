"use client";

import { KindnessButton } from "@/components/kindness-button";
import { Replies } from "@/components/replies";
import { ReportButton } from "@/components/report-dialog";
import { useIdList, useSavedNotes } from "@/lib/local-store";
import { MOOD_META, timeAgo, type Note } from "@/lib/notes";

/** Small, restrained tilts so the scrapbook never looks like a template grid. */
const TILTS = ["-rotate-[1.2deg]", "rotate-[0.8deg]", "-rotate-[0.4deg]", "rotate-[1.5deg]", "rotate-[0.3deg]", "-rotate-[1.6deg]"];

type Props = {
  note: Note;
  index?: number;
  /** Hide the replies section, e.g. on the homepage preview. */
  showReplies?: boolean;
  /** Skip the tilt, e.g. for the single Lost & Found note. */
  flat?: boolean;
};

export function NoteCard({ note, index = 0, showReplies = true, flat = false }: Props) {
  const mood = note.mood ? MOOD_META[note.mood] : null;
  const tilt = flat ? "" : TILTS[index % TILTS.length];
  const { isSaved, toggle } = useSavedNotes();
  const hidden = useIdList("hidden");
  const saved = isSaved(note.id);

  if (hidden.has(note.id)) {
    return (
      <p className="rounded-[6px] border-2 border-dashed border-ink/25 p-4 text-center font-hand text-xl text-ink-soft">
        You reported this note, so it&apos;s hidden for you.
      </p>
    );
  }

  return (
    <article
      className={`relative rounded-[6px] border-2 border-ink/80 ${mood?.paper ?? "bg-paper"} p-5 pt-6 shadow-[var(--shadow-paper)] transition-transform duration-200 hover:-translate-y-1 hover:rotate-0 motion-reduce:transform-none ${tilt}`}
    >
      {index % 2 === 0 && <span className="tape" aria-hidden="true" />}

      <header className="mb-3 flex items-center justify-between gap-3">
        {mood ? (
          <span className={`rounded-full border-[1.5px] border-ink px-2.5 py-0.5 font-display text-xs font-medium ${mood.chip}`}>
            {mood.label}
          </span>
        ) : (
          <span />
        )}
        <time dateTime={note.publishedAt} className="font-hand text-lg text-ink-soft" suppressHydrationWarning>
          {timeAgo(note.publishedAt)}
        </time>
      </header>

      <p className="ruled whitespace-pre-line break-words text-[1.02rem] leading-[1.7rem]">{note.body}</p>

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-ink/25 pt-3 text-sm">
        <KindnessButton noteId={note.id} />
        <span className="flex items-center gap-1">
          <button
            type="button"
            aria-pressed={saved}
            onClick={() => toggle(note)}
            className="rounded-full px-2 py-1 text-ink-soft hover:bg-white/70"
          >
            {saved ? "Saved ✓" : "Save"}
          </button>
          <ReportButton
            target={{ kind: "note", id: note.id }}
            onReported={() => hidden.add(note.id)}
            className="rounded-full px-2 py-1 text-ink-soft hover:bg-white/70"
          />
        </span>
      </footer>

      {showReplies && <Replies noteId={note.id} initialCount={note.replyCount} />}
    </article>
  );
}
