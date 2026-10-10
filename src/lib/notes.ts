export const MOODS = ["love", "regret", "hope", "funny", "life", "apology"] as const;

export type Mood = (typeof MOODS)[number];

export type Note = {
  id: string;
  body: string;
  mood: Mood | null;
  /** ISO timestamp of publication. */
  publishedAt: string;
  /** How many kindness reactions the note has received. Never shown as a score. */
  kindnessCount: number;
  replyCount: number;
};

export type Reply = {
  id: string;
  noteId: string;
  body: string;
  createdAt: string;
};

export const NOTE_MAX_LENGTH = 1000;
export const NOTE_MIN_LENGTH = 3;
export const REPLY_MAX_LENGTH = 280;

export const MOOD_META: Record<Mood, { label: string; paper: string; chip: string }> = {
  love: { label: "Love", paper: "bg-pink-soft", chip: "bg-pink" },
  regret: { label: "Regret", paper: "bg-lilac-soft", chip: "bg-lilac" },
  hope: { label: "Hope", paper: "bg-[#e3f2ff]", chip: "bg-cloud" },
  funny: { label: "Funny", paper: "bg-butter-soft", chip: "bg-butter" },
  life: { label: "Life", paper: "bg-paper", chip: "bg-[#d6efd0]" },
  apology: { label: "Unsent Apologies", paper: "bg-[#fde8dc]", chip: "bg-[#ffc6a8]" },
};

export const KINDNESS_REACTIONS = [
  { id: "glad", label: "I'm glad you wrote this.", icon: "heart" },
  { id: "not-alone", label: "You aren't alone in this.", icon: "star" },
  { id: "warmth", label: "Sending a little warmth your way.", icon: "flower" },
  { id: "lighter", label: "I hope things get lighter for you.", icon: "heart" },
] as const;

export type KindnessId = (typeof KINDNESS_REACTIONS)[number]["id"];

export const REPORT_REASONS = [
  { id: "personal-info", label: "It shares someone's name or personal details" },
  { id: "harassment", label: "It's harassment, a threat or hateful" },
  { id: "explicit", label: "It's sexually explicit or graphic" },
  { id: "spam", label: "It's spam or advertising" },
  { id: "risk", label: "Someone might be in danger" },
  { id: "other", label: "Something else" },
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number]["id"];

export const WRITING_PROMPTS = [
  "I wish I had told you…",
  "Dear younger me…",
  "Something I haven't admitted to anyone…",
  "A tiny thing that made me happy today…",
  "I'm sorry that I never…",
  "If I could go back to that day, I would…",
  "Thank you for something you'll never know you did…",
  "The thing I keep almost saying is…",
  "To the person I used to be close to…",
  "Something I'm quietly proud of…",
  "A secret about me that would make you laugh…",
  "What I'd say if I knew you'd never read it…",
];

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

/** Shared validation for note text, used by the writing room now and the server later. */
export function validateNoteBody(body: string): string | null {
  const trimmed = body.trim();
  if (trimmed.length < NOTE_MIN_LENGTH) return "Write a few more words first.";
  if (trimmed.length > NOTE_MAX_LENGTH) return `Notes can be up to ${NOTE_MAX_LENGTH} characters.`;
  return null;
}

export function validateReplyBody(body: string): string | null {
  const trimmed = body.trim();
  if (trimmed.length < 2) return "Write a few kind words first.";
  if (trimmed.length > REPLY_MAX_LENGTH) return `Replies can be up to ${REPLY_MAX_LENGTH} characters.`;
  return null;
}
