/**
 * Three.js money scene tuning
 *
 * INSTANT_FILL_THRESHOLD_BILLS — bill counts at or above this use “turbo” mode:
 * full stacks appear instantly (no falling-bill animation) to spare the GPU.
 * Raise this to keep the rain animation for larger amounts; lower it to switch
 * to instant fill sooner.
 *
 * Example: 100_000 → animation for 99,999 bills and below; instant at 100k+.
 */
export const INSTANT_FILL_THRESHOLD_BILLS = 100_000
