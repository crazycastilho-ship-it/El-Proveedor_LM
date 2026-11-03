import { CONFIG } from '../config'

const money = new Intl.NumberFormat(CONFIG.currency.locale, {
  style: 'currency',
  currency: CONFIG.currency.code,
  maximumFractionDigits: 0,
})

export function formatMoney(value) {
  return money.format(Math.round(value || 0))
}

// Convierte a kilos según la unidad elegida.
export function toKg(qty, unit) {
  return unit === 'lb' ? qty * CONFIG.libraEnKg : qty
}

// Convierte kilos a la unidad elegida (para mostrar).
export function fromKg(kg, unit) {
  return unit === 'lb' ? kg / CONFIG.libraEnKg : kg
}

// Muestra una cantidad en kg de forma legible ("1 kg", "0.5 kg", "1.25 kg").
export function formatKg(kg) {
  const n = Math.round(kg * 100) / 100
  return `${n} kg`
}

// Muestra la cantidad en libras + kg, p. ej. "3 lb (1.5 kg)".
export function formatQty(kg) {
  const lb = kg / CONFIG.libraEnKg
  const lbTxt = Number.isInteger(lb) ? `${lb}` : lb.toFixed(1)
  return `${lbTxt} lb · ${formatKg(kg)}`
}

// Muestra una cantidad por unidades, p. ej. "2 unidades", "1 cubeta".
export function formatUnit(qty, unitLabel = 'unidad') {
  const n = Math.round(qty)
  let label = unitLabel
  if (n !== 1) {
    // pluralización simple
    if (unitLabel === 'unidad') label = 'unidades'
    else if (/z$/.test(unitLabel)) label = unitLabel.slice(0, -1) + 'ces'
    else label = unitLabel + 's'
  }
  return `${n} ${label}`
}
