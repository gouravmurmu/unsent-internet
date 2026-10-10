import type { Metadata } from "next";
import { getDb } from "@/server/db";
import { isModerator, moderatorPassword } from "@/server/moderator";
import { MOOD_META, REPORT_REASONS, timeAgo, type Mood } from "@/lib/notes";
import { login, logout, moderate } from "./actions";

export const metadata: Metadata = {
  title: "Moderation",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type QueueItem = {
  kind: "note" | "reply";
  id: string;
  body: string;
  mood: Mood | null;
  status: "published" | "pending_review" | "hidden" | "removed";
  flags: string[];
  createdAt: string;
  noteId: string | null;
  noteBody: string | null;
  openReports: number;
  reasons: string[];
};

const FLAG_LABELS: Record<string, string> = {
  threat: "Sounds like a threat",
  explicit: "Possibly explicit",
  risk: "Writer may be at risk",
  contact: "Contact details",
};

const REASON_LABELS: Record<string, string> = Object.fromEntries(REPORT_REASONS.map((r) => [r.id, r.label]));

const ERRORS: Record<string, string> = {
  wrong: "That password isn't right.",
  wait: "Too many tries. Please wait a few minutes.",
  invalid: "That action didn't look right.",
  failed: "That didn't go through. Please try again.",
};

// One form per button: the clicked button's value isn't passed to server actions reliably.
const DECISIONS = [
  { value: "approve", label: "Approve" },
  { value: "hide", label: "Hide" },
  { value: "remove", label: "Remove" },
] as const;

const DONE: Record<string, string> = {
  approve: "Approved. It's visible again.",
  hide: "Hidden from the site.",
  remove: "Removed.",
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-8 sm:px-6">
      <p className="font-hand text-2xl text-ink-soft">behind the counter</p>
      <h1 className="font-display text-4xl font-semibold sm:text-5xl">Moderation</h1>
      {children}
    </div>
  );
}

export default async function ModeratePage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; done?: string }>;
}) {
  const { e, done } = await searchParams;
  const error = e ? ERRORS[e] : null;
  const db = getDb();

  if (!db || !moderatorPassword()) {
    return (
      <Shell>
        <p className="mt-6 max-w-xl">
          Moderation isn&apos;t switched on yet. Set <code className="font-pixel">MODERATOR_PASSWORD</code> (12 or more
          characters) in the site&apos;s environment settings to use this page.
        </p>
      </Shell>
    );
  }

  if (!(await isModerator())) {
    return (
      <Shell>
        <form action={login} className="mt-8 max-w-sm rounded-[8px] border-2 border-ink bg-paper p-6">
          <label htmlFor="mod-password" className="font-display text-lg font-medium">
            Moderator password
          </label>
          <input
            id="mod-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            aria-describedby={error ? "mod-error" : undefined}
            className="mt-2 w-full rounded-md border-2 border-ink/40 bg-white px-3 py-2 focus:border-ink focus:outline-none"
          />
          {error && (
            <p id="mod-error" role="alert" className="mt-2 text-sm text-[#b42357]">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-primary mt-4">
            Sign in
          </button>
        </form>
      </Shell>
    );
  }

  const { data, error: queueError } = await db.rpc("moderation_queue");
  const items = (data ?? []) as QueueItem[];

  return (
    <Shell>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-ink-soft">
          Held notes and replies, plus anything people have reported. Nothing here is visible to the public until you
          approve it.
        </p>
        <form action={logout}>
          <button type="submit" className="btn btn-secondary min-h-9 px-3 py-1 text-sm">
            Sign out
          </button>
        </form>
      </div>

      {(error || (done && DONE[done])) && (
        <p role="status" className="mt-4 rounded-md border-2 border-ink/20 bg-butter-soft px-3 py-2 text-sm">
          {error ?? DONE[done!]}
        </p>
      )}

      {queueError ? (
        <p role="alert" className="mt-8">
          Couldn&apos;t load the queue right now. Please refresh in a moment.
        </p>
      ) : items.length === 0 ? (
        <p className="mt-10 font-hand text-3xl">All quiet. Nothing waiting for you. ✿</p>
      ) : (
        <ul className="mt-8 space-y-5">
          {items.map((item) => (
            <li
              key={`${item.kind}:${item.id}`}
              className={`rounded-[8px] border-2 border-ink p-5 ${item.mood ? MOOD_META[item.mood].paper : "bg-paper"}`}
            >
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full border-[1.5px] border-ink px-2 py-0.5 font-pixel text-xs uppercase">
                  {item.kind}
                </span>
                <span className="rounded-full bg-white/70 px-2 py-0.5">
                  {item.status === "pending_review" ? "Waiting for review" : "Live, but reported"}
                </span>
                {item.flags.map((f) => (
                  <span key={f} className="rounded-full bg-pink-soft px-2 py-0.5">
                    {FLAG_LABELS[f] ?? f}
                  </span>
                ))}
                <time className="ml-auto text-ink-soft" dateTime={item.createdAt}>
                  {timeAgo(item.createdAt)}
                </time>
              </div>

              {item.kind === "reply" && item.noteBody && (
                <p className="mt-3 border-l-4 border-ink/20 pl-3 text-sm text-ink-soft">
                  In reply to: {item.noteBody.length > 160 ? `${item.noteBody.slice(0, 160)}…` : item.noteBody}
                </p>
              )}
              <p className="mt-3 whitespace-pre-line">{item.body}</p>

              {item.openReports > 0 && (
                <p className="mt-3 text-sm">
                  <strong>
                    {item.openReports} {item.openReports === 1 ? "report" : "reports"}:
                  </strong>{" "}
                  {item.reasons.map((r) => REASON_LABELS[r] ?? r).join("; ")}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {DECISIONS.map((d) => (
                  <form key={d.value} action={moderate}>
                    <input type="hidden" name="kind" value={item.kind} />
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="decision" value={d.value} />
                    <button
                      type="submit"
                      className={`btn ${d.value === "remove" ? "btn-primary" : "btn-secondary"} min-h-9 px-3 py-1 text-sm`}
                    >
                      {d.value === "approve" && item.status !== "pending_review" ? "Keep it up" : d.label}
                    </button>
                  </form>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}
