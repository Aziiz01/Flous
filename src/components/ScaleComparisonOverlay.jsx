import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import AuthorCreditBanner from './AuthorCreditBanner'
import { PURCHASABLE_ITEMS, TND_TO_USD } from '../data/purchasableItems'
import {
  BILL_LENGTH_M,
  BILL_THICKNESS_M,
  BILL_WIDTH_M,
  areaComparison,
  computeStackPhysics,
  heightComparison,
  volumeComparison,
  weightComparison,
} from '../utils/scaleComparisons'

const formatUsd = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

const formatQtyBuy = (n) => {
  if (n >= 1000) return Math.round(n).toLocaleString('en-US')
  if (n >= 100) return Math.round(n).toString()
  if (n >= 10) return n.toFixed(1)
  return n.toFixed(2)
}

const buildPurchasableRows = (amountTnd) => {
  const amountUsd = amountTnd * TND_TO_USD
  const rows = PURCHASABLE_ITEMS.map((item) => ({
    ...item,
    qty: amountUsd / item.priceUsd,
  })).filter((row) => row.qty >= 1)

  rows.sort((a, b) => {
    const aBig = a.qty >= 1000 ? 1 : 0
    const bBig = b.qty >= 1000 ? 1 : 0
    if (aBig !== bBig) return bBig - aBig
    return b.qty - a.qty
  })

  return { rows, amountUsd }
}

const statCardClass =
  'data-stagger-card group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-zinc-900/90 via-zinc-950/70 to-black/50 p-4 pl-5 shadow-inner shadow-black/20 md:p-5 md:pl-6'

const accentBar = (from, to) =>
  `pointer-events-none absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${from} ${to} opacity-90`

