import "server-only";

/**
 * A first, automatic look at a note or reply before it's stored. It is
 * deliberately simple and errs towards asking a human: nothing here deletes
 * anything, it only blocks contact details outright and holds the rest for
 * the moderation queue.
 */

export type Screening = {
  /** A friendly message when the text can't be sent as written. */
  block: string | null;
  /** Hold for a human to review before it appears publicly. */
  hold: boolean;
  /** Why it was held, shown in the moderation queue. */
  flags: string[];
  /** The writer may be at risk; show support resources. */
  risk: boolean;
};

// ---- Contact details and links (blocked) -----------------------------------

const EMAIL = /[a-z0-9._%+-]+\s*(@|\(at\)|\[at\])\s*[a-z0-9-]+(\.|\s*\(dot\)\s*)[a-z]{2,}/i;
const URL_LIKE = /\b(https?:\/\/|www\.)\S+/i;
// Only endings that aren't also English words, so "over.to be honest" still passes.
const DOMAIN = /\b[a-z0-9][a-z0-9-]*\.(com|net|org|io|xyz|gg|ly|dev|ru|co\.uk|co\.in)\b/i;
const HANDLE = /(^|[\s(])@[a-z0-9_.]{3,}/i;
// Long runs of digits, allowing spaces, dots, dashes and brackets in between.
const DIGIT_RUN = /\+?\d[\d\s().-]{6,}\d/g;

function hasPhoneNumber(text: string): boolean {
  for (const match of text.match(DIGIT_RUN) ?? []) {
    const digits = match.replace(/\D/g, "").length;
    if (digits >= 10 || (match.startsWith("+") && digits >= 8)) return true;
  }
  return false;
}

// ---- Things a human should look at first (held) ----------------------------

const THREAT = [
  /\b(i('|’)?m going to|i('|’)?ll|i will|gonna|going to)\s+(kill|hurt|shoot|stab|beat|find|ruin)\s+(you|him|her|them|u)\b/i,
  /\byou\s+(deserve|ought|should)\s+to\s+die\b/i,
  /\b(kys|kill\s+yourself|go\s+die)\b/i,
  /\bi\s+know\s+where\s+you\s+live\b/i,
];

const EXPLICIT = [/\b(porn|nudes?|onlyfans|dick\s*pics?|blowjob|cum\s*shot)\b/i];

const SELF_HARM = [
  /\b(kill|killing|hurt|hurting|cut|cutting)\s+myself\b/i,
  /\bend(ing)?\s+(my|it)\s+(life|all)\b/i,
  /\b(want|wanted|wanna|going)\s+to\s+die\b/i,
  /\bsuicid(e|al)\b/i,
  /\bself[\s-]?harm/i,
  /\bno\s+reason\s+to\s+(live|go\s+on|keep\s+going)\b/i,
  /\bdon('|’)?t\s+want\s+to\s+(be\s+alive|live|exist|be\s+here)\s+any\s*more\b/i,
  /\bbetter\s+off\s+(dead|without\s+me)\b/i,
];

export function screenText(text: string): Screening {
  if (EMAIL.test(text) || URL_LIKE.test(text) || DOMAIN.test(text) || HANDLE.test(text) || hasPhoneNumber(text)) {
    return {
      block:
        "Please leave out emails, phone numbers, links and @handles. They could help someone find you, or someone else.",
      hold: false,
      flags: ["contact"],
      risk: false,
    };
  }

  const flags: string[] = [];
  if (THREAT.some((re) => re.test(text))) flags.push("threat");
  if (EXPLICIT.some((re) => re.test(text))) flags.push("explicit");
  const risk = SELF_HARM.some((re) => re.test(text));
  if (risk) flags.push("risk");

  return { block: null, hold: flags.length > 0, flags, risk };
}
