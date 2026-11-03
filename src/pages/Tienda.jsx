import { useEffect, useState } from 'react'
import { CONFIG } from '../config'
import { useCart } from '../store/cart'
import { fetchCortes } from '../lib/supabase'
import { formatMoney } from '../lib/format'
import PigDiagram from '../components/PigDiagram'
import PromoBanner from '../components/PromoBanner'
import CutDrawer from '../components/CutDrawer'
import MethodIcons from '../components/MethodIcons'
import { CORTES } from '../data/cortes'

export default function Tienda() {
  const cart = useCart()
  const [cortes, setCortes] = useState(CORTES)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetchCortes().then(setCortes).catch(() => setCortes(CORTES))
  }, [])

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <h1>Elige tu corte y nosotros te lo llevamos.</h1>
          <p className="lede">
            Toca una parte del cerdo, pídela en <strong>libras</strong> o <strong>kilos</strong> y recíbela en tu casa. Cerdo fresco del día en {CONFIG.contact.address.split(',')[0]}.
          </p>
        </div>
        <PigDiagram cortes={cortes} onSelect={setSelected} />
      </section>

      <PromoBanner />

      <section id="cortes" className="cuts" aria-label="Todos los cortes">
        <h2 className="section-title">Todos los cortes</h2>
        <div className="cut-grid">
          {cortes.map((c) => (
            <button className="cut-card" key={c.slug} onClick={() => setSelected(c)}>
              <div className="cut-card-top">
                <span className="cut-card-name">{c.name}</span>
                <MethodIcons methods={c.methods} />
              </div>
              <p className="cut-card-desc">{c.description}</p>
              <div className="cut-card-foot">
                <span className="cut-card-price">{formatMoney(c.pricePerKg)} <em>/ kg</em></span>
                <span className="cut-card-cta">Pedir</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <CutDrawer corte={selected} onClose={() => setSelected(null)} onAdd={cart.add} />
    </>
  )
}
