import Link from "next/link";
import { EnvelopeMascot } from "@/components/doodles";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/write", label: "Write a Note" },
  { href: "/discover", label: "Discover" },
  { href: "/mailbox", label: "The Mailbox" },
];

export function SiteHeader() {
  return (
    <header className="mx-auto w-full max-w-6xl px-4 pt-5 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <Link href="/" className="group inline-flex items-center gap-2.5 self-start rounded-lg">
          <EnvelopeMascot className="h-10 w-12 shrink-0 transition-transform duration-200 group-hover:-rotate-6" />
          <span className="leading-none">
            <span className="block font-hand text-lg text-ink-soft">the</span>
            <span className="-mt-1 block font-display text-2xl font-semibold tracking-tight">
              Unsent <span className="text-[#e5568a]">Internet</span>
            </span>
          </span>
        </Link>

        <nav aria-label="Main">
          <ul className="flex flex-wrap gap-x-1 gap-y-1 font-pixel text-[0.95rem]">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-block rounded-md px-2 py-1 text-ink underline decoration-dotted decoration-2 underline-offset-4 transition-colors hover:bg-butter hover:decoration-solid"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="mt-4 border-b-2 border-dashed border-ink/20" />
    </header>
  );
}
