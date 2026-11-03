import { CONFIG } from '../config'
import { formatMoney, formatQty, formatUnit } from './format'
import { lineTotal } from '../store/cart'

// Arma el mensaje de WhatsApp con el resumen del pedido y devuelve el enlace.
export function buildWhatsappLink(order, orderId) {
  const lines = []
  lines.push(`*Pedido — ${CONFIG.brand.name}*`)
  if (orderId) lines.push(`N.º ${String(orderId).slice(0, 8)}`)
  lines.push('')
  order.items.forEach((it) => {
    const cant = it.kind === 'unit' ? formatUnit(it.qty, it.unitLabel) : formatQty(it.kg)
    lines.push(`• ${it.name} — ${cant} — ${formatMoney(lineTotal(it))}`)
  })
  lines.push('')
  lines.push(`Subtotal: ${formatMoney(order.subtotal)}`)
  if (order.deliveryType === 'delivery') {
    lines.push(`Domicilio: ${order.deliveryFee ? formatMoney(order.deliveryFee) : 'Gratis'}`)
  }
  lines.push(`*Total: ${formatMoney(order.total)}*`)
  lines.push('')
  lines.push(`Cliente: ${order.name}`)
  lines.push(`Tel: ${order.phone}`)
  lines.push(order.deliveryType === 'delivery' ? 'Entrega: Domicilio' : 'Entrega: Recoge en tienda')
  if (order.deliveryType === 'delivery') {
    lines.push(`Dirección: ${order.address}${order.neighborhood ? ', ' + order.neighborhood : ''}`)
  }
  lines.push(`Pago: ${order.paymentMethod === 'wompi' ? 'En línea (Wompi)' : 'Contra entrega'}`)
  if (order.notes) lines.push(`Notas: ${order.notes}`)

  const text = encodeURIComponent(lines.join('\n'))
  return `https://wa.me/${CONFIG.contact.whatsapp}?text=${text}`
}

export function isWompiEnabled() {
  return Boolean(CONFIG.payment.wompiPublicKey)
}

export function goToWompiCheckout(order, orderId) {
  const key = CONFIG.payment.wompiPublicKey
  const amountInCents = Math.round(order.total) * 100
  const reference = `PROVEEDORLM-${orderId || Date.now()}`
  const params = new URLSearchParams({
    'public-key': key,
    currency: 'COP',
    'amount-in-cents': String(amountInCents),
    reference,
    'redirect-url': window.location.origin + '/?pago=ok',
  })
  window.location.href = `https://checkout.wompi.co/p/?${params.toString()}`
}
