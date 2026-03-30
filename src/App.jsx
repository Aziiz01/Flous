import { useCallback, useMemo, useRef, useState } from 'react'
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

const MAX_AMOUNT = 9_999_999_999
const DEFAULT_AMOUNT = 1_000_000

const getInitialStateFromUrl = () => {
  const params = new URLSearchParams(window.location.search)
  const amountParam = params.get('amount')
  const amount =
    amountParam === null
      ? DEFAULT_AMOUNT
      : Math.min(MAX_AMOUNT, parseFormattedNumber(amountParam))
  const denominationFromUrl = Number(params.get('denom'))
  const denomination = DENOMINATIONS.some((item) => item.value === denominationFromUrl)
    ? denominationFromUrl
    : DEFAULT_DENOMINATION

  return { amount, denomination }
}

function App() {
  const initial = getInitialStateFromUrl()
  const [amountInput, setAmountInput] = useState(formatNumber(initial.amount))
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
  const [sceneMeta, setSceneMeta] = useState({
    stackCount: 0,
    renderedStackCount: 0,
    stackBillCapacity: 100,
    stacksPerRendered: 1,
    turboInstantMode: false,
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

  const showStackingToasts =
    toastSessionActive &&
    !sceneMeta.turboInstantMode &&
    scenario.bills > 0

  return (
    <main className="relative h-dvh max-h-dvh w-full overflow-hidden bg-[#020306]">
      <ThreeMoneyScene
        totalBills={scenario.bills}
        denomination={scenario.denomination}
        runId={scenario.runId}
        skipInstantToken={skipInstantToken}
        onProgress={handleSceneProgress}
        onComplete={handleSceneComplete}
        onMeta={handleSceneMeta}
      />

      <div className="pointer-events-none absolute inset-0 z-10 overflow-y-auto overflow-x-hidden overscroll-y-contain">
        <div className="flex w-full flex-col items-center px-[max(0.75rem,env(safe-area-inset-left))] pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.25rem,env(safe-area-inset-top))] pr-[max(0.75rem,env(safe-area-inset-right))] md:pb-4 md:pt-0">
          <div
            ref={overlayRef}
            className={`pointer-events-auto w-full max-w-4xl p-3 sm:p-4 md:p-6 ${isAnimating ? 'max-md:hidden' : ''}`}
          >
            <InputPanel
              amountInput={amountInput}
              denomination={denomination}
              setAmountInput={handleAmountInput}
              setDenomination={setDenomination}
              onVisualize={handleVisualize}
              onOpenRate={() => setShowRateModal(true)}
            />
          </div>

          {scenario.bills > 0 && (
            <div
              className={`pointer-events-auto mx-auto flex w-full max-w-[min(100vw-1rem,28rem)] flex-col items-center rounded-2xl border border-amber-300/35 bg-black/45 px-3 py-2 backdrop-blur-md sm:w-fit sm:px-5 ${isAnimating ? 'mt-1 md:mt-2' : 'mt-2'}`}
            >
              <p className="display-font text-center text-sm font-semibold text-amber-100 sm:text-base md:text-lg">
                {formatNumber(liveCounter)} bills{isAnimating ? ' and counting...' : '.'}
              </p>
              <p className="mt-1 text-center text-xs text-zinc-300">
                Stacks fill in order: 1 stack = {formatNumber(sceneMeta.stackBillCapacity)} bills.
              </p>
              {isAnimating && !sceneMeta.turboInstantMode && (
                <button
                  type="button"
                  onClick={() => setSkipInstantToken((n) => n + 1)}
                  className="mt-2 touch-manipulation rounded-full border border-amber-400/45 bg-amber-500/20 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-50 transition hover:bg-amber-500/30"
                >
                  Skip waiting
                </button>
              )}
              {sceneMeta.turboInstantMode && (
                <p className="text-center text-[11px] text-amber-200/90">
                  Whoa, put less money to see the animation, man! You took all the fun out of it by going big.
                </p>
              )}
            </div>
          )}

          {insightsUnlocked && scenario.bills > 0 && !showScaleOverlay && (
            <div className="pointer-events-auto mt-3 w-full max-w-[min(100vw-1rem,28rem)] px-2">
              <ScaleInsightsDock onOpen={() => setShowScaleOverlay(true)} />
            </div>
          )}
        </div>

        {showScaleOverlay && scenario.bills > 0 && (
          <ScaleComparisonOverlay
            open={showScaleOverlay}
            onDismiss={() => setShowScaleOverlay(false)}
            amountTnd={scenario.amount}
            totalBills={scenario.bills}
            renderedStackCount={Math.max(1, sceneMeta.renderedStackCount || 1)}
          />
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

        {showAuthorCredit && !(showScaleOverlay && scenario.bills > 0) && (
          <AuthorCreditBanner visible />
        )}

        <RateProjectModal open={showRateModal} onClose={() => setShowRateModal(false)} />
      </div>
    </main>
  )
}

export default App
