import Link from "next/link";
import { PixelHeart } from "@/components/doodles";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t-2 border-dashed border-ink/20 bg-lilac-soft/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-xl font-semibold">The Unsent Internet</p>
          <p className="mt-2 max-w-sm text-ink-soft">
            A small, quiet corner of the web for the words that never got sent. Made by hand, kept kind.
          </p>
          <p className="mt-4 inline-flex items-center gap-2 font-hand text-xl">
            handmade with
            <PixelHeart className="h-3.5 w-4 text-pink" />
            and a lot of tea
          </p>
        </div>

        <div>
          <p className="font-pixel text-sm uppercase tracking-wider text-ink-soft">Wander</p>
          <ul className="mt-3 space-y-1.5">
            <li><Link className="hover:underline" href="/write">Write a note</Link></li>
            <li><Link className="hover:underline" href="/discover">Discover notes</Link></li>
            <li><Link className="hover:underline" href="/mailbox">The Mailbox</Link></li>
          </ul>
        </div>

        <div>
          <p className="font-pixel text-sm uppercase tracking-wider text-ink-soft">Small print</p>
          <ul className="mt-3 space-y-1.5">
            <li><Link className="hover:underline" href="/guidelines">Community guidelines</Link></li>
            <li><Link className="hover:underline" href="/privacy">Privacy and anonymity</Link></li>
          </ul>
          <p className="mt-4 text-sm text-ink-soft">
            This is not a crisis service. If you are in danger, please contact your local emergency number or{" "}
            <a className="underline" href="https://findahelpline.com" target="_blank" rel="noopener noreferrer">
              find a helpline
            </a>
            .
          </p>
        </div>
      </div>

      <div className="border-t border-ink/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 font-pixel text-xs text-ink-soft sm:px-6">
          <span>best viewed with an open heart · any screen size</span>
          <span className="inline-flex items-center gap-2">
            <span className="rounded border border-ink/30 bg-paper px-1.5 py-0.5">no ads · no tracking</span>
            <span className="rounded border border-ink/30 bg-paper px-1.5 py-0.5">no likes · no followers</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
