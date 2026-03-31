/** Deterministic PRNG for game logic (options, shuffle). */
export function mulberry32(seed) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** True random pick — use for UI copy so lines actually vary each time. */
export function pickRandom(arr) {
  if (!arr.length) return ''
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Fisher–Yates shuffle; deterministic from `seed` (use for sequences that must stay stable per run). */
export function shuffleArray(array, seed) {
  const out = [...array]
  const rand = mulberry32(seed >>> 0)
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}
