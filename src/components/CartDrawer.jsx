import { useEffect, useMemo, useState } from 'react'
import { CONFIG } from '../config'
import { useCart, lineTotal } from '../store/cart'
import { formatMoney, formatQty, formatUnit, toKg, fromKg } from '../lib/format'
import { saveOrder } from '../lib/supabase'
import { buildWhatsappLink, isWompiEnabled, goToWompiCheckout } from '../lib/payments'

const { delivery, payment } = CONFIG

export default function CartDrawer({ open, onClose }) {
  const cart = useCart()
  const [step, setStep] = useState('cart')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [waLink, setWaLink] = useState('')

  const [form, setForm] = useState({
    name: '', phone: '',
    deliveryType: delivery.enableDelivery ? 'delivery' : 'pickup',
    address: '', neighborhood: '', notes: '',
    paymentMethod: payment.cashOnDelivery ? 'cash' : (isWompiEnabled() ? 'wompi' : 'cash'),
  })

  useEffect(() => { if (open) { setStep('cart'); setError('') } }, [open])

  const deliveryFee = useMemo(() => {
    if (form.deliveryType === 'pickup') return 0
    if (delivery.freeOver > 0 && cart.subtotal >= delivery.freeOver) return 0
    return delivery.fee
  }, [form.deliveryType, cart.subtotal])

  const total = cart.subtotal + deliveryFee
  const belowMin = cart.subtotal < delivery.minOrder
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async () => {
    setError('')
    if (!form.name.trim() || !form.phone.trim()) return setError('Escribe tu nombre y tu teléfono.')
    if (form.deliveryType === 'delivery' && !form.address.trim()) return setError('Escribe la dirección de entrega.')
    const order = { ...form, items: cart.items, subtotal: cart.subtotal, deliveryFee, total }
    setSending(true)
    try {
      let orderId = null
      try { orderId = (await saveOrder(order))?.id || null } catch {}
      if (form.paymentMethod === 'wompi' && isWompiEnabled()) { goToWompiCheckout(order, orderId); return }
      const link = buildWhatsappLink(order, orderId)
      setWaLink(link); window.open(link, '_blank'); cart.clear(); setStep('done')
    } catch { setError('No pudimos enviar el pedido. Intenta de nuevo.') }
    finally { setSending(false) }
  }

  const itemQtyLabel = (it) => it.kind === 'unit' ? formatUnit(it.qty, it.unitLabel) : formatQty(it.kg)

  const dec = (it) => {
    if (it.kind === 'unit') cart.setAmount(it.id, Math.max(0, it.qty - 1))
    else cart.setAmount(it.id, Math.max(0, Math.round(toKg(fromKg(it.kg, 'lb') - 0.5, 'lb') * 1000) / 1000))
  }
  const inc = (it) => {
    if (it.kind === 'unit') cart.setAmount(it.id, it.qty + 1)
    else cart.setAmount(it.id, Math.round(toKg(fromKg(it.kg, 'lb') + 0.5, 'lb') * 1000) / 1000)
  }

  return (
    <>
      <div className={'drawer-backdrop' + (open ? ' open' : '')} onClick={onClose} />
      <aside className={'drawer' + (open ? ' open' : '')} aria-hidden={!open} aria-label="Carrito">
        <header className="drawer-head">
          <h2>{step === 'checkout' ? 'Tus datos' : step === 'done' ? '¡Listo!' : 'Tu pedido'}</h2>
          <button className="sheet-close" onClick={onClose} aria-label="Cerrar">×</button>
        </header>

        {step === 'cart' && (
          <div className="drawer-body">
            {cart.items.length === 0 ? (
              <div className="empty">
                <p>Tu pedido está vacío.</p>
                <p className="empty-sub">Toca un corte del cerdo o mira "Otros productos".</p>
              </div>
            ) : (
              <>
                <ul className="cart-list">
                  {cart.items.map((it) => {
                    const unitTxt = it.kind === 'unit'
                      ? `${it.qty}`
                      : `${fromKg(it.kg, 'lb') % 1 === 0 ? fromKg(it.kg, 'lb') : fromKg(it.kg, 'lb').toFixed(1)} lb`
                    return (
                      <li className="cart-item" key={it.id}>
                        <div className="ci-main">
                          <span className="ci-name">{it.name}</span>
                          <span className="ci-qty">{itemQtyLabel(it)}</span>
                        </div>
                        <div className="ci-controls">
                          <div className="ci-stepper">
                            <button aria-label="Menos" onClick={() => dec(it)}>−</button>
                            <span>{unitTxt}</span>
                            <button aria-label="Más" onClick={() => inc(it)}>+</button>
                          </div>
                          <span className="ci-price">{formatMoney(lineTotal(it))}</span>
                          <button className="ci-remove" onClick={() => cart.remove(it.id)} aria-label={`Quitar ${it.name}`}>Quitar</button>
                        </div>
                      </li>
                    )
                  })}
                </ul>
                <div className="totals">
                  <div className="row"><span>Subtotal</span><span>{formatMoney(cart.subtotal)}</span></div>
                  {belowMin && (<p className="warn">Pedido mínimo {formatMoney(delivery.minOrder)}. Te faltan {formatMoney(delivery.minOrder - cart.subtotal)}.</p>)}
                </div>
                <button className="btn-primary" disabled={belowMin} onClick={() => setStep('checkout')}>Continuar</button>
              </>
            )}
          </div>
        )}

        {step === 'checkout' && (
          <div className="drawer-body">
            <label className="field"><span>Nombre</span>
              <input value={form.name} onChange={set('name')} placeholder="Tu nombre" /></label>
            <label className="field"><span>Teléfono / WhatsApp</span>
              <input value={form.phone} onChange={set('phone')} inputMode="tel" placeholder="300 000 0000" /></label>

            {(delivery.enableDelivery || delivery.enablePickup) && (
              <div className="seg" role="radiogroup" aria-label="Forma de entrega">
                {delivery.enableDelivery && (<button className={form.deliveryType === 'delivery' ? 'active' : ''} onClick={() => setForm((f) => ({ ...f, deliveryType: 'delivery' }))}>Domicilio</button>)}
                {delivery.enablePickup && (<button className={form.deliveryType === 'pickup' ? 'active' : ''} onClick={() => setForm((f) => ({ ...f, deliveryType: 'pickup' }))}>Recojo en tienda</button>)}
              </div>
            )}

            {form.deliveryType === 'delivery' && (
              <>
                <label className="field"><span>Dirección</span>
                  <input value={form.address} onChange={set('address')} placeholder="Calle, número, apto" /></label>
                <label className="field"><span>Barrio (opcional)</span>
                  <input value={form.neighborhood} onChange={set('neighborhood')} placeholder="Barrio" /></label>
                <p className="hint-note">{delivery.note}</p>
                {delivery.partnerUrl && (
                  <a className="btn-partner" href={`${delivery.partnerUrl}?ref=${encodeURIComponent(CONFIG.brand.name)}&total=${cart.subtotal}`} target="_blank" rel="noreferrer">
                    Domicilio con {delivery.partnerName} ↗
                  </a>
                )}
              </>
            )}
            {form.deliveryType === 'pickup' && (<p className="hint-note">Recoges en {CONFIG.contact.address}. {CONFIG.contact.hours}</p>)}

            <label className="field"><span>Notas (opcional)</span>
              <input value={form.notes} onChange={set('notes')} placeholder="Ej: sin grasa, corte en trozos…" /></label>

            <fieldset className="pay">
              <legend>Pago</legend>
              {payment.cashOnDelivery && (<label className="radio"><input type="radio" name="pay" checked={form.paymentMethod === 'cash'} onChange={() => setForm((f) => ({ ...f, paymentMethod: 'cash' }))} /><span>Contra entrega (efectivo / datáfono)</span></label>)}
              {isWompiEnabled() && (<label className="radio"><input type="radio" name="pay" checked={form.paymentMethod === 'wompi'} onChange={() => setForm((f) => ({ ...f, paymentMethod: 'wompi' }))} /><span>Pagar en línea (Wompi)</span></label>)}
            </fieldset>

            <div className="totals">
              <div className="row"><span>Subtotal</span><span>{formatMoney(cart.subtotal)}</span></div>
              {form.deliveryType === 'delivery' && (<div className="row"><span>Domicilio</span><span>{deliveryFee ? formatMoney(deliveryFee) : 'Gratis'}</span></div>)}
              <div className="row total"><span>Total</span><span>{formatMoney(total)}</span></div>
            </div>
            {error && <p className="warn">{error}</p>}
            <button className="btn-primary" onClick={submit} disabled={sending}>
              {sending ? 'Enviando…' : form.paymentMethod === 'wompi' ? `Pagar ${formatMoney(total)}` : 'Enviar pedido por WhatsApp'}
            </button>
            <button className="btn-ghost" onClick={() => setStep('cart')}>Volver</button>
          </div>
        )}

        {step === 'done' && (
          <div className="drawer-body">
            <div className="done">
              <div className="done-mark" aria-hidden="true">✓</div>
              <p>Tu pedido salió por WhatsApp. Te confirmamos el tiempo de entrega por ahí mismo.</p>
              {waLink && <a className="btn-primary" href={waLink} target="_blank" rel="noreferrer">Abrir WhatsApp de nuevo</a>}
              <button className="btn-ghost" onClick={onClose}>Seguir pidiendo</button>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
