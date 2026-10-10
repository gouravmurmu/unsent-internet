import Link from "next/link";
import { EnvelopeMascot } from "@/components/doodles";

export function NoteGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid items-start gap-x-7 gap-y-9 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Loading notes">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rounded-[6px] border-2 border-ink/15 bg-paper/70 p-5">
          <div className="flex justify-between">
            <div className="skeleton h-5 w-16" />
            <div className="skeleton h-5 w-24" />
          </div>
          <div className="skeleton mt-5 h-4 w-full" />
          <div className="skeleton mt-3 h-4 w-11/12" />
          <div className="skeleton mt-3 h-4 w-2/3" />
          <div className="skeleton mt-6 h-6 w-32" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md rounded-[10px] border-2 border-dashed border-ink/30 px-6 py-12 text-center">
      <EnvelopeMascot className="mx-auto h-14 w-16 opacity-80" />
      <p className="mt-4 font-display text-2xl font-semibold">{title}</p>
      {children && <div className="mt-2 text-ink-soft">{children}</div>}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="mx-auto max-w-md rounded-[10px] border-2 border-ink bg-pink-soft px-6 py-10 text-center">
      <p className="font-display text-2xl font-semibold">The mail got stuck somewhere.</p>
      <p className="mt-2 text-ink-soft">We couldn&apos;t load notes just now. It&apos;s not you.</p>
      <div className="mt-5 flex justify-center gap-3">
        <button type="button" onClick={onRetry} className="btn btn-primary">Try again</button>
        <Link href="/" className="btn btn-secondary">Go home</Link>
      </div>
    </div>
  );
}
