import { useState } from 'react'
import { formatMoney } from '../lib/format'
import pieces from '../data/pieces.json'

// Muestra TU imagen del despiece (con sus nombres y líneas), ya sin el título.
// Encima, cada corte tiene su CONTORNO EXACTO: al pasar el mouse o tocar se
// resalta esa parte; al hacer clic abre el pedido.
export default function PigDiagram({ cortes, onSelect }) {
  const [hover, setHover] = useState(null)
  const bySlug = Object.fromEntries(cortes.map((c) => [c.slug, c]))
  const { w, h, src } = pieces.image
  const hovered = hover ? bySlug[hover] : null

  return (
    <div className="pig-wrap">
      <div className="pig-stage">
        <svg
          className="pig-svg"
          viewBox={`0 0 ${w} ${h}`}
          role="group"
          aria-label="Despiece del cerdo. Toca un corte para pedirlo."
        >
          <image href={src} x="0" y="0" width={w} height={h} />
          <g className="regions">
            {pieces.pieces.map((p) => {
              const c = bySlug[p.slug]
              if (!c || !p.contour) return null
              return (
                <polygon
                  key={p.slug}
                  className={'region' + (hover === p.slug ? ' on' : '')}
                  points={p.contour}
                  tabIndex={0}
                  role="button"
                  aria-label={`${c.name}, ${formatMoney(c.pricePerKg)} por kilo. Pedir`}
                  onMouseEnter={() => setHover(p.slug)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(p.slug)}
                  onBlur={() => setHover(null)}
                  onClick={() => onSelect(c)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onSelect(c)
                    }
                  }}
                />
              )
            })}
          </g>
        </svg>

        <span className={'piece-tip' + (hovered ? ' show' : '')} aria-hidden="true">
          {hovered ? (
            <>
              <strong>{hovered.name}</strong>
              <span>{formatMoney(hovered.pricePerKg)} / kg</span>
            </>
          ) : (
            'Toca una parte'
          )}
        </span>
      </div>
      <p className="pig-hint">Toca una parte del cerdo para pedirla</p>
    </div>
  )
}
