import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy and anonymity",
  description: "What The Unsent Internet keeps, what it doesn't, and what anonymity means here.",
};

const KEPT = [
  {
    what: "Your notes and replies",
    detail: "The text, the mood you picked and when it was sent. Published ones can be read by anyone.",
  },
  {
    what: "A scrambled browser token",
    detail:
      "Your browser gets a random cookie with nothing about you in it. We store a scrambled (hashed) version next to what you send, so we can limit spam and stop the same kindness being sent twice. It can't be turned back into the cookie.",
  },
  {
    what: "A scrambled network address, briefly",
    detail:
      "Your IP address is scrambled the same way and used only for rate limits. Those records are cleared after about a day. We never store the raw address.",
  },
  {
    what: "A scrambled recovery code",
    detail:
      "So you can find and take down your notes later. We only keep a one-way hash; the code itself lives in your browser and wherever you saved it.",
  },
  {
    what: "Reports",
    detail: "Which note or reply was reported and why, kept so a moderator can review it.",
  },
];

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 pt-8 sm:px-6">
      <p id="anonymity" className="font-hand text-2xl text-ink-soft">plainly, no legalese</p>
      <h1 className="font-display text-4xl font-semibold sm:text-5xl">Privacy and anonymity</h1>

      <section aria-labelledby="anon" className="mt-6">
        <h2 id="anon" className="font-display text-2xl font-semibold">What anonymous means here</h2>
        <p className="mt-3">
          You never need an account, a name or an email. Other visitors can&apos;t see who wrote a note, and notes
          aren&apos;t linked to each other publicly.
        </p>
        <p className="mt-3">
          But no website can promise to be completely untraceable. Our hosting providers keep standard request logs, and
          the words you write can identify you if they contain details about your life. If staying hidden really matters,
          leave out anything specific and think twice before writing about something only a few people know.
        </p>
      </section>

      <section aria-labelledby="kept" className="mt-10">
        <h2 id="kept" className="font-display text-2xl font-semibold">What we keep</h2>
        <dl className="mt-4 space-y-4">
          {KEPT.map((k) => (
            <div key={k.what} className="rounded-[8px] border-2 border-ink/80 bg-paper p-5">
              <dt className="font-display text-lg font-medium">{k.what}</dt>
              <dd className="mt-1">{k.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="browser" className="mt-10">
        <h2 id="browser" className="font-display text-2xl font-semibold">What stays in your browser</h2>
        <p className="mt-3">
          Drafts (only if you turn on &ldquo;keep a draft&rdquo;), notes you save, which notes you&apos;ve been kind to or
          reported, and your recovery code. These never leave your device. Clearing your browser&apos;s site data removes
          them.
        </p>
      </section>

      <section aria-labelledby="not-kept" className="mt-10">
        <h2 id="not-kept" className="font-display text-2xl font-semibold">What we don&apos;t do</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>No ads, no analytics, no tracking pixels.</li>
          <li>No selling or sharing what you write.</li>
          <li>No likes, followers or public profiles.</li>
        </ul>
      </section>

      <section aria-labelledby="control" className="mt-10">
        <h2 id="control" className="font-display text-2xl font-semibold">Taking things down</h2>
        <p className="mt-3">
          Use your recovery code in <Link className="underline" href="/mailbox">The Mailbox</Link> to find and take down any
          note you wrote. A taken-down note disappears from the site straight away.
        </p>
        <p className="mt-3">
          Where we store things: the site runs on Vercel and the notes live in a Supabase database.
        </p>
      </section>
    </article>
  );
}
