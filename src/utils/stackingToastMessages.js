import { formatNumber } from './format'

const EARLY = [
  'Building stacks...',
  'Counting every note accurately.',
  'Flow is stable. Keep watching.',
]

const MIDDLE = [
  'Stacks are rising fast.',
  'Every layer is physically simulated.',
  '__COFFEE__',
  'Progress checkpoint reached.',
  'Large totals stay smooth with optimized rendering.',
  'You can use "Skip waiting" any time.',
  'Almost at full volume.',
]

const END = [
  'Final layers in progress.',
  'Wrapping up the last stacks.',
  'Complete. Explore the scale and buying power panel next.',
]

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

export function buildStackingToastSequence(totalBills, runId) {
  const coffee =
    totalBills > 0
      ? `${formatNumber(totalBills)} bills in this run.`
      : 'High-volume run in progress.'

  const middleResolved = MIDDLE.map((line) => (line === '__COFFEE__' ? coffee : line))
  const shuffledMiddle = shuffle(middleResolved, runId + 7919)

  const texts = [...EARLY, ...shuffledMiddle, ...END]
  const n = texts.length
  const minProgress = texts.map((_, i) => {
    if (i < 3) return i * 0.035
    if (i >= n - 3) return 0.78 + (i - (n - 3)) * 0.09
    const slot = i - 3
    const denom = Math.max(1, n - 6 - 1)
    return 0.12 + (slot / denom) * 0.62
  })

  return texts.map((text, i) => ({
    text,
    minProgress: Math.min(0.995, minProgress[i]),
  }))
}
