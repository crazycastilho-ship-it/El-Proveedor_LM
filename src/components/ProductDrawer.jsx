import { useEffect, useState } from 'react'
import { CONFIG } from '../config'
import { formatMoney, toKg, formatKg, formatUnit } from '../lib/format'

const LB_PRESETS = [0.5, 1, 2, 3]
const UNIT_PRESETS = [1, 2, 3, 6]

export default function ProductDrawer({ producto, onClose, onAdd }) {
  const isWeight = producto?.unit === 'kg'
  const [unit, setUnit] = useState('lb') // solo para productos por peso
  const [qty, setQty] = useState(isWeight ? 1 : 1)

  useEffect(() => {
    setUnit('lb')
    setQty(1)
  }, [producto?.slug])

  useEffect(() => {
    const onEsc = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [onClose])

  if (!producto) return null

  // ---- Producto por PESO (kg/libras) ----
  if (isWeight) {
    const step = unit === 'lb' ? 0.5 : 0.25
    const kg = toKg(qty, unit)
    const price = producto.price * kg
    const clamp = (n) => Math.max(step, Math.round(n * 1000) / 1000)
    const add = () => {
      onAdd({ id: 'otros:' + producto.slug, name: producto.name, kind: 'weight', pricePerKg: producto.price, kg })
      onClose()
    }
    return (
      <div className="sheet-backdrop" onClick={onClose}>
        <div className="sheet" role="dialog" aria-modal="true" aria-label={`Pedir ${producto.name}`} onClick={(e) => e.stopPropagation()}>
          <button className="sheet-close" onClick={onClose} aria-label="Cerrar">×</button>
          <div className="cut-head">
            <h2 className="cut-title">{producto.name}</h2>
            <p className="cut-price">{formatMoney(producto.price)} <span>/ kg</span></p>
          </div>
          {producto.description && <p className="cut-desc">{producto.description}</p>}
          <div className="unit-toggle" role="tablist" aria-label="Unidad">
            <button role="tab" aria-selected={unit === 'lb'} className={unit === 'lb' ? 'active' : ''} onClick={() => setUnit('lb')}>Libras</button>
            <button role="tab" aria-selected={unit === 'kg'} className={unit === 'kg' ? 'active' : ''} onClick={() => setUnit('kg')}>Kilos</button>
          </div>
          <div className="stepper">
            <button className="step" onClick={() => setQty((q) => clamp(q - step))} aria-label="Menos">−</button>
            <div className="qty-display">
              <input type="number" inputMode="decimal" min={step} step={step} value={qty}
                onChange={(e) => setQty(clamp(parseFloat(e.target.value) || step))}
                aria-label={`Cantidad en ${unit === 'lb' ? 'libras' : 'kilos'}`} />
              <span className="qty-unit">{unit === 'lb' ? 'lb' : 'kg'}</span>
            </div>
            <button className="step" onClick={() => setQty((q) => clamp(q + step))} aria-label="Más">+</button>
          </div>
          <div className="presets">
            {LB_PRESETS.map((p) => {
              const val = unit === 'lb' ? p : p * CONFIG.libraEnKg
              return (
                <button key={p} className={qty === val ? 'preset active' : 'preset'} onClick={() => setQty(val)}>
                  {unit === 'lb' ? (p === 0.5 ? '½ lb' : `${p} lb`) : formatKg(val)}
                </button>
              )
            })}
          </div>
          <p className="equiv">{unit === 'lb' ? `Equivale a ${formatKg(kg)}` : `Equivale a ${(kg / CONFIG.libraEnKg).toFixed(2)} libras`}</p>
          <button className="btn-add" onClick={add}>Agregar · {formatMoney(price)}</button>
        </div>
      </div>
    )
  }

  // ---- Producto por UNIDAD ----
  const label = producto.unitLabel || 'unidad'
  const price = producto.price * qty
  const clamp = (n) => Math.max(1, Math.round(n))
  const add = () => {
    onAdd({ id: 'otros:' + producto.slug, name: producto.name, kind: 'unit', unitPrice: producto.price, qty, unitLabel: label })
    onClose()
  }
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={`Pedir ${producto.name}`} onClick={(e) => e.stopPropagation()}>
        <button className="sheet-close" onClick={onClose} aria-label="Cerrar">×</button>
        <div className="cut-head">
          <h2 className="cut-title">{producto.name}</h2>
          <p className="cut-price">{formatMoney(producto.price)} <span>/ {label}</span></p>
        </div>
        {producto.description && <p className="cut-desc">{producto.description}</p>}
        <div className="stepper">
          <button className="step" onClick={() => setQty((q) => clamp(q - 1))} aria-label="Menos">−</button>
          <div className="qty-display">
            <input type="number" inputMode="numeric" min={1} step={1} value={qty}
              onChange={(e) => setQty(clamp(parseInt(e.target.value) || 1))} aria-label="Cantidad" />
            <span className="qty-unit">{formatUnit(qty, label).split(' ').slice(1).join(' ')}</span>
          </div>
          <button className="step" onClick={() => setQty((q) => clamp(q + 1))} aria-label="Más">+</button>
        </div>
        <div className="presets">
          {UNIT_PRESETS.map((p) => (
            <button key={p} className={qty === p ? 'preset active' : 'preset'} onClick={() => setQty(p)}>{p}</button>
          ))}
        </div>
        <button className="btn-add" onClick={add}>Agregar · {formatMoney(price)}</button>
      </div>
    </div>
  )
}
