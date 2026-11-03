import { useEffect, useState } from 'react'
import { useCart } from '../store/cart'
import { fetchOtros } from '../lib/supabase'
import { formatMoney } from '../lib/format'
import ProductDrawer from '../components/ProductDrawer'
import { OTROS } from '../data/otros'

export default function Otros() {
  const cart = useCart()
  const [items, setItems] = useState(OTROS)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetchOtros().then(setItems).catch(() => setItems(OTROS))
  }, [])

  return (
    <>
      <section className="hero otros-hero">
        <div className="hero-copy">
          <h1>Otros productos</h1>
          <p className="lede">
            Además del cerdo, en la carnicería encuentras estos productos. Se agregan al <strong>mismo pedido</strong>.
          </p>
        </div>
      </section>

      <section className="cuts" aria-label="Otros productos">
        <div className="cut-grid">
          {items.map((p) => (
            <button className="cut-card" key={p.slug} onClick={() => setSelected(p)}>
              <div className="cut-card-top">
                <span className="cut-card-name">{p.name}</span>
              </div>
              <p className="cut-card-desc">{p.description}</p>
              <div className="cut-card-foot">
                <span className="cut-card-price">
                  {formatMoney(p.price)} <em>/ {p.unit === 'kg' ? 'kg' : (p.unitLabel || 'unidad')}</em>
                </span>
                <span className="cut-card-cta">Pedir</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <ProductDrawer producto={selected} onClose={() => setSelected(null)} onAdd={cart.add} />
    </>
  )
}