const ScaleComparisonOverlay = ({
  open,
  onDismiss,
  amountTnd,
  totalBills,
  renderedStackCount,
  /** When true, panel sits directly above the author credit strip at the bottom */
  stackAboveFooter = false,
}) => {
  const [tab, setTab] = useState('scale')
  const panelRef = useRef(null)
  const backdropRef = useRef(null)
  const scaleContentRef = useRef(null)
  const buyContentRef = useRef(null)

  const physics = computeStackPhysics(totalBills, renderedStackCount)
  const seed = totalBills
  const hComp = heightComparison(physics.totalHeightM, seed)
  const aComp = areaComparison(physics.totalGroundAreaM2, seed + 1)
  const vComp = volumeComparison(physics.volumeM3, seed + 2)
  const wComp = weightComparison(physics.weightKg, seed + 3)
  const { rows: buyRows, amountUsd } = buildPurchasableRows(amountTnd)

  useLayoutEffect(() => {
    if (!open || !panelRef.current) return

    gsap.fromTo(
      panelRef.current,
      { y: stackAboveFooter ? 56 : -40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' },
    )
    if (backdropRef.current) {
      gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35 })
    }
  }, [open, stackAboveFooter])

  const animateTabContent = (ref) => {
    if (!ref?.current) return
    const cards = ref.current.querySelectorAll('[data-stagger-card]')
    gsap.fromTo(
      cards,
      { y: 16, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
      },
    )
  }

  useEffect(() => {
    if (!open) return
    const t = requestAnimationFrame(() => {
      if (tab === 'scale') animateTabContent(scaleContentRef)
      else animateTabContent(buyContentRef)
    })
    return () => cancelAnimationFrame(t)
  }, [open, tab])

  if (!open) return null

  const panelShellClass = stackAboveFooter
    ? 'pointer-events-auto relative z-40 flex max-h-[min(50dvh,620px)] w-full min-h-0 flex-col overflow-hidden rounded-2xl border border-yellow-500/25 bg-emerald-950/90 shadow-[0_8px_48px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl md:max-h-[min(56vh,700px)]'
    : 'pointer-events-auto fixed left-1/2 z-40 w-[min(94vw,1000px)] -translate-x-1/2 rounded-2xl border border-yellow-500/25 bg-emerald-950/90 shadow-[0_8px_48px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl max-md:top-1/2 max-md:max-h-[min(88dvh,720px)] max-md:-translate-y-1/2 md:top-[max(11.5rem,env(safe-area-inset-top,0px))] md:max-h-[min(65vh,780px)] md:translate-y-0'

  const panelInner = (
    <>
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.15]"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(232,207,106,0.22), transparent 50%)',
          }}
        />
        <div
          className={
            stackAboveFooter
              ? 'relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl'
              : 'relative flex max-h-[min(88dvh,720px)] flex-col overflow-hidden rounded-2xl md:max-h-[min(65vh,780px)]'
          }
        >
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-yellow-500/15 bg-black/25 px-3 py-3 sm:gap-3 sm:px-4 sm:py-3.5 md:px-5 md:py-4">
            <p id="scale-overlay-title" className="sr-only">
              Scale comparison and purchasing power
            </p>
            <div className="flex min-w-0 flex-1 gap-0.5 rounded-xl bg-black/50 p-1 ring-1 ring-white/10 sm:gap-1">
              <button
                type="button"
                onClick={() => setTab('scale')}
                className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition sm:px-3.5 sm:py-2 sm:text-sm md:px-4 ${
                  tab === 'scale'
                    ? 'bg-gradient-to-b from-emerald-500 to-emerald-800 text-yellow-50 shadow-md shadow-emerald-950/40'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Scale
              </button>
              <button
                type="button"
                onClick={() => setTab('buy')}
                className={`min-w-0 rounded-lg px-2 py-1.5 text-xs font-semibold transition sm:px-3.5 sm:py-2 sm:text-sm md:px-4 ${
                  tab === 'buy'
                    ? 'bg-gradient-to-b from-emerald-500 to-emerald-800 text-yellow-50 shadow-md shadow-emerald-950/40'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <span className="sm:hidden">Buying power</span>
                <span className="hidden sm:inline">What Can This Buy?</span>
              </button>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              className="shrink-0 touch-manipulation rounded-xl border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-yellow-500/45 hover:bg-emerald-800/40 hover:text-yellow-50 sm:px-3 sm:py-2 sm:text-sm"
            >
              Close
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4 sm:py-4 md:px-6 md:py-5">
            {tab === 'scale' && (
              <div ref={scaleContentRef} className="space-y-4">
                <div
                  data-stagger-card
                  className="rounded-xl border border-dashed border-yellow-500/25 bg-emerald-900/30 px-3 py-2.5 text-center text-[11px] leading-relaxed text-zinc-400 md:text-xs"
                >
                  Model uses standard US note size:{' '}
                  <span className="font-medium text-zinc-300">
                    {BILL_LENGTH_M * 100} × {BILL_WIDTH_M * 100} × {(BILL_THICKNESS_M * 100).toFixed(2)} cm
                  </span>{' '}
                  per bill
                </div>

                <div className={statCardClass}>
                  <span className={accentBar('from-yellow-400', 'to-emerald-700/40')} />
                  <div className="flex gap-3 md:gap-4">
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-500/15 text-xl ring-1 ring-yellow-400/25 md:h-12 md:w-12"
                      aria-hidden
                    >
                      ↕️
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-200/85">
                        Height
                      </p>
                      <p className="display-font mt-1 text-xl font-extrabold tabular-nums tracking-tight text-white sm:text-2xl md:text-3xl">
                        {physics.totalHeightM < 1
                          ? `${(physics.totalHeightM * 100).toFixed(1)} cm`
                          : `${physics.totalHeightM.toFixed(2)} m`}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-300">{hComp.line}</p>
                      <p className="mt-1.5 text-xs leading-snug text-zinc-500">{hComp.detail}</p>
                    </div>
                  </div>
                </div>

                <div className={statCardClass}>
                  <span className={accentBar('from-emerald-400', 'to-emerald-700/40')} />
                  <div className="flex gap-3 md:gap-4">
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-xl ring-1 ring-emerald-400/20 md:h-12 md:w-12"
                      aria-hidden
                    >
                      ▦
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200/85">
                        Area covered
                      </p>
                      <p className="display-font mt-1 text-xl font-extrabold tabular-nums tracking-tight text-white sm:text-2xl md:text-3xl">
                        {physics.totalGroundAreaM2 < 10_000
                          ? `${physics.totalGroundAreaM2.toFixed(1)} m²`
                          : `${(physics.totalGroundAreaM2 / 1_000_000).toFixed(3)} km²`}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-300">{aComp.line}</p>
                      <p className="mt-1.5 text-xs leading-snug text-zinc-500">{aComp.detail}</p>
                    </div>
                  </div>
                </div>

                <div className={statCardClass}>
                  <span className={accentBar('from-sky-400', 'to-indigo-700/40')} />
                  <div className="flex gap-3 md:gap-4">
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-xl ring-1 ring-sky-400/25 md:h-12 md:w-12"
                      aria-hidden
                    >
                      ⬚
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-200/85">
                        Volume
                      </p>
                      <p className="display-font mt-1 text-xl font-extrabold tabular-nums tracking-tight text-white sm:text-2xl md:text-3xl">
                        {physics.volumeM3 < 1
                          ? `${(physics.volumeM3 * 1_000_000).toFixed(0)} cm³`
                          : `${physics.volumeM3.toFixed(3)} m³`}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-300">{vComp.line}</p>
                      <p className="mt-1.5 text-xs leading-snug text-zinc-500">{vComp.detail}</p>
                    </div>
                  </div>
                </div>

                <div className={statCardClass}>
                  <span className={accentBar('from-violet-400', 'to-fuchsia-700/40')} />
                  <div className="flex gap-3 md:gap-4">
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-xl ring-1 ring-violet-400/25 md:h-12 md:w-12"
                      aria-hidden
                    >
                      ⚖️
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200/85">
                        Weight
                      </p>
                      <p className="display-font mt-1 text-xl font-extrabold tabular-nums tracking-tight text-white sm:text-2xl md:text-3xl">
                        {physics.weightKg < 1000
                          ? `${physics.weightKg.toFixed(1)} kg`
                          : `${(physics.weightKg / 1000).toFixed(2)} t`}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-300">{wComp.line}</p>
                      <p className="mt-1.5 text-xs leading-snug text-zinc-500">{wComp.detail}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tab === 'buy' && (
              <div ref={buyContentRef} className="space-y-4">
                <div
                  data-stagger-card
                  className="rounded-xl border border-yellow-500/20 bg-gradient-to-r from-yellow-500/[0.08] to-transparent px-4 py-3 text-center md:text-left"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-yellow-200/90">
                    Purchasing power (estimate)
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    ≈{' '}
                    <span className="display-font text-lg font-bold text-[var(--money-gold)] md:text-xl">
                      {formatUsd(amountUsd)}
                    </span>{' '}
                    <span className="text-zinc-500">USD</span>
                    <span className="block text-xs text-zinc-500 md:inline md:before:content-['_·_']">
                      rate ~1 USD ≈ 3.1 TND
                    </span>
                  </p>
                </div>

                {buyRows.length === 0 ? (
                  <p className="text-center text-sm text-zinc-500">
                    Not enough for a full unit of these items at this amount.
                  </p>
                ) : (
                  <ul className="space-y-2.5">
                    {buyRows.map((row) => (
                      <li
                        key={row.id}
                        data-stagger-card
                        className="flex items-stretch gap-3 overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-r from-zinc-900/80 via-zinc-950/60 to-black/40 p-1 pl-3 shadow-lg shadow-black/20 md:gap-4 md:pl-4"
                      >
                        <span
                          className="flex w-12 shrink-0 items-center justify-center self-center rounded-xl bg-black/40 text-2xl ring-1 ring-white/10 md:w-14 md:text-[1.75rem]"
                          aria-hidden
                        >
                          {row.icon}
                        </span>
                        <div className="min-w-0 flex flex-1 flex-col justify-center py-2 pr-2">
                          <p className="font-semibold leading-snug text-zinc-100">{row.name}</p>
                          <p className="mt-0.5 text-xs text-zinc-500">{formatUsd(row.priceUsd)} each</p>
                        </div>
                        <div className="flex shrink-0 flex-col items-center justify-center rounded-r-[0.9rem] bg-gradient-to-b from-yellow-500/20 to-emerald-800/20 px-3 py-2 ring-1 ring-yellow-500/25 md:px-4">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-yellow-200/80">
                            ×
                          </span>
                          <span className="display-font text-lg font-extrabold tabular-nums text-yellow-50 md:text-xl">
                            {formatQtyBuy(row.qty)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
    </>
  )

  return (
    <>
      <button
        type="button"
        aria-label="Dismiss scale comparison"
        className="pointer-events-auto fixed inset-0 z-30 bg-black/45 backdrop-blur-[3px]"
        ref={backdropRef}
        onClick={onDismiss}
      />
      {stackAboveFooter ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex w-full flex-col-reverse items-center gap-3 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
          <AuthorCreditBanner visible stacked />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="scale-overlay-title"
            className={panelShellClass}
            onClick={(e) => e.stopPropagation()}
          >
            {panelInner}
          </div>
        </div>
      ) : (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="scale-overlay-title"
          className={panelShellClass}
          onClick={(e) => e.stopPropagation()}
        >
          {panelInner}
        </div>
      )}
    </>
  )
}

export default ScaleComparisonOverlay
