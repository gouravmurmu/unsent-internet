import Link from "next/link";
import { EnvelopeMascot } from "@/components/doodles";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <EnvelopeMascot className="animate-float mx-auto h-20 w-24" />
      <h1 className="mt-6 font-display text-4xl font-semibold">Lost in the post</h1>
      <p className="mt-3 text-lg text-ink-soft">This page wandered off somewhere. It happens to the best of letters.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-secondary">Back home</Link>
        <Link href="/discover" className="btn btn-primary">Read a note</Link>
      </div>
    </div>
  );
}
