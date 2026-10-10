import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Discover" };

export default function DiscoverPage() {
  return <ComingSoon title="Discover" blurb="Fresh notes, a random note from Lost & Found, and notes that could use a little kindness." />;
}
