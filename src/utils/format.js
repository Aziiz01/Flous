export const formatNumber = (value) =>
  new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(
    Math.max(0, Math.floor(value || 0)),
  )

export const parseFormattedNumber = (rawValue) => {
  const digits = String(rawValue ?? '').replace(/[^\d]/g, '')
  return digits ? Number(digits) : 0
}

export const humanizeWeight = (bills) => {
  const grams = bills
  const kg = grams / 1000
  const tons = kg / 1000

  if (tons >= 1) return `${tons.toLocaleString('en-US', { maximumFractionDigits: 2 })} t`
  if (kg >= 1) return `${kg.toLocaleString('en-US', { maximumFractionDigits: 2 })} kg`
  return `${grams.toLocaleString('en-US')} g`
}

export const humanizeStackHeight = (bills) => {
  const mm = bills * 0.1
  const cm = mm / 10
  const m = cm / 100
  const km = m / 1000

  if (km >= 1) return `${km.toLocaleString('en-US', { maximumFractionDigits: 2 })} km`
  if (m >= 1) return `${m.toLocaleString('en-US', { maximumFractionDigits: 2 })} m`
  if (cm >= 1) return `${cm.toLocaleString('en-US', { maximumFractionDigits: 2 })} cm`
  return `${mm.toLocaleString('en-US', { maximumFractionDigits: 2 })} mm`
}

export const humanizeVolume = (bills) => {
  // Rough estimate using 156mm x 66mm x 0.11mm dimensions.
  const billVolumeCm3 = (15.6 * 6.6 * 0.011)
  const totalCm3 = billVolumeCm3 * bills
  const liters = totalCm3 / 1000
  const m3 = liters / 1000

  if (m3 >= 1) return `${m3.toLocaleString('en-US', { maximumFractionDigits: 2 })} m³`
  if (liters >= 1) return `${liters.toLocaleString('en-US', { maximumFractionDigits: 2 })} L`
  return `${totalCm3.toLocaleString('en-US', { maximumFractionDigits: 2 })} cm³`
}
