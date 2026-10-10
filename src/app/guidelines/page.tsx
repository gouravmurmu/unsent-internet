import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Community guidelines",
  description: "How we keep The Unsent Internet gentle.",
};

const PLEASE = [
  "Write to someone, or no one, about anything you're carrying: love, regret, hope, the silly stuff too.",
  "Leave kind words on other people's notes. A sentence is plenty.",
  "Report anything that breaks these guidelines. It's anonymous, and a person reviews every report.",
];

const PLEASE_DONT = [
  {
    title: "Share anything that could identify someone",
    body: "No full names of real people, addresses, schools or workplaces, phone numbers, emails, social handles or links. That includes you. Notes with contact details or links can't be sent at all.",
  },
  {
    title: "Threaten, harass or target anyone",
    body: "No threats, no hate, no going after a person or group. Writing about how someone hurt you is fine; trying to hurt them back is not.",
  },
  {
    title: "Post sexual or graphic content",
    body: "Notes here can be read by anyone, so keep it out.",
  },
  {
    title: "Advertise or spam",
    body: "No selling, promoting or repeating the same note over and over.",
  },
];

export default function GuidelinesPage() {
  return (
    <article className="mx-auto max-w-2xl px-4 pt-8 sm:px-6">
      <p className="font-hand text-2xl text-ink-soft">the small print, written kindly</p>
      <h1 className="font-display text-4xl font-semibold sm:text-5xl">Community guidelines</h1>
      <p className="mt-4 text-lg">
        This is a quiet place for words that never got sent. It only works if everyone who visits feels safe, so a few
        simple rules keep it that way.
      </p>

      <section aria-labelledby="please" className="mt-10">
        <h2 id="please" className="font-display text-2xl font-semibold">Please do</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          {PLEASE.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="please-dont" className="mt-10">
        <h2 id="please-dont" className="font-display text-2xl font-semibold">Please don&apos;t</h2>
        <div className="mt-4 space-y-4">
          {PLEASE_DONT.map((item) => (
            <div key={item.title} className="rounded-[8px] border-2 border-ink/80 bg-paper p-5">
              <h3 className="font-display text-lg font-medium">{item.title}</h3>
              <p className="mt-1">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="moderation" className="mt-10">
        <h2 id="moderation" className="font-display text-2xl font-semibold">How moderation works</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6">
          <li>Every note and reply gets a quick automatic check when it&apos;s sent.</li>
          <li>
            If something might break these guidelines, it waits for a person to read it before anyone else sees it.
          </li>
          <li>Anyone can report a note or reply. Once a few people have, it&apos;s taken down until a person reviews it.</li>
          <li>We may hide or remove anything that breaks these guidelines, without notice.</li>
          <li>
            You can take down your own notes at any time from <Link className="underline" href="/mailbox">The Mailbox</Link>{" "}
            with your recovery code.
          </li>
        </ul>
      </section>

      <section aria-labelledby="not-crisis" className="mt-10 rounded-[8px] border-2 border-ink bg-lilac-soft p-5">
        <h2 id="not-crisis" className="font-display text-xl font-semibold">This isn&apos;t a crisis service</h2>
        <p className="mt-2">
          No one here is watching in real time, and we can&apos;t reach out to you. If you&apos;re thinking about hurting
          yourself or might be in danger, please call your local emergency number or a helpline: Tele-MANAS{" "}
          <a className="underline" href="tel:14416">14416</a> in India, <a className="underline" href="tel:988">988</a> in
          the US, Samaritans <a className="underline" href="tel:116123">116 123</a> in the UK and Ireland, or find one near
          you at{" "}
          <a className="underline" href="https://findahelpline.com" target="_blank" rel="noopener noreferrer">
            findahelpline.com
          </a>
          .
        </p>
      </section>
    </article>
  );
}
