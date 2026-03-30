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
    <section className="glass rounded-2xl p-4 md:p-5">
      <header className="mb-4 border-b border-white/10 pb-3">
        <h1 className="display-font text-xl font-bold tracking-tight text-amber-50 md:text-2xl">Flous</h1>
        <p className="mt-0.5 text-xs text-zinc-400">
          Tunisian dinar (TND) · money visualization
        </p>
      </header>
      <div className="grid gap-3 md:grid-cols-[1.1fr_0.7fr_auto_auto] md:items-end">
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
            Enter amount
          </span>
          <input
            value={amountInput}
            onChange={(event) => setAmountInput(event.target.value)}
            inputMode="numeric"
            placeholder="1,000,000"
            className="w-full rounded-xl border border-white/10 bg-zinc-900/70 px-4 py-3 text-xl font-semibold text-zinc-100 outline-none transition hover:border-amber-400/45 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25"
          />
        </label>

        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
            Denomination (TND)
          </span>
          <select
            value={denomination}
            onChange={(event) => setDenomination(Number(event.target.value))}
            className="w-full rounded-xl border border-white/10 bg-zinc-900/70 px-4 py-3 text-lg font-semibold text-zinc-100 outline-none transition hover:border-amber-400/45 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25"
          >
            {DENOMINATIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="col-span-full grid grid-cols-2 gap-2 md:col-span-1 md:contents">
          <button
            type="button"
            onClick={onVisualize}
            className="amber-glow h-[52px] rounded-xl bg-gradient-to-br from-amber-300 to-amber-500 px-3 text-sm font-bold uppercase tracking-[0.12em] text-zinc-950 transition hover:-translate-y-0.5 md:px-5"
          >
            Visualize
          </button>

          <button
            type="button"
            onClick={onOpenRate}
            className="flex h-[52px] items-center justify-center gap-1.5 rounded-xl border border-amber-400/35 bg-zinc-900/70 px-2 text-[11px] font-semibold uppercase leading-tight tracking-[0.08em] text-amber-100/95 transition hover:border-amber-300/55 hover:bg-zinc-800/80 md:gap-2 md:px-4 md:text-[13px] md:tracking-[0.1em]"
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

      <p className="mt-2 text-xs text-zinc-500">
        Max input is {formatNumber(9999999999)}. Values auto-round to whole bills.
      </p>
    </section>
  )
}

export default InputPanel
