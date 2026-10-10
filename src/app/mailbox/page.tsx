import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "The Mailbox" };

export default function MailboxPage() {
  return <ComingSoon title="The Mailbox" blurb="Your saved notes and unfinished drafts, kept in this browser only." />;
}
