/**
 * Shown when something someone wrote sounds like they might be in pain.
 * Gentle, not alarming, and clear that this site isn't a crisis service.
 */
export function SupportResources({ className = "" }: { className?: string }) {
  return (
    <aside
      aria-label="Support if you're struggling"
      className={`rounded-[8px] border-2 border-ink bg-lilac-soft p-5 text-left ${className}`}
    >
      <h2 className="font-display text-lg font-medium">
        If you&apos;re carrying something heavy right now
      </h2>
      <p className="mt-1 text-sm">
        You don&apos;t have to hold it alone. This little site can&apos;t help in an emergency, but these people can, any
        time of day, for free:
      </p>
      <ul className="mt-3 space-y-1.5 text-sm">
        <li>
          <strong>India:</strong> Tele-MANAS, call <a className="underline" href="tel:14416">14416</a>
        </li>
        <li>
          <strong>US:</strong> call or text <a className="underline" href="tel:988">988</a>
        </li>
        <li>
          <strong>UK and Ireland:</strong> Samaritans, call <a className="underline" href="tel:116123">116 123</a>
        </li>
        <li>
          <strong>Anywhere else:</strong>{" "}
          <a className="underline" href="https://findahelpline.com" target="_blank" rel="noopener noreferrer">
            findahelpline.com
          </a>
        </li>
      </ul>
      <p className="mt-3 text-sm">If you might be in danger right now, please call your local emergency number.</p>
    </aside>
  );
}
