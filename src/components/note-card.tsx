import { MOOD_META, timeAgo, type Note } from "@/lib/notes";

/** Small, restrained tilts so the scrapbook never looks like a template grid. */
const TILTS = ["-rotate-[1.2deg]", "rotate-[0.8deg]", "-rotate-[0.4deg]", "rotate-[1.5deg]", "rotate-[0.3deg]", "-rotate-[1.6deg]"];

type Props = {
  note: Note;
  index?: number;
  /** Visual-only preview: actions are shown but not wired up yet. */
  preview?: boolean;
};

export function NoteCard({ note, index = 0, preview = false }: Props) {
  const mood = note.mood ? MOOD_META[note.mood] : null;
  const tilt = TILTS[index % TILTS.length];

  return (
    <article
      className={`relative rounded-[6px] border-2 border-ink/80 ${mood?.paper ?? "bg-paper"} p-5 pt-6 shadow-[var(--shadow-paper)] transition-transform duration-200 hover:rotate-0 hover:-translate-y-1 motion-reduce:transform-none ${tilt}`}
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
        <time dateTime={note.publishedAt} className="font-hand text-lg text-ink-soft">
          {timeAgo(note.publishedAt)}
        </time>
      </header>

      <p className="ruled whitespace-pre-line text-[1.02rem] leading-[1.7rem]">{note.body}</p>

      <footer className="mt-4 flex items-center justify-between gap-2 border-t border-dashed border-ink/25 pt-3 text-sm">
        <button
          type="button"
          disabled={preview}
          title={preview ? "Kindness reactions arrive in the next stage" : undefined}
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-display hover:bg-white/60 disabled:cursor-default"
        >
          <span aria-hidden="true">♡</span> Send kindness
          <span className="sr-only">,</span>
          <span className="font-pixel text-xs text-ink-soft">{note.kindnessCount}</span>
        </button>
        <span className="flex items-center gap-1">
          <button
            type="button"
            disabled={preview}
            className="rounded-full px-2 py-1 text-ink-soft hover:bg-white/60 disabled:cursor-default"
          >
            Save
          </button>
          <button
            type="button"
            disabled={preview}
            className="rounded-full px-2 py-1 text-ink-soft hover:bg-white/60 disabled:cursor-default"
          >
            Report
          </button>
        </span>
      </footer>
    </article>
  );
}
