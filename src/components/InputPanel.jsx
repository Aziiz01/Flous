import { DENOMINATIONS } from '../data/denominations'

const InputPanel = ({
  amountInput,
  denomination,
  setAmountInput,
  setDenomination,
  onVisualize,
  onOpenRate,
  canVisualize = false,
}) => {
  return (
    <section className="glass rounded-2xl border border-yellow-500/15 p-4 sm:p-5">
      <header className="mb-4 sm:mb-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400/90">Tunisian dinar</p>
        <h1 className="display-font mt-1 text-2xl font-extrabold tracking-tight text-[var(--money-gold)] sm:text-3xl">
          Flous
        </h1>
        <p className="mt-2 max-w-md text-sm leading-snug text-emerald-100/85">
          See your TND amount as stacks of bills. Hit <span className="font-semibold text-yellow-200/95">Visualize</span>{' '}
          to watch it rain.
        </p>
      </header>

      <div className="grid min-w-0 gap-3 md:grid-cols-[1.15fr_0.75fr_auto_auto] md:items-end">
        <label className="min-w-0 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-500/90">
            Amount <span className="font-normal text-emerald-600/90">(max 1M TND)</span>
          </span>
          <input
            value={amountInput}
            onChange={(event) => setAmountInput(event.target.value)}
            inputMode="numeric"
            placeholder="e.g. 500,000"
            title="Whole TND, maximum 1,000,000; rounds up to full bills"
            aria-label="Amount in Tunisian dinar"
            className="money-glow w-full min-w-0 rounded-xl border border-emerald-600/35 bg-emerald-950/50 px-3 py-2.5 text-base font-semibold text-emerald-50 outline-none transition placeholder:text-emerald-700 focus:border-yellow-500/55 focus:ring-2 focus:ring-yellow-500/20 sm:py-3 md:text-lg"
          />
        </label>

        <label className="min-w-0 space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-500/90">Bill</span>
          <select
            value={denomination}
            onChange={(event) => setDenomination(Number(event.target.value))}
            aria-label="Note denomination"
            className="w-full min-w-0 rounded-xl border border-emerald-600/35 bg-emerald-950/50 px-3 py-2.5 text-base font-semibold text-emerald-50 outline-none transition focus:border-yellow-500/55 focus:ring-2 focus:ring-yellow-500/20 sm:py-3 md:text-lg"
          >
            {DENOMINATIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="col-span-full grid grid-cols-[1fr_auto] gap-2 md:contents">
          <button
            type="button"
            onClick={onVisualize}
            disabled={!canVisualize}
            title={canVisualize ? undefined : 'Enter an amount first'}
            className="money-glow h-12 touch-manipulation rounded-xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 px-4 text-sm font-extrabold uppercase tracking-[0.14em] text-yellow-50 transition hover:brightness-110 enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none md:col-span-1 md:h-[52px] md:px-6"
          >
            Visualize
          </button>

          <button
            type="button"
            onClick={onOpenRate}
            aria-label="Rate this project"
            className="flex h-12 w-[52px] shrink-0 touch-manipulation items-center justify-center rounded-xl border border-yellow-500/30 bg-emerald-950/60 text-yellow-300/95 transition hover:border-yellow-400/50 hover:bg-emerald-900/70 md:h-[52px] md:w-auto md:min-w-[4.5rem] md:flex-col md:gap-0.5 md:px-2 md:py-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span className="hidden text-[10px] font-semibold uppercase leading-none text-emerald-200/90 md:block">
              Rate
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}

export default InputPanel
