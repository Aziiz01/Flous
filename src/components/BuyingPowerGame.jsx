import { useCallback, useMemo, useState } from 'react'

const formatUsd = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

const formatQtyGuess = (n) => {
  if (!Number.isFinite(n)) return '—'
  if (n >= 1000) return Math.round(n).toLocaleString('en-US')
  if (n >= 100) return Math.round(n).toString()
  if (n >= 10) return n.toFixed(1)
  return n.toFixed(2)
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

function approxEqual(a, b) {
  const d = Math.abs(a - b)
  return d < 1e-6 || d < Math.max(1e-4, Math.abs(a) * 0.001)
}

function buildOptions(correct, seed) {
  const rand = mulberry32(seed)
  const values = []
  const pushDistinct = (v) => {
    const x = Math.max(1, Math.round(v * 1000) / 1000)
    if (!values.some((e) => approxEqual(e, x))) values.push(x)
  }
  pushDistinct(correct)
  let guard = 0
  while (values.length < 3 && guard < 50) {
    guard += 1
    pushDistinct(correct * (0.15 + rand() * 0.85))
    pushDistinct(correct * (1.2 + rand() * 1.2))
  }
  while (values.length < 3) {
    pushDistinct(correct + values.length + 1)
  }
  return shuffle(
    values.slice(0, 3).map((v) => ({ value: v, isCorrect: approxEqual(v, correct) })),
    seed + 11,
  )
}

export default function BuyingPowerGame({ buyRows, amountUsd }) {
  const pool = useMemo(() => buyRows.filter((r) => r.qty >= 1 && Number.isFinite(r.qty)), [buyRows])

  const questions = useMemo(() => {
    if (pool.length === 0) return []
    const qs = []
    const base = Math.floor(amountUsd * 1000) + pool.length
    for (let i = 0; i < 3; i += 1) {
      const rand = mulberry32(base + i * 7919)
      const item = pool[Math.floor(rand() * pool.length)]
      const correct = item.qty
      const options = buildOptions(correct, base + i * 13)
      qs.push({ id: `${item.id}-${i}`, item, correct, options })
    }
    return qs
  }, [pool, amountUsd])

  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [pickedIdx, setPickedIdx] = useState(null)
  const [done, setDone] = useState(false)

  const q = questions[index]
  const isLast = index >= questions.length - 1

  const pick = useCallback(
    (opt, i) => {
      if (revealed) return
      setPickedIdx(i)
      setRevealed(true)
      if (opt.isCorrect) setScore((s) => s + 1)
    },
    [revealed],
  )

  const next = useCallback(() => {
    if (!isLast) {
      setIndex((i) => i + 1)
      setRevealed(false)
      setPickedIdx(null)
    } else {
      setDone(true)
    }
  }, [isLast])

  const restart = useCallback(() => {
    setIndex(0)
    setScore(0)
    setRevealed(false)
    setPickedIdx(null)
    setDone(false)
  }, [])

  if (pool.length === 0) {
    return (
      <p className="rounded-xl border border-white/10 bg-black/25 px-4 py-6 text-center text-sm text-zinc-400">
        Amount is too small for the mini-game — try a higher TND amount (you can still browse the list below).
      </p>
    )
  }

  if (questions.length === 0) return null

  return (
    <div className="space-y-4">
      <div
        data-stagger-card
        className="rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-emerald-950/80 via-black/40 to-emerald-950/60 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
      >
        <div className="flex items-center justify-between gap-2 border-b border-yellow-500/15 pb-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-200/95">Buying power game</p>
          <span className="rounded-full bg-yellow-500/15 px-2 py-0.5 text-[10px] font-semibold text-yellow-100">
            Score {score}/{questions.length}
          </span>
        </div>
        <p className="mt-2 text-xs text-zinc-400">
          Guess how many you can buy at ≈ {formatUsd(amountUsd)} USD (≈1 USD ≈ 3.1 TND). Three rounds — tap the best answer.
        </p>

        {!done && q && (
          <div className="mt-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl" aria-hidden>
                {q.item.icon}
              </span>
              <div>
                <p className="font-semibold text-zinc-100">{q.item.name}</p>
                <p className="text-xs text-zinc-500">{formatUsd(q.item.priceUsd)} each</p>
              </div>
            </div>
            <p className="mt-3 text-sm font-medium text-emerald-200/95">How many can you buy?</p>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
              {q.options.map((opt, i) => {
                const isPicked = pickedIdx === i
                const show = revealed
                const cls =
                  show && opt.isCorrect
                    ? 'border-emerald-500/70 bg-emerald-600/35 text-emerald-50'
                    : show && isPicked && !opt.isCorrect
                      ? 'border-red-500/50 bg-red-950/40 text-red-200'
                      : show && !opt.isCorrect
                        ? 'border-white/10 opacity-45'
                        : 'border-white/15 bg-white/5 text-yellow-50 hover:border-yellow-500/45 hover:bg-yellow-500/10'
                return (
                  <button
                    key={`${q.id}-${i}-${opt.value}`}
                    type="button"
                    disabled={revealed}
                    onClick={() => pick(opt, i)}
                    className={`rounded-xl border px-3 py-3 text-center text-sm font-bold tabular-nums transition ${cls}`}
                  >
                    {formatQtyGuess(opt.value)}
                  </button>
                )
              })}
            </div>
            {revealed && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <p className="text-sm text-zinc-300">
                  Answer: <strong className="text-[var(--money-gold)]">{formatQtyGuess(q.correct)}</strong>
                </p>
                <button
                  type="button"
                  onClick={next}
                  className="rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-3 py-1.5 text-xs font-semibold text-yellow-100 hover:bg-yellow-500/20"
                >
                  {isLast ? 'Finish' : 'Next round'}
                </button>
              </div>
            )}
          </div>
        )}

        {done && (
          <div className="mt-4 text-center">
            <p className="display-font text-2xl font-extrabold text-[var(--money-gold)]">
              {score === questions.length
                ? 'Perfect vault run!'
                : score === 0
                  ? 'Tough round — spin again!'
                  : 'Solid guesses!'}
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              You got <strong className="text-emerald-200">{score}</strong> of {questions.length} right.
            </p>
            <button
              type="button"
              onClick={restart}
              className="money-glow mt-3 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-900 px-5 py-2 text-sm font-bold uppercase tracking-wide text-yellow-50"
            >
              Play again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
