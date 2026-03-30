import { DENOMINATIONS } from '../data/denominations'
import { formatNumber } from '../utils/format'

const InputPanel = ({
  amountInput,
  denomination,
  setAmountInput,
  setDenomination,
  onVisualize,
  onOpenRate,
}) => {
  return (
    <section className="glass rounded-2xl p-3 sm:p-4 md:p-5">
      <header className="mb-3 border-b border-white/10 pb-3 sm:mb-4">
        <h1 className="display-font text-lg font-bold tracking-tight text-amber-50 sm:text-xl md:text-2xl">
          Flous
        </h1>
        <p className="mt-0.5 text-[11px] text-zinc-400 sm:text-xs">
          Tunisian dinar (TND) · money visualization
        </p>
      </header>
      <div className="grid min-w-0 gap-3 md:grid-cols-[1.1fr_0.7fr_auto_auto] md:items-end">
        <label className="min-w-0 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
            Enter amount
          </span>
          <input
            value={amountInput}
            onChange={(event) => setAmountInput(event.target.value)}
            inputMode="numeric"
            placeholder="1,000,000"
            className="w-full min-w-0 rounded-xl border border-white/10 bg-zinc-900/70 px-3 py-2.5 text-base font-semibold text-zinc-100 outline-none transition hover:border-amber-400/45 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25 sm:px-4 sm:py-3 md:text-xl"
          />
        </label>

        <label className="min-w-0 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
            Denomination (TND)
          </span>
          <select
            value={denomination}
            onChange={(event) => setDenomination(Number(event.target.value))}
            className="w-full min-w-0 rounded-xl border border-white/10 bg-zinc-900/70 px-3 py-2.5 text-base font-semibold text-zinc-100 outline-none transition hover:border-amber-400/45 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25 sm:px-4 sm:py-3 md:text-lg"
          >
            {DENOMINATIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="col-span-full grid min-w-0 grid-cols-2 gap-2 md:col-span-1 md:contents">
          <button
            type="button"
            onClick={onVisualize}
            className="amber-glow h-[48px] touch-manipulation rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 px-2 text-xs font-bold uppercase tracking-[0.1em] text-zinc-950 transition hover:-translate-y-0.5 sm:h-[52px] sm:px-3 sm:text-sm sm:tracking-[0.12em] md:px-5"
          >
            Visualize
          </button>

          <button
            type="button"
            onClick={onOpenRate}
            className="flex h-[48px] touch-manipulation items-center justify-center gap-1 rounded-xl border border-amber-400/35 bg-zinc-900/70 px-1.5 text-[10px] font-semibold uppercase leading-tight tracking-[0.06em] text-amber-100/95 transition hover:border-amber-300/55 hover:bg-zinc-800/80 sm:h-[52px] sm:gap-1.5 sm:px-2 sm:text-[11px] sm:tracking-[0.08em] md:gap-2 md:px-4 md:text-[13px] md:tracking-[0.1em]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 text-amber-300"
              aria-hidden
            >
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Rate Flous
          </button>
        </div>
      </div>

      <p className="mt-2 text-[11px] leading-snug text-zinc-500 sm:text-xs">
        Max input is {formatNumber(9999999999)}. Values auto-round to whole bills.
      </p>
    </section>
  )
}

export default InputPanel
