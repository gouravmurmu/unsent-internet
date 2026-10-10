import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Write a Note" };

export default function WritePage() {
  return <ComingSoon title="The writing room" blurb="A quiet, open diary where you can write the thing you never sent." />;
}
