export const MOODS = ["love", "regret", "hope", "funny", "life", "apology"] as const;

export type Mood = (typeof MOODS)[number];

export type Note = {
  id: string;
  body: string;
  mood: Mood | null;
  /** ISO timestamp of publication. */
  publishedAt: string;
  kindnessCount: number;
};

export const MOOD_META: Record<Mood, { label: string; paper: string; chip: string }> = {
  love: { label: "Love", paper: "bg-pink-soft", chip: "bg-pink" },
  regret: { label: "Regret", paper: "bg-lilac-soft", chip: "bg-lilac" },
  hope: { label: "Hope", paper: "bg-[#e3f2ff]", chip: "bg-cloud" },
  funny: { label: "Funny", paper: "bg-butter-soft", chip: "bg-butter" },
  life: { label: "Life", paper: "bg-paper", chip: "bg-[#d6efd0]" },
  apology: { label: "Unsent Apologies", paper: "bg-[#fde8dc]", chip: "bg-[#ffc6a8]" },
};

/** Human-friendly relative time, e.g. "3 hours ago". */
export function timeAgo(iso: string, now: Date = new Date()): string {
  const seconds = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 1000));
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, size] of units) {
    if (seconds >= size) return rtf.format(-Math.floor(seconds / size), unit);
  }
  return "just now";
}
