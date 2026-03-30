import { AZIZ_LINKEDIN_URL, AZIZ_PORTFOLIO_URL } from '../config/credit'
import { formatNumber } from './format'

function OutLink({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="pointer-events-auto font-semibold text-yellow-300 underline decoration-yellow-500/55 underline-offset-2 transition hover:text-yellow-200"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </a>
  )
}

function mulberry32(seed) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle(array, seed) {
  const out = [...array]
  const rand = mulberry32(seed)
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * Funny, portfolio-aware toast sequence. Each item: { minProgress, content }.
 */
export function buildStackingToastSequence(totalBills, runId) {
  const early = [
    <>Still cheaper than my therapy bills.</>,
    <>Making it rain (production budget: vibes).</>,
    <>My GPU just asked for a raise.</>,
  ]

  const mid = shuffle(
    [
      <>
        {totalBills > 0 ? (
          <>
            That&apos;s <strong className="text-yellow-200">{formatNumber(totalBills)}</strong> bills. I counted so you
            don&apos;t have to.
          </>
        ) : (
          <>That&apos;s a lot of paper. I hope you&apos;re proud.</>
        )}
      </>,
      <>If you&apos;re hiring: I build silly things that run fast in production.</>,
      <>
        You should see my other projects — same energy, different repo:{' '}
        <OutLink href={AZIZ_PORTFOLIO_URL}>medaziznacib.in</OutLink>
      </>,
      <>
        <strong className="text-yellow-200">Hire me</strong> — I turned money into a theme park. Imagine your backlog.{' '}
        <OutLink href={AZIZ_LINKEDIN_URL}>Stalk me here</OutLink>
        {' · '}
        <OutLink href={AZIZ_PORTFOLIO_URL}>Portfolio</OutLink>
      </>,
      <>I accept payment in coffee, compliments, and full-time offers.</>,
      <>Fun fact: this stack is taller than my sleep schedule.</>,
    ],
    runId + 1337,
  )

  const late = [
    <>
      Almost done — don&apos;t refresh or I&apos;ll take it personally
      {totalBills > 0 ? (
        <> ({formatNumber(totalBills)} bills).</>
      ) : (
        <>.</>
      )}
    </>,
    <>
      Vault sealed. Peek at <strong className="text-yellow-200">Size &amp; buying power</strong> when you&apos;re
      ready.
    </>,
  ]

  const all = [...early, ...mid, ...late]
  const len = all.length

  const minProgress = all.map((_, i) => {
    if (i < 3) return i * 0.04
    if (i >= len - 2) return 0.78 + (i - (len - 2)) * 0.09
    const slot = i - 3
    const denom = Math.max(1, len - 5 - 1)
    return 0.1 + (slot / denom) * 0.62
  })

  return all.map((content, i) => ({
    content,
    minProgress: Math.min(0.995, minProgress[i]),
  }))
}
