/** Compact bar to reopen scale / buying-power panel after it was closed. Place in normal flow under the bill counter (parent sets width). */
const ScaleInsightsDock = ({ onOpen }) => {
  return (
    <div className="w-full">
      <button
        type="button"
        onClick={onOpen}
        className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-400/35 bg-gradient-to-r from-zinc-900/95 via-zinc-950/95 to-zinc-900/95 px-4 py-3 text-sm font-semibold text-amber-100 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-xl transition hover:border-amber-300/55 hover:shadow-[0_12px_40px_rgba(251,191,36,0.12)] md:py-3.5"
      >
        <span className="text-base" aria-hidden>
          📊
        </span>
        <span className="tracking-wide">Scale &amp; buying power</span>
        <span
          className="text-amber-400/90 transition group-hover:translate-y-[2px]"
          aria-hidden
        >
          ↓
        </span>
      </button>
    </div>
  )
}

export default ScaleInsightsDock
