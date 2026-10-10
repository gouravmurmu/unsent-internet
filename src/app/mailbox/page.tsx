import type { Metadata } from "next";
import { Mailbox } from "./mailbox";

export const metadata: Metadata = { title: "The Mailbox" };

export default function MailboxPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
      <p className="font-hand text-2xl text-ink-soft">just for you, on this device</p>
      <h1 className="font-display text-4xl font-semibold sm:text-5xl">The Mailbox</h1>
      <p className="mt-2 max-w-xl text-ink-soft">
        Notes you&apos;ve saved and drafts you haven&apos;t sent. No account, no profile.
      </p>
      <Mailbox />
    </div>
  );
}
