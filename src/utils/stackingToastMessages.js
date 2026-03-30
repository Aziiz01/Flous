import { formatNumber } from './format'

const EARLY = [
  'Your GPU is sweating right now...',
  'No seriously, have you heard of mercy?',
  'My Three.js is having an existential crisis',
]

const MIDDLE = [
  "The bills won't stop. Send help.",
  'Your electricity bill just increased',
  '__COFFEE__',
  'Fun fact: this much cash weighs more than your life choices',
  'Still going... just like my student loans',
  'PSA: the developer who built this is available for hire 👀',
  'Seriously though — hire me. I rendered a MILLION bills for you.',
]

const END = [
  'Available for full-time, freelance, or just vibes. LinkedIn in the footer.',
  "If this impressed you, imagine what I'd do with a real salary",
  "Animation complete. Now go hire the engineer who made this possible.",
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
      ? `I rendered ${formatNumber(totalBills)} bills. You owe me a coffee.`
      : 'I rendered a lot of bills. You owe me a coffee.'

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
