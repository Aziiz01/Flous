import { useMemo, useState } from 'react'
import { pickFromSeed } from '../utils/randomCopy'

const SCALE_TOP_HINTS = [
  'Tap a reference to compare — bars scale to the larger value in each pair.',
  'Pick a landmark chip — both bars stretch to match the bigger side.',
  'Switch references anytime — your stack stays on the left.',
  'Compare interactively: tap options below each stat to swap the benchmark.',
]

const HEIGHT_SUFFIXES = [
  'the reference height (stack thickness vs that landmark).',
  'of that landmark’s height — your stack thickness vs the bar.',
  'as tall as that reference (stack thickness vs height).',
]

const AREA_SUFFIXES = [
  'that area.',
  'the footprint of that reference.',
  'how much ground that landmark covers.',
]

const VOL_SUFFIXES = [
  'that volume.',
  'the space that reference fills.',
  'that container’s volume.',
]

const WEIGHT_SUFFIXES = [
  'that mass.',
  'the reference weight.',
  'how heavy that comparison is.',
]

const HEIGHT_REFS = [
  { m: 1.75, label: 'Adult (~1.75 m)' },
  { m: 2.0, label: 'Basketball player (~2 m)' },
  { m: 3.05, label: 'Hoop height (~3.05 m)' },
  { m: 324, label: 'Eiffel Tower (~324 m)' },
]

const AREA_REFS = [
  { m2: 13, label: 'Parking space (~13 m²)' },
  { m2: 260, label: 'Tennis court (~260 m²)' },
  { m2: 420, label: 'Basketball court (~420 m²)' },
  { m2: 7_140, label: 'Football pitch (~7,140 m²)' },
]

const VOL_REFS = [
  { m3: 0.001, label: 'Soda can (~1 L)' },
  { m3: 1, label: '1 m³ box' },
  { m3: 2.5, label: 'Olympic pool (~2,500 m³)' },
]

const WEIGHT_REFS = [
  { kg: 1, label: '1 kg' },
  { kg: 75, label: 'Adult (~75 kg)' },
  { kg: 1500, label: 'Small car (~1.5 t)' },
  { kg: 6000, label: 'Elephant (~6 t)' },
]

const chip =
  'rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-[10px] font-medium text-zinc-300 transition hover:border-yellow-500/40 hover:text-yellow-100 sm:px-2.5 sm:text-[11px]'
const chipActive =
  'border-yellow-500/50 bg-yellow-500/15 text-yellow-100 ring-1 ring-yellow-500/25'

function DualBar({ leftLabel, rightLabel, leftPct, rightPct, leftTone, rightTone }) {
  return (
    <div className="mt-3 flex gap-3">
      <div className="flex min-h-[88px] flex-1 flex-col items-center justify-end rounded-lg bg-black/35 px-2 pb-1 pt-2">
        <div
          className={`w-full max-w-[3rem] rounded-t-md ${leftTone}`}
          style={{ height: `${Math.max(8, leftPct)}%`, minHeight: 8 }}
          title={leftLabel}
        />
        <span className="mt-1 text-center text-[9px] leading-tight text-zinc-500">{leftLabel}</span>
      </div>
      <div className="flex min-h-[88px] flex-1 flex-col items-center justify-end rounded-lg bg-black/35 px-2 pb-1 pt-2">
        <div
          className={`w-full max-w-[3rem] rounded-t-md ${rightTone}`}
          style={{ height: `${Math.max(8, rightPct)}%`, minHeight: 8 }}
          title={rightLabel}
        />
        <span className="mt-1 text-center text-[9px] leading-tight text-zinc-500">{rightLabel}</span>
      </div>
    </div>
  )
}

