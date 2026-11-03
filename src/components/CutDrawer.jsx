import { useEffect, useState } from 'react'
import { CONFIG } from '../config'
import { formatMoney, toKg, formatKg } from '../lib/format'
import MethodIcons from './MethodIcons'

// Presets rápidos (en libras).
const PRESETS = [0.5, 1, 2, 3]

export default function CutDrawer({ corte, onClose, onAdd }) {
  const [unit, setUnit] = useState('lb') // 'lb' | 'kg'
  const [qty, setQty] = useState(1)

  // Reinicia al abrir un corte distinto.
  useEffect(() => {
    setUnit('lb')
    setQty(1)
  }, [corte?.slug])

  useEffect(() => {
    function onEsc(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [onClose])

  if (!corte) return null

  const step = unit === 'lb' ? 0.5 : 0.25
  const kg = toKg(qty, unit)
  const price = corte.pricePerKg * kg
  const clamp = (n) => Math.max(step, Math.round(n * 1000) / 1000)

  const add = () => {
    onAdd({ id: 'cerdo:' + corte.slug, name: corte.name, kind: 'weight', pricePerKg: corte.pricePerKg, kg })
    onClose()
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={`Pedir ${corte.name}`} onClick={(e) => e.stopPropagation()}>
        <button className="sheet-close" onClick={onClose} aria-label="Cerrar">×</button>

        <div className="cut-head">
          <h2 className="cut-title">{corte.name}</h2>
          <p className="cut-price">{formatMoney(corte.pricePerKg)} <span>/ kg</span></p>
        </div>
        <p className="cut-desc">{corte.description}</p>
        <MethodIcons methods={corte.methods} showLabels />

        <div className="unit-toggle" role="tablist" aria-label="Unidad">
          <button
            role="tab"
            aria-selected={unit === 'lb'}
            className={unit === 'lb' ? 'active' : ''}
            onClick={() => setUnit('lb')}
          >
            Libras
          </button>
          <button
            role="tab"
            aria-selected={unit === 'kg'}
            className={unit === 'kg' ? 'active' : ''}
            onClick={() => setUnit('kg')}
          >
            Kilos
          </button>
        </div>

        <div className="stepper">
          <button className="step" onClick={() => setQty((q) => clamp(q - step))} aria-label="Menos">−</button>
          <div className="qty-display">
            <input
              type="number"
              inputMode="decimal"
              min={step}
              step={step}
              value={qty}
              onChange={(e) => setQty(clamp(parseFloat(e.target.value) || step))}
              aria-label={`Cantidad en ${unit === 'lb' ? 'libras' : 'kilos'}`}
            />
            <span className="qty-unit">{unit === 'lb' ? 'lb' : 'kg'}</span>
          </div>
          <button className="step" onClick={() => setQty((q) => clamp(q + step))} aria-label="Más">+</button>
        </div>

        <div className="presets">
          {PRESETS.map((p) => {
            const val = unit === 'lb' ? p : p * CONFIG.libraEnKg
            return (
              <button key={p} className={qty === val ? 'preset active' : 'preset'} onClick={() => setQty(val)}>
                {unit === 'lb' ? (p === 0.5 ? '½ lb' : `${p} lb`) : formatKg(val)}
              </button>
            )
          })}
        </div>

        <p className="equiv">
          {unit === 'lb'
            ? `Equivale a ${formatKg(kg)}`
            : `Equivale a ${(kg / CONFIG.libraEnKg).toFixed(2)} libras`}
        </p>

        <button className="btn-add" onClick={add}>
          Agregar · {formatMoney(price)}
        </button>
      </div>
    </div>
  )
}
