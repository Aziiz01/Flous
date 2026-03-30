/** USD bill reference dimensions (for physical scale). */
export const BILL_LENGTH_M = 0.156
export const BILL_WIDTH_M = 0.066
export const BILL_THICKNESS_M = 0.0001

const FOOTBALL_FIELD_M2 = 105 * 68
const TENNIS_COURT_M2 = 260
const PARKING_SPACE_M2 = 13
const BASKETBALL_COURT_M2 = 420
const KING_SIZE_BED_M2 = 3.6

const BASKETBALL_PLAYER_M = 2.0
const SHAQ_M = 2.16
const DOORWAY_M = 2.1
const SCHOOL_BUS_M = 3.5

const EIFFEL_TOWER_M = 324
const BIG_BEN_M = 96
const STATUE_LIBERTY_M = 93
const BURJ_KHALIFA_M = 828

const EVEREST_M = 8848
const K2_M = 8611

const CAR_KG = 1500
const ELEPHANT_KG = 6000
const BLUE_WHALE_KG = 100_000
const HUMAN_KG = 75
const PIANO_KG = 300
const HUMMER_KG = 3000

const formatQty = (n) => {
  if (n >= 100) return n.toFixed(0)
  if (n >= 10) return n.toFixed(1)
  return n.toFixed(2)
}

const pickVariant = (seed, count) => {
  const s = Number.isFinite(seed) ? Math.floor(Math.abs(seed)) : 0
  return s % Math.max(1, count)
}

export const computeStackPhysics = (totalBills, stackCount) => {
  const stacks = Math.max(1, stackCount || 1)
  const totalHeightM = totalBills * BILL_THICKNESS_M
  const footprintPerStackM2 = BILL_LENGTH_M * BILL_WIDTH_M
  const totalGroundAreaM2 = stacks * footprintPerStackM2
  const volumeM3 = totalBills * BILL_LENGTH_M * BILL_WIDTH_M * BILL_THICKNESS_M
  const weightKg = totalBills * 0.001

  return {
    totalHeightM,
    totalGroundAreaM2,
    volumeM3,
    weightKg,
    footprintPerStackM2,
  }
}

export const heightComparison = (heightM, seed = 0) => {
  if (heightM <= 0) return { line: '—', detail: '' }
  const v = pickVariant(seed, 4)

  if (heightM < 10) {
    const refs = [
      { m: BASKETBALL_PLAYER_M, label: 'a basketball player (~2 m)' },
      { m: SHAQ_M, label: 'Shaq at full height (~2.16 m)' },
      { m: DOORWAY_M, label: 'a tall doorway (~2.1 m)' },
      { m: SCHOOL_BUS_M, label: 'a school bus height (~3.5 m)' },
    ]
    const r = refs[v % refs.length]
    const x = heightM / r.m
    return {
      line: `Stacked thickness ≈ ${formatQty(x)}× the height of ${r.label}.`,
      detail: `${(heightM * 100).toFixed(1)} cm total if every bill were stacked in one column.`,
    }
  }

  if (heightM <= 500) {
    const buildingRefs = [
      { m: EIFFEL_TOWER_M, label: 'the Eiffel Tower (~324 m)' },
      { m: BURJ_KHALIFA_M, label: 'Burj Khalifa (~828 m)' },
      { m: STATUE_LIBERTY_M, label: 'the Statue of Liberty (~93 m)' },
      { m: BIG_BEN_M, label: 'Big Ben’s tower (~96 m)' },
    ]
    const r = buildingRefs[(v + Math.floor(heightM)) % buildingRefs.length]
    const x = heightM / r.m
    if (x >= 0.08 && x < 40) {
      return {
        line: `About ${formatQty(x)}× as tall as ${r.label}.`,
        detail: `${heightM.toFixed(1)} m of stacked bills.`,
      }
    }
    const b = heightM / BASKETBALL_PLAYER_M
    return {
      line: `Roughly ${formatQty(b)} basketball players tall (~2 m each).`,
      detail: `${heightM.toFixed(1)} m.`,
    }
  }

  const mountainRefs = [
    { m: EVEREST_M, label: 'Mount Everest (~8,848 m)' },
    { m: K2_M, label: 'K2 (~8,611 m)' },
  ]
  const r = mountainRefs[v % mountainRefs.length]
  const ev = heightM / r.m
  return {
    line: `About ${formatQty(ev)}× the height of ${r.label} — if stacked as one column.`,
    detail: `${(heightM / 1000).toFixed(2)} km of bills.`,
  }
}

