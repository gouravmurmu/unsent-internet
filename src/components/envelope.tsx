/** Front of an envelope with a flap that can be animated open or closed. */
export function Envelope({ flapClass = "", className = "" }: { flapClass?: string; className?: string }) {
  return (
    <div className={`relative aspect-[3/2] w-full [perspective:600px] ${className}`} aria-hidden="true">
      <div className="absolute inset-0 rounded-[6px] border-2 border-ink bg-[#fff1d6]" />
      {/* Side folds */}
      <svg viewBox="0 0 300 200" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <path d="M2 198 150 95 298 198" fill="#ffe7bd" stroke="#292743" strokeWidth="3" strokeLinejoin="round" />
      </svg>
      {/* Flap */}
      <svg
        viewBox="0 0 300 120"
        className={`absolute left-0 top-0 h-[60%] w-full [backface-visibility:visible] ${flapClass}`}
        preserveAspectRatio="none"
      >
        <path d="M2 2 150 115 298 2Z" fill="#ffd9a0" stroke="#292743" strokeWidth="3" strokeLinejoin="round" />
      </svg>
      <span className="absolute bottom-[18%] left-1/2 grid h-9 w-9 -translate-x-1/2 place-items-center rounded-full border-2 border-ink bg-pink text-lg">
        ♥
      </span>
    </div>
  );
}
