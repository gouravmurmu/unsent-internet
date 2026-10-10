import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/** The little envelope who lives in the wordmark. */
export function EnvelopeMascot(props: IconProps) {
  return (
    <svg viewBox="0 0 48 40" fill="none" aria-hidden="true" {...props}>
      <rect x="3" y="7" width="42" height="29" rx="4" fill="#FFF8E9" stroke="#292743" strokeWidth="2.5" />
      <path d="M4.5 9.5 24 23 43.5 9.5" stroke="#292743" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="17" cy="27" r="1.9" fill="#292743" />
      <circle cx="31" cy="27" r="1.9" fill="#292743" />
      <path d="M21.5 30.5c1.5 1.4 3.5 1.4 5 0" stroke="#292743" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="13" cy="31" rx="2.4" ry="1.4" fill="#FF91B8" opacity=".8" />
      <ellipse cx="35" cy="31" rx="2.4" ry="1.4" fill="#FF91B8" opacity=".8" />
      <path d="M38 3.5c1.2-1.6 3.8-.6 3.3 1.4-.4 1.6-3.3 3.6-3.3 3.6s-2.9-2-3.3-3.6c-.5-2 2.1-3 3.3-1.4Z" fill="#FF91B8" stroke="#292743" strokeWidth="1.4" />
    </svg>
  );
}

export function Sparkle(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M12 1.5c.8 5.4 3.1 7.7 8.5 8.5-5.4.8-7.7 3.1-8.5 8.5-.8-5.4-3.1-7.7-8.5-8.5 5.4-.8 7.7-3.1 8.5-8.5Z"
        fill="currentColor"
        stroke="#292743"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Chunky pixel heart, drawn on an 8x7 grid. */
export function PixelHeart(props: IconProps) {
  const cells = [
    "01100110",
    "11111111",
    "11111111",
    "01111110",
    "00111100",
    "00011000",
  ];
  return (
    <svg viewBox="0 0 8 6" shapeRendering="crispEdges" aria-hidden="true" {...props}>
      {cells.flatMap((row, y) =>
        [...row].map((c, x) =>
          c === "1" ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" /> : null,
        ),
      )}
    </svg>
  );
}

export function Flower(props: IconProps) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" {...props}>
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse
          key={deg}
          cx="16"
          cy="8.5"
          rx="5"
          ry="6.5"
          fill="currentColor"
          stroke="#292743"
          strokeWidth="1.4"
          transform={`rotate(${deg} 16 16)`}
        />
      ))}
      <circle cx="16" cy="16" r="4.2" fill="#FFE58A" stroke="#292743" strokeWidth="1.4" />
    </svg>
  );
}

export function SquiggleUnderline(props: IconProps) {
  return (
    <svg viewBox="0 0 220 14" fill="none" preserveAspectRatio="none" aria-hidden="true" {...props}>
      <path
        d="M2 8c14-7 24 5 38-1s24-6 38 0 24 6 38 0 24-6 38 0 24 6 38 0 18-4 26-2"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Postage stamp with a perforated edge. */
export function Stamp({ label, className = "" }: { label: string; className?: string }) {
  return (
    <span
      className={`stamp-edge inline-flex flex-col items-center justify-center bg-butter px-3 py-2 text-center ${className}`}
      aria-hidden="true"
    >
      <span className="block border-2 border-dashed border-ink/60 px-2 py-1 font-pixel text-[0.7rem] uppercase leading-tight tracking-wider">
        {label}
      </span>
    </span>
  );
}
