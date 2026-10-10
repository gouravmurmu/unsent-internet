"use client";

import Link from "next/link";
import { useEffect } from "react";
import { EnvelopeMascot } from "@/components/doodles";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6" role="alert">
      <EnvelopeMascot className="mx-auto h-20 w-24" />
      <h1 className="mt-6 font-display text-4xl font-semibold">The envelope got a little crumpled</h1>
      <p className="mt-3 text-lg text-ink-soft">
        Something went wrong on our side. If you were writing, a draft you chose to keep is still in this browser.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn btn-primary">Try again</button>
        <Link href="/" className="btn btn-secondary">Back home</Link>
      </div>
    </div>
  );
}
