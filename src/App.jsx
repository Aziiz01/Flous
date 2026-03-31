import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import AuthorCreditBanner from './components/AuthorCreditBanner'
import InputPanel from './components/InputPanel'
import RateProjectModal from './components/RateProjectModal'
import StackingAnimationToasts from './components/StackingAnimationToasts'
import ScaleComparisonOverlay from './components/ScaleComparisonOverlay'
import ScaleInsightsDock from './components/ScaleInsightsDock'
import ThreeMoneyScene from './components/ThreeMoneyScene'
import { DEFAULT_DENOMINATION, DENOMINATIONS } from './data/denominations'
import { formatNumber, parseFormattedNumber } from './utils/format'

const MAX_AMOUNT = 1_000_000

const getInitialStateFromUrl = () => {
  const params = new URLSearchParams(window.location.search)
  const amountParam = params.get('amount')
  const amount =
    amountParam === null
      ? 0
      : Math.min(MAX_AMOUNT, parseFormattedNumber(amountParam))
  const denominationFromUrl = Number(params.get('denom'))
  const denomination = DENOMINATIONS.some((item) => item.value === denominationFromUrl)
    ? denominationFromUrl
    : DEFAULT_DENOMINATION

  return { amount, denomination }
}

function App() {
  const initial = getInitialStateFromUrl()
  const [amountInput, setAmountInput] = useState(
    initial.amount > 0 ? formatNumber(initial.amount) : '',
  )
  const [denomination, setDenomination] = useState(initial.denomination)
  const [scenario, setScenario] = useState(() => ({
    amount: initial.amount,
    denomination: initial.denomination,
    bills: initial.amount ? Math.ceil(initial.amount / initial.denomination) : 0,
    runId: 0,
  }))
  const [liveCounter, setLiveCounter] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showScaleOverlay, setShowScaleOverlay] = useState(false)
  /** After at least one completed run, user can reopen insights via dock. */
  const [insightsUnlocked, setInsightsUnlocked] = useState(false)
  const [showAuthorCredit, setShowAuthorCredit] = useState(false)
  const [toastSessionActive, setToastSessionActive] = useState(false)
  const [showRateModal, setShowRateModal] = useState(false)
  const [skipInstantToken, setSkipInstantToken] = useState(0)
  /** Full-screen money view: hide chrome, orbit freely; Back returns to menu. */
  const [sceneFocusMode, setSceneFocusMode] = useState(false)
  const [scaleOverlayKey, setScaleOverlayKey] = useState(0)
  const [sceneMeta, setSceneMeta] = useState({
    stackCount: 0,
    renderedStackCount: 0,
    stackBillCapacity: 100,
    stacksPerRendered: 1,
  })
  const overlayRef = useRef(null)

  const currentAmount = useMemo(
    () => Math.min(MAX_AMOUNT, parseFormattedNumber(amountInput)),
    [amountInput],
  )

  const billCount = useMemo(() => {
    if (!currentAmount || !denomination) return 0
    return Math.ceil(currentAmount / denomination)
  }, [currentAmount, denomination])

  const handleAmountInput = (rawValue) => {
    const parsed = Math.min(MAX_AMOUNT, parseFormattedNumber(rawValue))
    setAmountInput(parsed === 0 ? '' : formatNumber(parsed))
  }

  const handleVisualize = () => {
    const bills = billCount
    setSceneFocusMode(false)
    setScenario((previous) => ({
      amount: currentAmount,
      denomination,
      bills,
      runId: previous.runId + 1,
    }))
    setLiveCounter(0)
    setIsAnimating(bills > 0)
    setShowScaleOverlay(false)
    setInsightsUnlocked(false)
    setShowAuthorCredit(false)
    setToastSessionActive(bills > 0)
    setSkipInstantToken(0)

    if (overlayRef.current) {
      gsap.fromTo(
        overlayRef.current,
        { y: -10, opacity: 0.82 },
        { y: 0, opacity: 1, duration: 0.48, ease: 'power2.out' },
      )
    }
  }

  const handleSceneProgress = useCallback((count) => {
    setLiveCounter(count)
  }, [])

  const handleSceneComplete = useCallback(() => {
    setIsAnimating(false)
    setInsightsUnlocked(true)
    setShowAuthorCredit(true)
  }, [])

  const handleSceneMeta = useCallback((meta) => {
    setSceneMeta(meta)
  }, [])

  const handleSceneFocus = useCallback(() => {
    if (scenario.bills <= 0) return
    setSceneFocusMode(true)
    setShowScaleOverlay(false)
  }, [scenario.bills])

  const openScaleInsights = useCallback(() => {
    setScaleOverlayKey((k) => k + 1)
    setShowScaleOverlay(true)
  }, [])

  useEffect(() => {
    if (!sceneFocusMode) return
    const onKey = (e) => {
      if (e.key === 'Escape') setSceneFocusMode(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sceneFocusMode])

  const showStackingToasts = toastSessionActive && scenario.bills > 0

  return (
    <main className="relative h-dvh max-h-dvh w-full overflow-hidden bg-[var(--money-bg)]">
      <ThreeMoneyScene
        totalBills={scenario.bills}
        denomination={scenario.denomination}
        runId={scenario.runId}
        skipInstantToken={skipInstantToken}
        sceneFocusMode={sceneFocusMode}
        onFocusScene={handleSceneFocus}
        onProgress={handleSceneProgress}
        onComplete={handleSceneComplete}
        onMeta={handleSceneMeta}
      />

      {!sceneFocusMode && (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-y-auto overflow-x-hidden overscroll-y-contain">
          <div className="flex w-full flex-col items-center px-[max(0.75rem,env(safe-area-inset-left))] pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.35rem,env(safe-area-inset-top))] pr-[max(0.75rem,env(safe-area-inset-right))] md:pb-4 md:pt-2">
            <div
              ref={overlayRef}
              className={`pointer-events-auto w-full max-w-lg p-2 sm:p-3 md:max-w-xl md:p-4 ${isAnimating ? 'max-md:hidden' : ''}`}
            >
              <InputPanel
                amountInput={amountInput}
                denomination={denomination}
                setAmountInput={handleAmountInput}
                setDenomination={setDenomination}
                onVisualize={handleVisualize}
                onOpenRate={() => setShowRateModal(true)}
                canVisualize={billCount > 0}
              />
            </div>

            {scenario.bills > 0 && (
              <div
                className={`pointer-events-auto flex w-full max-w-[min(100vw-1rem,22rem)] flex-col items-center rounded-2xl border border-yellow-500/25 bg-emerald-950/55 px-3 py-2 text-center shadow-lg shadow-black/30 backdrop-blur-md sm:max-w-md sm:px-4 ${
                  isAnimating
                    ? 'fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 z-20 -translate-x-1/2'
                    : 'mx-auto mt-2'
                }`}
              >
                <p className="display-font text-base font-bold tabular-nums text-[var(--money-gold)] sm:text-lg">
                  {formatNumber(liveCounter)}
                  <span className="text-sm font-semibold text-emerald-200/90 sm:text-base">
                    /{formatNumber(scenario.bills)} bills
                  </span>
                </p>
                {!isAnimating && (
                  <p className="mt-0.5 text-center text-[10px] text-emerald-400/80">
                    {formatNumber(sceneMeta.stackBillCapacity)} bills per stack
                  </p>
                )}
                {isAnimating && (
                  <button
                    type="button"
                    onClick={() => setSkipInstantToken((n) => n + 1)}
                    className="mt-2 touch-manipulation rounded-full border border-yellow-500/40 bg-emerald-900/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-yellow-100 transition hover:bg-emerald-800/60"
                  >
                    Skip
                  </button>
                )}
              </div>
            )}

            {insightsUnlocked && scenario.bills > 0 && !showScaleOverlay && (
              <div className="pointer-events-auto mt-3 w-full max-w-lg px-1 sm:px-2">
                <ScaleInsightsDock onOpen={openScaleInsights} />
              </div>
            )}
          </div>

          {showScaleOverlay && scenario.bills > 0 && (
            <ScaleComparisonOverlay
              key={scaleOverlayKey}
              open={showScaleOverlay}
              onDismiss={() => setShowScaleOverlay(false)}
              amountTnd={scenario.amount}
              totalBills={scenario.bills}
              renderedStackCount={Math.max(1, sceneMeta.renderedStackCount || 1)}
            />
          )}

          {showAuthorCredit && !(showScaleOverlay && scenario.bills > 0) && (
            <AuthorCreditBanner visible />
          )}

          <RateProjectModal open={showRateModal} onClose={() => setShowRateModal(false)} />
        </div>
      )}

      {showStackingToasts && (
        <StackingAnimationToasts
          key={scenario.runId}
          isAnimating={isAnimating}
          totalBills={scenario.bills}
          liveCounter={liveCounter}
          runId={scenario.runId}
        />
      )}

      {sceneFocusMode && (
        <button
          type="button"
          onClick={() => setSceneFocusMode(false)}
          className="pointer-events-auto fixed left-[max(0.75rem,env(safe-area-inset-left))] top-[max(0.75rem,env(safe-area-inset-top))] z-50 rounded-xl border border-yellow-500/40 bg-emerald-950/90 px-4 py-2.5 text-sm font-semibold text-yellow-100 shadow-lg backdrop-blur-md transition hover:border-yellow-400/55 hover:bg-emerald-900/95"
        >
          ← Back to menu
        </button>
      )}
    </main>
  )
}

export default App
