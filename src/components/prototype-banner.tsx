/** Honest label while the site runs on sample data. Remove when the database is live. */
export function PrototypeBanner() {
  return (
    <div className="border-b-2 border-dashed border-ink/25 bg-butter-soft px-4 py-2 text-center text-sm">
      <span className="font-pixel text-xs uppercase tracking-wider">Prototype</span>{" "}
      <span className="text-ink-soft">
        Notes, reactions and replies are only saved in this browser for now. Nobody else can see what you post yet.
      </span>
    </div>
  );
}
