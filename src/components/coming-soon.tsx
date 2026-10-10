import Link from "next/link";
import { EnvelopeMascot } from "@/components/doodles";

/** Placeholder for pages that are planned but not built yet. */
export function ComingSoon({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <EnvelopeMascot className="animate-float mx-auto h-20 w-24" />
      <h1 className="mt-6 font-display text-4xl font-semibold">{title}</h1>
      <p className="mt-3 text-lg text-ink-soft">{blurb}</p>
      <p className="mt-6 inline-block rounded-full border border-dashed border-ink/40 bg-paper px-4 py-1.5 font-hand text-xl">
        still being folded and stamped, check back soon
      </p>
      <div className="mt-8">
        <Link href="/" className="btn btn-secondary">Back home</Link>
      </div>
    </div>
  );
}
