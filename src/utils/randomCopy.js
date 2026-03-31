/** Deterministic PRNG for picking copy variants from a seed (e.g. session / restart). */
export function mulberry32(seed) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function pickFromSeed(seed, arr, salt = 0) {
  if (!arr.length) return ''
  const rand = mulberry32(seed + salt * 10_007)
  return arr[Math.floor(rand() * arr.length)]
}
