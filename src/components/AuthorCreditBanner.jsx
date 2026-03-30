import { AZIZ_LINKEDIN_URL, AZIZ_PORTFOLIO_URL } from '../config/credit'

export default function AuthorCreditBanner({ visible, stacked = false }) {
  if (!visible) return null

  const card = (
    <div className="glass rounded-2xl border border-yellow-500/25 bg-emerald-950/70 px-3 py-2.5 text-center shadow-[0_16px_48px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:px-4 sm:py-3">
        <p className="text-xs font-medium leading-snug text-emerald-100/95 sm:text-sm">
          <span className="display-font font-semibold text-[var(--money-gold)]">Flous</span>
          {' — '}
          By Aziz · money &amp; motion, for your next project.
        </p>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-emerald-300/90">
          <a
            href={AZIZ_LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md underline decoration-yellow-500/45 underline-offset-2 transition hover:text-yellow-100 hover:decoration-yellow-300"
          >
            LinkedIn
          </a>
          <span className="text-emerald-700">·</span>
          <a
            href={AZIZ_PORTFOLIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md underline decoration-yellow-500/45 underline-offset-2 transition hover:text-yellow-100 hover:decoration-yellow-300"
          >
            Portfolio
          </a>
        </p>
      </div>
  )

  if (stacked) {
    return <div className="pointer-events-auto w-full max-w-[min(26rem,calc(100vw-1.5rem))]">{card}</div>
  }

  return (
    <div className="pointer-events-auto fixed bottom-[max(0.75rem,env(safe-area-inset-bottom,0px))] left-1/2 z-[32] w-[min(26rem,calc(100vw-1rem))] -translate-x-1/2 px-2">
      {card}
    </div>
  )
}
