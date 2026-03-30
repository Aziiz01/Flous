/** Reopen scale / buying-power after a run. */
const ScaleInsightsDock = ({ onOpen }) => {
  return (
    <div className="w-full">
      <button
        type="button"
        onClick={onOpen}
        className="group flex w-full touch-manipulation items-center justify-center gap-2 rounded-2xl border border-yellow-500/30 bg-gradient-to-r from-emerald-950/95 via-emerald-900/90 to-emerald-950/95 px-4 py-3 text-sm font-semibold text-[var(--money-gold)] shadow-[0_10px_36px_rgba(0,0,0,0.4)] backdrop-blur-xl transition hover:border-yellow-400/45 hover:shadow-[0_14px_44px_rgba(20,82,61,0.25)] sm:py-3.5"
      >
        <span className="text-base" aria-hidden>
          📏
        </span>
        <span className="tracking-wide">Size &amp; buying power</span>
        <span className="text-yellow-400/80 transition group-hover:translate-y-0.5" aria-hidden>
          →
        </span>
      </button>
    </div>
  )
}

export default ScaleInsightsDock
