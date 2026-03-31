import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { buildStackingToastSequence } from '../utils/stackingToastMessages'

const DISPLAY_MS = 3400
const GAP_AFTER_EXIT_MS = 320
const MIN_GAP_BETWEEN_TOASTS_MS = 2600
const ENTER_DURATION = 0.55
const EXIT_DURATION = 0.38

export default function StackingAnimationToasts({
  isAnimating,
  totalBills,
  liveCounter,
  runId,
}) {
  const sequence = useMemo(
    () => buildStackingToastSequence(totalBills, runId),
    [totalBills, runId],
  )

  const [sequenceExhausted, setSequenceExhausted] = useState(false)
  const [toast, setToast] = useState(null)

  const active = useMemo(
    () => isAnimating || (liveCounter > 0 && !isAnimating && !sequenceExhausted),
    [isAnimating, liveCounter, sequenceExhausted],
  )

  const nextIndexRef = useRef(0)
  const lastClosedAtRef = useRef(0)
  const showingRef = useRef(false)
  const toastElRef = useRef(null)
  const hideTimerRef = useRef(null)
  const afterExitTimerRef = useRef(null)
  const tryShowNextCallbackRef = useRef(null)

  const dismissToast = useCallback(() => {
    const el = toastElRef.current
    const finish = () => {
      setToast(null)
      nextIndexRef.current += 1
      lastClosedAtRef.current = Date.now()
      showingRef.current = false
      if (nextIndexRef.current >= sequence.length) {
        setSequenceExhausted(true)
      }
      afterExitTimerRef.current = setTimeout(() => {
        tryShowNextCallbackRef.current?.()
      }, GAP_AFTER_EXIT_MS)
    }

    if (!el) {
      finish()
      return
    }

    gsap.to(el, {
      x: -28,
      opacity: 0,
      scale: 0.96,
      duration: EXIT_DURATION,
      ease: 'power2.in',
      onComplete: finish,
    })
  }, [sequence.length])

  const tryShowNext = useCallback(() => {
    if (!active || showingRef.current) return
    const i = nextIndexRef.current
    if (i >= sequence.length) return

    const p = totalBills > 0 ? liveCounter / totalBills : 0
    if (p < sequence[i].minProgress) return

    const now = Date.now()
    if (i > 0 && now - lastClosedAtRef.current < MIN_GAP_BETWEEN_TOASTS_MS) return

    showingRef.current = true
    setToast({ content: sequence[i].content, key: `${runId}-${i}` })
  }, [active, liveCounter, sequence, totalBills, runId])

  useEffect(() => {
    tryShowNextCallbackRef.current = tryShowNext
  }, [tryShowNext])

  useEffect(() => {
    if (!active) return
    tryShowNext()
  }, [active, liveCounter, tryShowNext])

  useLayoutEffect(() => {
    if (!toast || !toastElRef.current) return
    const el = toastElRef.current
    gsap.fromTo(
      el,
      { x: -36, opacity: 0, scale: 0.92 },
      {
        x: 0,
        opacity: 1,
        scale: 1,
        duration: ENTER_DURATION,
        ease: 'back.out(1.35)',
      },
    )
    // Animate per toast identity (key), not full toast object
    // eslint-disable-next-line react-hooks/exhaustive-deps -- toast?.key
  }, [toast?.key])

  useEffect(() => {
    if (!active || !toast) return

    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => {
      dismissToast()
    }, DISPLAY_MS)

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- toast?.key
  }, [active, toast?.key, dismissToast])

  if (!active) return null

  return (
      <div
        className="pointer-events-none fixed bottom-[max(1rem,env(safe-area-inset-bottom,0px))] left-[max(0.75rem,env(safe-area-inset-left,0px))] z-[60] max-w-[min(22rem,calc(100vw-1.5rem))] md:bottom-8 md:left-8"
        aria-live="polite"
      >
      {toast && (
        <div
          key={toast.key}
          ref={toastElRef}
          className="glass pointer-events-auto max-w-[min(22rem,calc(100vw-2rem))] rounded-2xl rounded-br-3xl border border-yellow-500/25 bg-emerald-950/55 px-4 py-3 text-sm font-medium leading-relaxed text-emerald-50 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:rounded-3xl"
        >
          <div className="leading-snug text-emerald-50">{toast.content}</div>
        </div>
      )}
    </div>
  )
}
