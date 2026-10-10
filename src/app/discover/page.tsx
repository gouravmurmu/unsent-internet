import type { Metadata } from "next";
import { Suspense } from "react";
import { DiscoverFeed } from "./discover-feed";

export const metadata: Metadata = { title: "Discover" };

export default function DiscoverPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6">
      <p className="font-hand text-2xl text-ink-soft">left behind by strangers</p>
      <h1 className="font-display text-4xl font-semibold sm:text-5xl">Discover</h1>
      <p className="mt-2 max-w-xl text-ink-soft">
        Newest first, never by popularity. If something stays with you, leave a little kindness.
      </p>
      <Suspense>
        <DiscoverFeed />
      </Suspense>
    </div>
  );
}