export default function InteractiveScaleStats({ physics }) {
  const [copySeed] = useState(() => Math.floor(Math.random() * 1e9))
  const [hi, setHi] = useState(1)
  const [ai, setAi] = useState(1)
  const [vi, setVi] = useState(1)
  const [wi, setWi] = useState(1)

  const topHint = pickFromSeed(copySeed, SCALE_TOP_HINTS, 0)
  const heightSuffix = pickFromSeed(copySeed, HEIGHT_SUFFIXES, 1)
  const areaSuffix = pickFromSeed(copySeed, AREA_SUFFIXES, 2)
  const volSuffix = pickFromSeed(copySeed, VOL_SUFFIXES, 3)
  const weightSuffix = pickFromSeed(copySeed, WEIGHT_SUFFIXES, 4)

  const { hRatio, aRatio, vRatio, wRatio, bars } = useMemo(() => {
    const hRef = HEIGHT_REFS[hi]
    const aRef = AREA_REFS[ai]
    const vRef = VOL_REFS[vi]
    const wRef = WEIGHT_REFS[wi]

    const th = physics.totalHeightM
    const ta = physics.totalGroundAreaM2
    const tv = physics.volumeM3
    const tw = physics.weightKg

    const hr = hRef.m > 0 ? th / hRef.m : 0
    const ar = aRef.m2 > 0 ? ta / aRef.m2 : 0
    const vr = vRef.m3 > 0 ? tv / vRef.m3 : 0
    const wr = wRef.kg > 0 ? tw / wRef.kg : 0

    const norm = (a, b) => {
      const m = Math.max(a, b, 1e-9)
      return [(a / m) * 100, (b / m) * 100]
    }

    const [hL, hR] = norm(th, hRef.m)
    const [aL, aR] = norm(ta, aRef.m2)
    const [vL, vR] = norm(tv, vRef.m3)
    const [wL, wR] = norm(tw, wRef.kg)

    return {
      hRatio: hr,
      aRatio: ar,
      vRatio: vr,
      wRatio: wr,
      bars: {
        h: [hL, hR],
        a: [aL, aR],
        v: [vL, vR],
        w: [wL, wR],
      },
    }
  }, [physics, hi, ai, vi, wi])

  const statCardClass =
    'data-stagger-card rounded-2xl border border-white/[0.08] bg-gradient-to-br from-zinc-900/90 via-zinc-950/70 to-black/50 p-4 shadow-inner shadow-black/20 md:p-5'

  return (
    <div className="space-y-4">
      <p className="text-center text-[11px] text-zinc-500 md:text-left">{topHint}</p>

      <div className={statCardClass}>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-yellow-200/85">Height</p>
        <p className="display-font mt-1 text-xl font-extrabold text-white sm:text-2xl">
          {physics.totalHeightM < 1
            ? `${(physics.totalHeightM * 100).toFixed(1)} cm`
            : `${physics.totalHeightM.toFixed(2)} m`}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {HEIGHT_REFS.map((r, i) => (
            <button
              key={r.label}
              type="button"
              onClick={() => setHi(i)}
              className={`${chip} ${i === hi ? chipActive : ''}`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <DualBar
          leftLabel="Your stack (thickness)"
          rightLabel={HEIGHT_REFS[hi].label}
          leftPct={bars.h[0]}
          rightPct={bars.h[1]}
          leftTone="bg-gradient-to-t from-emerald-700 to-yellow-400/90"
          rightTone="bg-gradient-to-t from-zinc-700 to-zinc-400"
        />
        <p className="mt-2 text-sm text-emerald-200/90">
          ≈ <strong>{hRatio < 0.01 ? hRatio.toExponential(2) : hRatio.toFixed(2)}×</strong> {heightSuffix}
        </p>
      </div>

      <div className={statCardClass}>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-200/85">Ground area</p>
        <p className="display-font mt-1 text-xl font-extrabold text-white sm:text-2xl">
          {physics.totalGroundAreaM2 < 10_000
            ? `${physics.totalGroundAreaM2.toFixed(1)} m²`
            : `${(physics.totalGroundAreaM2 / 1_000_000).toFixed(3)} km²`}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {AREA_REFS.map((r, i) => (
            <button key={r.label} type="button" onClick={() => setAi(i)} className={`${chip} ${i === ai ? chipActive : ''}`}>
              {r.label}
            </button>
          ))}
        </div>
        <DualBar
          leftLabel="Your footprint"
          rightLabel={AREA_REFS[ai].label}
          leftPct={bars.a[0]}
          rightPct={bars.a[1]}
          leftTone="bg-gradient-to-t from-emerald-800 to-emerald-500/80"
          rightTone="bg-gradient-to-t from-slate-700 to-slate-400"
        />
        <p className="mt-2 text-sm text-emerald-200/90">
          ≈ <strong>{aRatio < 0.01 ? aRatio.toExponential(2) : aRatio.toFixed(2)}×</strong> {areaSuffix}
        </p>
      </div>

      <div className={statCardClass}>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sky-200/85">Volume</p>
        <p className="display-font mt-1 text-xl font-extrabold text-white sm:text-2xl">
          {physics.volumeM3 < 1
            ? `${(physics.volumeM3 * 1_000_000).toFixed(0)} cm³`
            : `${physics.volumeM3.toFixed(3)} m³`}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {VOL_REFS.map((r, i) => (
            <button key={r.label} type="button" onClick={() => setVi(i)} className={`${chip} ${i === vi ? chipActive : ''}`}>
              {r.label}
            </button>
          ))}
        </div>
        <DualBar
          leftLabel="Cash volume"
          rightLabel={VOL_REFS[vi].label}
          leftPct={bars.v[0]}
          rightPct={bars.v[1]}
          leftTone="bg-gradient-to-t from-sky-800 to-sky-500/80"
          rightTone="bg-gradient-to-t from-indigo-900 to-indigo-500/70"
        />
        <p className="mt-2 text-sm text-sky-200/90">
          ≈ <strong>{vRatio < 0.01 ? vRatio.toExponential(2) : vRatio.toFixed(2)}×</strong> {volSuffix}
        </p>
      </div>

      <div className={statCardClass}>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-200/85">Weight</p>
        <p className="display-font mt-1 text-xl font-extrabold text-white sm:text-2xl">
          {physics.weightKg < 1000
            ? `${physics.weightKg.toFixed(1)} kg`
            : `${(physics.weightKg / 1000).toFixed(2)} t`}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {WEIGHT_REFS.map((r, i) => (
            <button key={r.label} type="button" onClick={() => setWi(i)} className={`${chip} ${i === wi ? chipActive : ''}`}>
              {r.label}
            </button>
          ))}
        </div>
        <DualBar
          leftLabel="Bills (est.)"
          rightLabel={WEIGHT_REFS[wi].label}
          leftPct={bars.w[0]}
          rightPct={bars.w[1]}
          leftTone="bg-gradient-to-t from-violet-900 to-violet-500/80"
          rightTone="bg-gradient-to-t from-fuchsia-900 to-fuchsia-600/70"
        />
        <p className="mt-2 text-sm text-violet-200/90">
          ≈ <strong>{wRatio < 0.01 ? wRatio.toExponential(2) : wRatio.toFixed(2)}×</strong> {weightSuffix}
        </p>
      </div>
    </div>
  )
}
