"use client";

import { Flower, PixelHeart, Sparkle } from "@/components/doodles";

const PIECES = [
  { dx: -34, dy: -42, rot: -20, kind: "heart" },
  { dx: 0, dy: -56, rot: 10, kind: "star" },
  { dx: 32, dy: -44, rot: 25, kind: "flower" },
  { dx: -48, dy: -14, rot: -35, kind: "star" },
  { dx: 46, dy: -16, rot: 30, kind: "heart" },
  { dx: 14, dy: -70, rot: -10, kind: "heart" },
] as const;

/** A one-shot puff of tiny hearts, stars and flowers. Remount it (via key) to replay. */
export function Burst() {
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 motion-reduce:hidden">
      {PIECES.map((p, i) => (
        <span
          key={i}
          className="burst-piece"
          style={{ "--dx": `${p.dx}px`, "--dy": `${p.dy}px`, "--rot": `${p.rot}deg`, animationDelay: `${i * 30}ms` } as React.CSSProperties}
        >
          {p.kind === "heart" && <PixelHeart className="h-full w-full text-pink" />}
          {p.kind === "star" && <Sparkle className="h-full w-full text-butter" />}
          {p.kind === "flower" && <Flower className="h-full w-full text-lilac" />}
        </span>
      ))}
    </span>
  );
}
