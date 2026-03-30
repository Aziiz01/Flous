import { AZIZ_LINKEDIN_URL, AZIZ_PORTFOLIO_URL } from '../config/credit'

export default function AuthorCreditBanner({ visible, stacked = false }) {
  if (!visible) return null

  const card = (
    <div className="glass rounded-2xl border border-amber-400/30 bg-zinc-950/65 px-4 py-3 text-center shadow-[0_16px_48px_rgba(0,0,0,0.4)] backdrop-blur-xl">
        <p className="text-sm font-medium text-amber-50/95">
          <span className="display-font font-semibold text-amber-200/95">Flous</span>
          {' — '}
          Built by Aziz — I turned money into art. Imagine what I&apos;d do for your product 🚀
        </p>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-amber-200/85">
          <a
            href={AZIZ_LINKEDIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md underline decoration-amber-400/50 underline-offset-2 transition hover:text-amber-50 hover:decoration-amber-300"
          >
            LinkedIn
          </a>
          <span className="text-zinc-500">·</span>
          <a
            href={AZIZ_PORTFOLIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md underline decoration-amber-400/50 underline-offset-2 transition hover:text-amber-50 hover:decoration-amber-300"
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
    <div className="pointer-events-auto fixed bottom-[max(0.75rem,env(safe-area-inset-bottom,0px))] left-1/2 z-[32] w-[min(26rem,calc(100vw-1.5rem))] -translate-x-1/2 px-2">
      {card}
    </div>
  )
}
