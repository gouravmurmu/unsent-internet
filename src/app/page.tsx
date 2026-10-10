import Link from "next/link";
import { Flower, PixelHeart, Sparkle, Stamp, SquiggleUnderline } from "@/components/doodles";
import { LatestNotes } from "@/components/latest-notes";

const PROMISES = [
  {
    id: "anonymity",
    title: "No names, no profiles",
    body: "You don't need an account to write or read. Other visitors never see who you are. We keep as little as we can, though no website can promise to be completely untraceable.",
    accent: "bg-cloud",
    icon: <Sparkle className="h-6 w-6 text-cloud" />,
  },
  {
    id: "kindness",
    title: "Kindness, not counts",
    body: "There are no likes, followers or leaderboards. You can leave a small kind word on a note, and that's the whole point.",
    accent: "bg-pink-soft",
    icon: <PixelHeart className="h-5 w-6 text-pink" />,
  },
  {
    id: "guidelines",
    title: "Kept gentle",
    body: "No names of real people, no threats, no harassment, nothing that could help someone find you or anyone else. Notes can be reported and are reviewed by a human.",
    accent: "bg-butter-soft",
    icon: <Flower className="h-6 w-6 text-lilac" />,
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero */}
      <section
        aria-labelledby="hero-title"
        className="relative mt-8 overflow-hidden rounded-[10px] border-2 border-ink bg-cloud px-6 py-12 sm:px-12 sm:py-16"
      >
        <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:radial-gradient(rgb(255_255_255/0.8)_1.5px,transparent_1.5px)] [background-size:18px_18px]" aria-hidden="true" />
        <Sparkle className="animate-twinkle absolute right-[12%] top-8 h-7 w-7 text-butter" />
        <Sparkle className="animate-twinkle absolute bottom-10 right-[30%] hidden h-5 w-5 text-white [animation-delay:1.2s] sm:block" />

        <div className="relative grid items-center gap-10 md:grid-cols-[1.35fr_1fr]">
          <div>
            <p className="font-hand text-2xl text-ink-soft">psst, no one&apos;s watching…</p>
            <h1 id="hero-title" className="mt-2 font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Some words just need{" "}
              <span className="relative inline-block">
                somewhere to go.
                <SquiggleUnderline className="absolute -bottom-2 left-0 h-3 w-full text-pink" />
              </span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed">
              Write the thing you never sent. Leave it here. Let it be enough.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/write" className="btn btn-primary">
                <span aria-hidden="true">✎</span> Write an unsent note
              </Link>
              <Link href="/discover" className="btn btn-secondary">
                Read what others left behind
              </Link>
            </div>
          </div>

          {/* The letter in the hero */}
          <div className="relative mx-auto w-full max-w-xs md:max-w-sm" aria-hidden="true">
            <div className="animate-float relative rotate-[3deg] rounded-[6px] border-2 border-ink bg-paper p-6 shadow-[6px_6px_0_0_var(--color-ink)]">
              <span className="tape" />
              <p className="font-hand text-[1.6rem] leading-snug">
                Dear you,
                <br />
                I never said it out loud, so I&apos;m leaving it here instead.
              </p>
              <p className="mt-4 text-right font-hand text-xl text-ink-soft">— no one, really</p>
              <Stamp label="Unsent" className="absolute -bottom-6 -right-5 rotate-[8deg]" />
            </div>
          </div>
        </div>
      </section>

      {/* Note preview */}
      <section aria-labelledby="notes-title" className="mt-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-pixel text-sm uppercase tracking-wider text-ink-soft">Fresh from the mailbox</p>
            <h2 id="notes-title" className="mt-1 font-display text-3xl font-semibold sm:text-4xl">
              Left behind recently
            </h2>
          </div>
          <Link href="/discover" className="font-display text-lg underline decoration-pink decoration-wavy decoration-2 underline-offset-[6px] hover:decoration-ink">
            See more notes →
          </Link>
        </div>

        <div className="mt-10">
          <LatestNotes />
        </div>
      </section>

      {/* Promises */}
      <section aria-labelledby="promises-title" className="mt-16">
        <h2 id="promises-title" className="font-display text-3xl font-semibold sm:text-4xl">
          How it works here
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {PROMISES.map((p, i) => (
            <div
              key={p.id}
              id={p.id}
              className={`scroll-mt-6 rounded-[8px] border-2 border-ink/80 ${p.accent} p-6 ${i === 1 ? "md:translate-y-4" : ""}`}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink bg-paper">{p.icon}</span>
                <h3 className="font-display text-xl font-semibold">{p.title}</h3>
              </div>
              <p className="mt-3 leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing invitation */}
      <section className="mt-20 text-center">
        <p className="font-hand text-3xl">You don&apos;t need to explain who you are.</p>
        <p className="mt-1 font-display text-2xl font-medium">You just need somewhere to put the words.</p>
        <Link href="/write" className="btn btn-primary mt-6">
          Open the diary
        </Link>
      </section>
    </div>
  );
}