export const areaComparison = (areaM2, seed = 0) => {
  if (areaM2 <= 0) return { line: '—', detail: '' }
  const v = pickVariant(seed + 17, 4)

  if (areaM2 < 200) {
    const refs = [
      { m: PARKING_SPACE_M2, label: 'US parking space (~13 m²)' },
      { m: KING_SIZE_BED_M2, label: 'king-size bed footprint (~3.6 m²)' },
      { m: TENNIS_COURT_M2 / 8, label: 'a large bedroom (~32 m²)' },
      { m: 25, label: 'a studio apartment floor (~25 m²)' },
    ]
    const r = refs[v % refs.length]
    const x = areaM2 / r.m
    return {
      line: `Footprint ≈ ${formatQty(x)}× the area of ${r.label}.`,
      detail: `${areaM2.toFixed(1)} m² of vault floor.`,
    }
  }

  if (areaM2 < 50_000) {
    const variants = [
      () => {
        const x = areaM2 / TENNIS_COURT_M2
        return {
          line: `About ${formatQty(x)} tennis court${x >= 1.05 ? 's' : ''} (~260 m² each).`,
          detail: `${areaM2.toFixed(0)} m².`,
        }
      },
      () => {
        const x = areaM2 / BASKETBALL_COURT_M2
        return {
          line: `About ${formatQty(x)} basketball court${x >= 1.05 ? 's' : ''} (~420 m² each).`,
          detail: `${areaM2.toFixed(0)} m².`,
        }
      },
      () => {
        const x = areaM2 / 400
        return {
          line: `Roughly ${formatQty(x)} small warehouse bays (~400 m² each).`,
          detail: `${areaM2.toFixed(0)} m².`,
        }
      },
      () => {
        const x = areaM2 / 1000
        return {
          line: `Around ${formatQty(x)}× the floor of a large hall (~1,000 m² each).`,
          detail: `${areaM2.toFixed(0)} m².`,
        }
      },
    ]
    return variants[v % variants.length]()
  }

  const x = areaM2 / FOOTBALL_FIELD_M2
  const alt = v % 2 === 0
  return {
    line: alt
      ? `About ${formatQty(x)} FIFA football fields (~7,140 m² each).`
      : `Enough surface for ${formatQty(x)} full-size soccer pitches laid end-to-end (roughly).`,
    detail: `${(areaM2 / 1_000_000).toFixed(3)} km².`,
  }
}

const BATHTUB_M3 = 0.3
const FRIDGE_M3 = 0.6
const SHIPPING_CONTAINER_M3 = 33
const OLYMPIC_POOL_M3 = 2500
const HOT_AIR_BALLOON_M3 = 2800

export const volumeComparison = (volumeM3, seed = 0) => {
  if (volumeM3 <= 0) return { line: '—', detail: '' }
  const v = pickVariant(seed + 33, 4)

  if (volumeM3 < 2) {
    const refs = [
      { m: BATHTUB_M3, label: 'bathtub (~0.3 m³)' },
      { m: FRIDGE_M3, label: 'large fridge (~0.6 m³)' },
      { m: 1, label: 'cubic meter of air in a closet' },
      { m: 0.15, label: 'carry-on suitcase (~0.15 m³)' },
    ]
    const r = refs[v % refs.length]
    const x = volumeM3 / r.m
    return {
      line: `Bill volume ≈ ${formatQty(x)}× ${r.label}.`,
      detail: `${(volumeM3 * 1_000_000).toFixed(0)} cm³ of paper.`,
    }
  }

  if (volumeM3 < 5000) {
    const refs = [
      { m: SHIPPING_CONTAINER_M3, label: '40 ft shipping container (~33 m³)' },
      { m: 50, label: 'moving truck load (~50 m³)' },
      { m: 100, label: 'small warehouse room (~100 m³)' },
      { m: 500, label: 'cinema lobby volume (~500 m³)' },
    ]
    const r = refs[v % refs.length]
    const x = volumeM3 / r.m
    return {
      line: `Roughly ${formatQty(x)}× the space of ${r.label}.`,
      detail: `${volumeM3.toFixed(2)} m³ total.`,
    }
  }

  const refs = [
    { m: OLYMPIC_POOL_M3, label: 'Olympic pool (~2,500 m³)' },
    { m: HOT_AIR_BALLOON_M3, label: 'hot-air balloon envelope (~2,800 m³)' },
  ]
  const r = refs[v % refs.length]
  const x = volumeM3 / r.m
  return {
    line: `About ${formatQty(x)} ${r.label.split('(')[0].trim()}${x >= 1.05 ? 's' : ''}.`,
    detail: `${volumeM3.toLocaleString('en-US', { maximumFractionDigits: 0 })} m³ total.`,
  }
}

export const weightComparison = (weightKg, seed = 0) => {
  if (weightKg <= 0) return { line: '—', detail: '' }
  const v = pickVariant(seed + 99, 4)

  if (weightKg < 2000) {
    const refs = [
      { m: CAR_KG, label: 'average car (~1,500 kg)' },
      { m: PIANO_KG, label: 'grand piano (~300 kg)' },
      { m: HUMAN_KG, label: 'adult human (~75 kg)' },
      { m: HUMMER_KG, label: 'large SUV (~3,000 kg)' },
    ]
    const r = refs[v % refs.length]
    const x = weightKg / r.m
    return {
      line: `About ${formatQty(x)}× the mass of ${r.label}.`,
      detail: `${weightKg.toFixed(1)} kg (≈1 g per bill).`,
    }
  }

  if (weightKg < 80_000) {
    const refs = [
      { m: ELEPHANT_KG, label: 'African elephant (~6,000 kg)' },
      { m: HUMMER_KG * 2, label: 'pair of heavy trucks (~6 t)' },
    ]
    const r = refs[v % refs.length]
    const x = weightKg / r.m
    return {
      line: `Roughly ${formatQty(x)}× ${r.label}.`,
      detail: `${(weightKg / 1000).toFixed(2)} tonnes.`,
    }
  }

  const x = weightKg / BLUE_WHALE_KG
  const truckT = 20_000
  const trucks = weightKg / truckT
  return v % 2 === 0
    ? {
        line: `About ${formatQty(x)} blue whales (~100 t each).`,
        detail: `${(weightKg / 1000).toFixed(1)} tonnes.`,
      }
    : {
        line: `Roughly ${formatQty(trucks)} twenty-tonne trucks worth of mass.`,
        detail: `${(weightKg / 1000).toFixed(1)} tonnes.`,
      }
}
