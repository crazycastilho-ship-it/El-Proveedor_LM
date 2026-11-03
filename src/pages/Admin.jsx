import { useEffect, useMemo, useState } from 'react'
import { Link } from '../router'
import { CONFIG } from '../config'
import {
  hasSupabase, adminSignIn, adminSignOut, getSession, onAuthChange,
  fetchAllProducts, updateProduct, insertProduct, deleteProduct,
  fetchOrders, updateOrderStatus,
  fetchAllPromos, updatePromo, insertPromo, deletePromo,
  uploadPromoMedia, deletePromoMedia,
} from '../lib/supabase'
import { formatMoney } from '../lib/format'
import { CORTES } from '../data/cortes'
import { OTROS } from '../data/otros'

const slugify = (s) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const ESTADOS = ['nuevo', 'preparando', 'enviado', 'entregado', 'cancelado']
const ESTADO_COLOR = {
  nuevo: '#e0a429', preparando: '#3a86ff', enviado: '#8a63d2', entregado: '#7bb661', cancelado: '#b94a3a',
}

// Rango de fechas por preset
function rangeFor(preset) {
  const now = new Date()
  const end = new Date(now); end.setHours(23, 59, 59, 999)
  const start = new Date(now)
  if (preset === 'hoy') start.setHours(0, 0, 0, 0)
  else if (preset === '7') { start.setDate(now.getDate() - 6); start.setHours(0, 0, 0, 0) }
  else if (preset === '30') { start.setDate(now.getDate() - 29); start.setHours(0, 0, 0, 0) }
  else { start.setDate(1); start.setHours(0, 0, 0, 0) } // mes
  return { from: start.toISOString(), to: end.toISOString() }
}
const fmtFecha = (iso) => new Date(iso).toLocaleString('es-CO', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
const fmtDia = (iso) => new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
const soloDigitos = (s) => (s || '').replace(/\D/g, '')
// slug del producto a partir del id guardado en el ítem ('cerdo:lomo' -> 'lomo')
const baseSlug = (s) => (s && s.includes(':') ? s.split(':')[1] : s)
const itemQty = (it) => Number(it.qty_kg ?? it.qty_units ?? 0)

function descargarCSV(nombre, filas) {
  const csv = filas.map((r) => r.map((c) => {
    const v = String(c ?? '')
    return /[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v
  }).join(';')).join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob); a.download = nombre; a.click()
  URL.revokeObjectURL(a.href)
}

/* ========================= Sin Supabase ========================= */
function SinBackend() {
  return (
    <div className="admin-wrap">
      <div className="admin-note">
        <h2>Panel de administración</h2>
        <p>Para usar Pedidos, Informes y Contabilidad necesitas conectar <strong>Supabase</strong> (base de datos gratuita) y crear tu usuario administrador. Pasos en <code>DEPLOY.md</code>.</p>
        <p>Resumen: crea el proyecto en Supabase, ejecuta <code>schema.sql</code> y <code>seed.sql</code>, agrega <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code> en Cloudflare, y crea tu usuario en Authentication.</p>
      </div>
      <h3 className="admin-sub">Precios actuales (solo lectura)</h3>
      <table className="admin-table">
        <thead><tr><th>Producto</th><th>Precio</th><th>Tipo</th></tr></thead>
        <tbody>
          {CORTES.map((c) => (<tr key={c.slug}><td>{c.name}</td><td>{formatMoney(c.pricePerKg)}</td><td>/ kg (cerdo)</td></tr>))}
          {OTROS.map((p) => (<tr key={p.slug}><td>{p.name}</td><td>{formatMoney(p.price)}</td><td>/ {p.unit === 'kg' ? 'kg' : (p.unitLabel || 'unidad')} (otros)</td></tr>))}
        </tbody>
      </table>
      <p className="admin-back"><Link to="/">← Volver a la tienda</Link></p>
    </div>
  )
}

/* ========================= Login ========================= */
function Login({ onDone }) {
  const [email, setEmail] = useState(''); const [pw, setPw] = useState('')
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true)
    try { await adminSignIn(email.trim(), pw); onDone() }
    catch { setErr('Correo o contraseña incorrectos.') }
    finally { setBusy(false) }
  }
  return (
    <div className="admin-wrap">
      <form className="admin-login" onSubmit={submit}>
        <h2>Panel de administración</h2>
        <p className="admin-muted">Ingresa con tu cuenta de administrador.</p>
        <label className="field"><span>Correo</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></label>
        <label className="field"><span>Contraseña</span>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" /></label>
        {err && <p className="warn">{err}</p>}
        <button className="btn-primary" disabled={busy}>{busy ? 'Ingresando…' : 'Ingresar'}</button>
        <p className="admin-back"><Link to="/">← Volver a la tienda</Link></p>
      </form>
    </div>
  )
}

/* ========================= Filtro de rango ========================= */
function RangoFiltro({ preset, setPreset }) {
  const opts = [['hoy', 'Hoy'], ['7', '7 días'], ['30', '30 días'], ['mes', 'Este mes']]
  return (
    <div className="seg rango">
      {opts.map(([k, l]) => (
        <button key={k} className={preset === k ? 'active' : ''} onClick={() => setPreset(k)}>{l}</button>
      ))}
    </div>
  )
}

/* ========================= Módulo: Pedidos ========================= */
function Pedidos() {
  const [preset, setPreset] = useState('hoy')
  const [estado, setEstado] = useState('todos')
  const [orders, setOrders] = useState(null)
  const [open, setOpen] = useState({})
  const [err, setErr] = useState('')

  const load = () => {
    setOrders(null); setErr('')
    const { from, to } = rangeFor(preset)
    fetchOrders({ from, to, status: estado }).then(setOrders).catch(() => setErr('No se pudieron cargar los pedidos.'))
  }
  useEffect(() => { load() }, [preset, estado])

  const cambiarEstado = async (o, s) => {
    try { await updateOrderStatus(o.id, s); setOrders((os) => os.map((x) => x.id === o.id ? { ...x, status: s } : x)) }
    catch { alert('No se pudo actualizar el estado.') }
  }

  if (err) return <p className="warn">{err}</p>
  if (!orders) return <p className="admin-muted">Cargando pedidos…</p>

  const totalPeriodo = orders.filter((o) => o.status !== 'cancelado').reduce((s, o) => s + (o.total || 0), 0)

  return (
    <div>
      <div className="mod-top">
        <RangoFiltro preset={preset} setPreset={setPreset} />
        <select className="ad-in ad-select" value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="todos">Todos los estados</option>
          {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="mod-summary">{orders.length} pedidos · {formatMoney(totalPeriodo)}</span>
      </div>

      {orders.length === 0 ? <p className="admin-muted">No hay pedidos en este periodo.</p> : (
        <div className="orders-list">
          {orders.map((o) => {
            const abierto = open[o.id]
            const items = o.order_items || []
            const dir = [o.address, o.neighborhood].filter(Boolean).join(', ')
            return (
              <div className="order-card" key={o.id}>
                <div className="order-head" onClick={() => setOpen((p) => ({ ...p, [o.id]: !p[o.id] }))}>
                  <div className="oh-left">
                    <span className="oh-name">{o.customer_name}</span>
                    <span className="oh-meta">{fmtFecha(o.created_at)} · {o.delivery_type === 'delivery' ? 'Domicilio' : 'Recoge'}</span>
                  </div>
                  <div className="oh-right">
                    <span className="oh-total">{formatMoney(o.total)}</span>
                    <span className="estado-badge" style={{ background: ESTADO_COLOR[o.status] || '#666' }}>{o.status}</span>
                    <span className="oh-arrow">{abierto ? '▾' : '▸'}</span>
                  </div>
                </div>
                {abierto && (
                  <div className="order-body">
                    <ul className="od-items">
                      {items.map((it) => (
                        <li key={it.id}>
                          <span>{it.product_name}</span>
                          <span className="od-qty">{it.kind === 'unit' ? `${itemQty(it)} ${it.unit_label || 'u'}` : `${itemQty(it)} kg`}</span>
                          <span className="od-line">{formatMoney(it.line_total)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="od-grid">
                      <div><b>Tel:</b> {o.phone || '—'}</div>
                      <div><b>Pago:</b> {o.payment_method === 'wompi' ? 'En línea' : 'Contra entrega'}</div>
                      {o.delivery_type === 'delivery' && <div className="od-full"><b>Dirección:</b> {dir || '—'}</div>}
                      {o.notes && <div className="od-full"><b>Notas:</b> {o.notes}</div>}
                      <div className="od-full od-tot">
                        <span>Subtotal {formatMoney(o.subtotal)}</span>
                        {o.delivery_fee > 0 && <span>Domicilio {formatMoney(o.delivery_fee)}</span>}
                        <span className="od-total">Total {formatMoney(o.total)}</span>
                      </div>
                    </div>
                    <div className="od-actions">
                      <select className="ad-in ad-select" value={o.status} onChange={(e) => cambiarEstado(o, e.target.value)}>
                        {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {o.phone && <a className="od-btn" href={`https://wa.me/${soloDigitos(o.phone).length <= 10 ? '57' + soloDigitos(o.phone) : soloDigitos(o.phone)}`} target="_blank" rel="noreferrer">WhatsApp</a>}
                      {o.delivery_type === 'delivery' && dir && <a className="od-btn" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dir)}`} target="_blank" rel="noreferrer">Ver mapa</a>}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ========================= Módulo: Productos ========================= */
function Productos() {
  const [rows, setRows] = useState(null)
  const [status, setStatus] = useState({})
  const [error, setError] = useState('')
  const [nuevo, setNuevo] = useState({ name: '', price: '', cost: '', unit: 'unidad', unit_label: 'unidad', description: '' })
  const load = () => fetchAllProducts().then(setRows).catch(() => setError('No se pudieron cargar los productos.'))
  useEffect(() => { load() }, [])
  const setField = (id, f, v) => setRows((rs) => rs.map((r) => r.id === id ? { ...r, [f]: v } : r))
  const save = async (r) => {
    setStatus((s) => ({ ...s, [r.id]: 'saving' }))
    try {
      await updateProduct(r.id, {
        name: r.name, price_per_kg: Math.round(Number(r.price_per_kg) || 0),
        cost: Math.round(Number(r.cost) || 0), description: r.description, active: r.active,
        unit: r.unit, unit_label: r.unit_label,
      })
      setStatus((s) => ({ ...s, [r.id]: 'ok' })); setTimeout(() => setStatus((s) => ({ ...s, [r.id]: undefined })), 1500)
    } catch { setStatus((s) => ({ ...s, [r.id]: 'err' })) }
  }
  const add = async () => {
    if (!nuevo.name.trim() || !nuevo.price) return
    try {
      await insertProduct({
        slug: slugify(nuevo.name) + '-' + Math.random().toString(36).slice(2, 6),
        name: nuevo.name.trim(), price_per_kg: Math.round(Number(nuevo.price) || 0),
        cost: Math.round(Number(nuevo.cost) || 0), description: nuevo.description,
        category: 'otros', unit: nuevo.unit, unit_label: nuevo.unit === 'kg' ? 'kg' : (nuevo.unit_label || 'unidad'),
        active: true, sort: 999,
      })
      setNuevo({ name: '', price: '', cost: '', unit: 'unidad', unit_label: 'unidad', description: '' }); load()
    } catch { setError('No se pudo agregar el producto.') }
  }
  const del = async (r) => { if (confirm(`¿Eliminar "${r.name}"?`)) { try { await deleteProduct(r.id); load() } catch { setError('No se pudo eliminar.') } } }

  if (error) return <p className="warn">{error}</p>
  if (!rows) return <p className="admin-muted">Cargando…</p>
  const cerdo = rows.filter((r) => r.category !== 'otros')
  const otros = rows.filter((r) => r.category === 'otros')
  const Row = (r) => (
    <tr key={r.id}>
      <td><input className="ad-in" value={r.name} onChange={(e) => setField(r.id, 'name', e.target.value)} /></td>
      <td><input className="ad-in ad-num" type="number" value={r.price_per_kg} onChange={(e) => setField(r.id, 'price_per_kg', e.target.value)} /></td>
      <td><input className="ad-in ad-num" type="number" value={r.cost ?? 0} onChange={(e) => setField(r.id, 'cost', e.target.value)} /></td>
      <td className="ad-margin">{r.price_per_kg > 0 ? Math.round((1 - (r.cost || 0) / r.price_per_kg) * 100) + '%' : '—'}</td>
      <td><input type="checkbox" checked={!!r.active} onChange={(e) => setField(r.id, 'active', e.target.checked)} /></td>
      <td className="ad-actions">
        <button className="ad-save" onClick={() => save(r)}>{status[r.id] === 'saving' ? '…' : status[r.id] === 'ok' ? '✓' : status[r.id] === 'err' ? '⚠' : 'Guardar'}</button>
        {r.category === 'otros' && <button className="ad-del" onClick={() => del(r)}>Eliminar</button>}
      </td>
    </tr>
  )
  const Head = () => <thead><tr><th>Producto</th><th>Precio</th><th>Costo</th><th>Margen</th><th>Activo</th><th></th></tr></thead>
  return (
    <div>
      <h3 className="admin-sub">Cortes de cerdo</h3>
      <table className="admin-table"><Head />{<tbody>{cerdo.map(Row)}</tbody>}</table>
      <h3 className="admin-sub">Otros productos</h3>
      <table className="admin-table"><Head />{<tbody>{otros.map(Row)}</tbody>}</table>
      <div className="admin-add">
        <h4>Agregar otro producto</h4>
        <div className="admin-add-grid">
          <input className="ad-in" placeholder="Nombre" value={nuevo.name} onChange={(e) => setNuevo({ ...nuevo, name: e.target.value })} />
          <input className="ad-in ad-num" type="number" placeholder="Precio" value={nuevo.price} onChange={(e) => setNuevo({ ...nuevo, price: e.target.value })} />
          <input className="ad-in ad-num" type="number" placeholder="Costo" value={nuevo.cost} onChange={(e) => setNuevo({ ...nuevo, cost: e.target.value })} />
          <select className="ad-in" value={nuevo.unit} onChange={(e) => setNuevo({ ...nuevo, unit: e.target.value })}>
            <option value="unidad">Por unidad</option><option value="kg">Por kilo</option>
          </select>
          {nuevo.unit !== 'kg' && <input className="ad-in" placeholder="Etiqueta (unidad, bolsa…)" value={nuevo.unit_label} onChange={(e) => setNuevo({ ...nuevo, unit_label: e.target.value })} />}
          <button className="btn-primary ad-addbtn" onClick={add}>Agregar</button>
        </div>
      </div>
    </div>
  )
}

/* ========================= Módulo: Inventario ========================= */
function Inventario() {
  const [rows, setRows] = useState(null)
  const [status, setStatus] = useState({})
  useEffect(() => { fetchAllProducts().then(setRows).catch(() => setRows([])) }, [])
  const setField = (id, v) => setRows((rs) => rs.map((r) => r.id === id ? { ...r, stock: v } : r))
  const save = async (r) => {
    setStatus((s) => ({ ...s, [r.id]: 'saving' }))
    try { await updateProduct(r.id, { stock: r.stock === '' || r.stock == null ? null : Number(r.stock) }); setStatus((s) => ({ ...s, [r.id]: 'ok' })); setTimeout(() => setStatus((s) => ({ ...s, [r.id]: undefined })), 1500) }
    catch { setStatus((s) => ({ ...s, [r.id]: 'err' })) }
  }
  if (!rows) return <p className="admin-muted">Cargando…</p>
  return (
    <div>
      <p className="admin-muted">Existencias por producto (en kg o unidades según el producto). Déjalo vacío si no llevas inventario de ese producto.</p>
      <table className="admin-table">
        <thead><tr><th>Producto</th><th>Existencias</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          {rows.map((r) => {
            const bajo = r.stock != null && r.stock !== '' && Number(r.stock) <= 5
            return (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td><input className="ad-in ad-num" type="number" value={r.stock ?? ''} placeholder="—" onChange={(e) => setField(r.id, e.target.value)} /> <span className="ad-unit">{r.unit === 'kg' ? 'kg' : (r.unit_label || 'u')}</span></td>
                <td>{r.stock == null || r.stock === '' ? <span className="admin-muted">sin control</span> : bajo ? <span className="chip-low">bajo</span> : <span className="chip-ok">ok</span>}</td>
                <td><button className="ad-save" onClick={() => save(r)}>{status[r.id] === 'saving' ? '…' : status[r.id] === 'ok' ? '✓' : status[r.id] === 'err' ? '⚠' : 'Guardar'}</button></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/* ========================= Módulo: Promociones ========================= */
const PROMO_VACIA = { title: '', media_url: '', media_type: 'image', media_path: '', cta_href: '#cortes', active: true, sort: 0, starts_at: null, ends_at: null }
const toLocalInput = (iso) => {
  if (!iso) return ''
  const d = new Date(iso); const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}
const fromLocalInput = (v) => (v ? new Date(v).toISOString() : null)

function PromoMedia({ p, className }) {
  if (!p.media_url) return <div className={className + ' promo-prev-empty'}>Sin imagen o video</div>
  return p.media_type === 'video'
    ? <video className={className} src={p.media_url} muted loop playsInline autoPlay />
    : <img className={className} src={p.media_url} alt={p.title || 'Promoción'} />
}

function Promociones() {
  const [rows, setRows] = useState(null)
  const [status, setStatus] = useState({})
  const [upBusy, setUpBusy] = useState({})
  const [error, setError] = useState('')
  const [nueva, setNueva] = useState(PROMO_VACIA)
  const load = () => fetchAllPromos().then((d) => setRows(d || [])).catch(() => setError('No se pudieron cargar las promociones.'))
  useEffect(() => { load() }, [])
  const setField = (id, f, v) => setRows((rs) => rs.map((r) => r.id === id ? { ...r, [f]: v } : r))

  // Sube un archivo y asigna media_url/type/path a una fila existente o a "nueva".
  const subir = async (key, file, apply) => {
    if (!file) return
    if (file.size > 60 * 1024 * 1024) { alert('El archivo supera 60 MB. Usa una imagen o un reel más liviano.'); return }
    setUpBusy((s) => ({ ...s, [key]: true }))
    try {
      const { url, type, path } = await uploadPromoMedia(file)
      apply({ media_url: url, media_type: type, media_path: path }, path)
    } catch (e) {
      alert('No se pudo subir el archivo. Revisa que el bucket "promos" exista en Supabase Storage.')
    } finally { setUpBusy((s) => ({ ...s, [key]: false })) }
  }

  const save = async (r) => {
    if (!r.media_url) { alert('Sube una imagen o un video para esta promoción.'); return }
    setStatus((s) => ({ ...s, [r.id]: 'saving' }))
    try {
      await updatePromo(r.id, {
        title: r.title, media_url: r.media_url, media_type: r.media_type, media_path: r.media_path || null,
        cta_href: r.cta_href || null, active: r.active, sort: Number(r.sort) || 0,
        starts_at: r.starts_at || null, ends_at: r.ends_at || null,
      })
      setStatus((s) => ({ ...s, [r.id]: 'ok' })); setTimeout(() => setStatus((s) => ({ ...s, [r.id]: undefined })), 1500)
    } catch { setStatus((s) => ({ ...s, [r.id]: 'err' })) }
  }
  const add = async () => {
    if (!nueva.media_url) { alert('Primero sube la imagen o el video de la promoción.'); return }
    try {
      await insertPromo({ ...nueva, title: nueva.title.trim() || 'Promoción', sort: rows.length })
      setNueva(PROMO_VACIA); load()
    } catch { setError('No se pudo agregar la promoción.') }
  }
  const del = async (r) => {
    if (!confirm(`¿Eliminar la promoción "${r.title}"?`)) return
    try { await deletePromo(r.id); if (r.media_path) deletePromoMedia(r.media_path); load() }
    catch { setError('No se pudo eliminar.') }
  }

  if (error) return <p className="warn">{error}</p>
  if (!rows) return <p className="admin-muted">Cargando…</p>

  const Campos = (p, onChange, keyUpload) => (
    <div className="promo-form">
      <label className="field promo-f-wide"><span>Nombre (interno / texto alternativo)</span>
        <input className="ad-in" value={p.title || ''} placeholder="Combo asado de octubre" onChange={(e) => onChange({ title: e.target.value })} /></label>
      <label className="field promo-f-wide"><span>Al tocar el banner (opcional)</span>
        <input className="ad-in" value={p.cta_href || ''} placeholder="#cortes, /otros o https://… (déjalo vacío si no enlaza)" onChange={(e) => onChange({ cta_href: e.target.value })} /></label>
      <label className="field"><span>Mostrar desde (opcional)</span>
        <input className="ad-in" type="datetime-local" value={toLocalInput(p.starts_at)} onChange={(e) => onChange({ starts_at: fromLocalInput(e.target.value) })} /></label>
      <label className="field"><span>Mostrar hasta (opcional)</span>
        <input className="ad-in" type="datetime-local" value={toLocalInput(p.ends_at)} onChange={(e) => onChange({ ends_at: fromLocalInput(e.target.value) })} /></label>
    </div>
  )

  return (
    <div>
      <p className="admin-muted">Sube la <b>imagen</b> o el <b>reel (video)</b> ya diseñado de cada promoción; rotan solos en la página principal. Puedes programar desde/hasta para promos temporales. Recomendado: imagen <b>1200×440 px</b> (horizontal) en JPG/PNG o video MP4 corto (menos de 60 MB).</p>

      <div className="promo-admin-list">
        {rows.map((r) => (
          <div className="promo-admin-card" key={r.id}>
            <div className="promo-media-row">
              <PromoMedia p={r} className="promo-prev-media" />
              <label className={'promo-upload' + (upBusy[r.id] ? ' is-busy' : '')}>
                {upBusy[r.id] ? 'Subiendo…' : (r.media_url ? 'Cambiar imagen / video' : 'Subir imagen / video')}
                <input type="file" accept="image/*,video/*" hidden disabled={upBusy[r.id]}
                  onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; subir(r.id, f, (patch) => setRows((rs) => rs.map((x) => x.id === r.id ? { ...x, ...patch } : x))) }} />
              </label>
            </div>
            {Campos(r, (patch) => setRows((rs) => rs.map((x) => x.id === r.id ? { ...x, ...patch } : x)))}
            <div className="promo-admin-foot">
              <label className="promo-chk"><input type="checkbox" checked={!!r.active} onChange={(e) => setField(r.id, 'active', e.target.checked)} /> Activo</label>
              <label className="promo-chk promo-order"><span>Orden</span><input className="ad-in ad-num" type="number" value={r.sort ?? 0} onChange={(e) => setField(r.id, 'sort', e.target.value)} /></label>
              <span className="promo-foot-sp" />
              <button className="ad-save" onClick={() => save(r)}>{status[r.id] === 'saving' ? '…' : status[r.id] === 'ok' ? '✓ Guardado' : status[r.id] === 'err' ? '⚠ Error' : 'Guardar'}</button>
              <button className="ad-del" onClick={() => del(r)}>Eliminar</button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="admin-muted">Aún no hay promociones. Crea la primera abajo.</p>}
      </div>

      <div className="admin-add promo-nueva">
        <h4>Nueva promoción</h4>
        <div className="promo-media-row">
          <PromoMedia p={nueva} className="promo-prev-media" />
          <label className={'promo-upload' + (upBusy.new ? ' is-busy' : '')}>
            {upBusy.new ? 'Subiendo…' : (nueva.media_url ? 'Cambiar imagen / video' : 'Subir imagen / video')}
            <input type="file" accept="image/*,video/*" hidden disabled={upBusy.new}
              onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; subir('new', f, (patch) => setNueva((n) => ({ ...n, ...patch }))) }} />
          </label>
        </div>
        {Campos(nueva, (patch) => setNueva((n) => ({ ...n, ...patch })))}
        <button className="btn-primary ad-addbtn" onClick={add}>Agregar promoción</button>
      </div>
    </div>
  )
}

/* ========================= KPIs y barras ========================= */
function Kpi({ label, value, sub }) {
  return <div className="kpi"><span className="kpi-label">{label}</span><span className="kpi-value">{value}</span>{sub && <span className="kpi-sub">{sub}</span>}</div>
}
function Barras({ data, fmt = formatMoney }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className="barras">
      {data.map((d, i) => (
        <div className="barra-row" key={i}>
          <span className="barra-lbl">{d.label}</span>
          <span className="barra-track"><span className="barra-fill" style={{ width: (d.value / max * 100) + '%' }} /></span>
          <span className="barra-val">{fmt(d.value)}</span>
        </div>
      ))}
    </div>
  )
}

function useReporte(preset) {
  const [data, setData] = useState(null)
  useEffect(() => {
    let vivo = true; setData(null)
    const { from, to } = rangeFor(preset)
    Promise.all([fetchOrders({ from, to }), fetchAllProducts()]).then(([orders, products]) => {
      if (!vivo) return
      const costBySlug = {}; (products || []).forEach((p) => { costBySlug[p.slug] = p.cost || 0 })
      const activos = orders.filter((o) => o.status !== 'cancelado')
      const ventasProducto = activos.reduce((s, o) => s + (o.subtotal || 0), 0)
      const domicilios = activos.reduce((s, o) => s + (o.delivery_fee || 0), 0)
      const total = activos.reduce((s, o) => s + (o.total || 0), 0)
      const nPedidos = activos.length
      let costoVentas = 0
      const porProducto = {}; const porDia = {}
      activos.forEach((o) => {
        const dia = new Date(o.created_at).toISOString().slice(0, 10)
        porDia[dia] = (porDia[dia] || 0) + (o.total || 0)
        ;(o.order_items || []).forEach((it) => {
          const c = costBySlug[baseSlug(it.product_slug)] || 0
          costoVentas += c * itemQty(it)
          const k = it.product_name || it.product_slug
          if (!porProducto[k]) porProducto[k] = { qty: 0, total: 0 }
          porProducto[k].qty += itemQty(it); porProducto[k].total += (it.line_total || 0)
        })
      })
      const topProductos = Object.entries(porProducto).map(([label, v]) => ({ label, ...v })).sort((a, b) => b.total - a.total)
      const ventasDia = Object.entries(porDia).sort().map(([d, v]) => ({ label: fmtDia(d), value: v }))
      setData({ nPedidos, ventasProducto, domicilios, total, costoVentas, utilidad: ventasProducto - costoVentas, topProductos, ventasDia, activos })
    }).catch(() => vivo && setData({ error: true }))
    return () => { vivo = false }
  }, [preset])
  return data
}

/* ========================= Módulo: Informes ========================= */
function Informes() {
  const [preset, setPreset] = useState('30')
  const r = useReporte(preset)
  return (
    <div>
      <div className="mod-top"><RangoFiltro preset={preset} setPreset={setPreset} /></div>
      {!r ? <p className="admin-muted">Calculando…</p> : r.error ? <p className="warn">No se pudieron cargar los datos.</p> : (
        <>
          <div className="kpi-row">
            <Kpi label="Ventas" value={formatMoney(r.total)} />
            <Kpi label="Pedidos" value={r.nPedidos} />
            <Kpi label="Ticket promedio" value={formatMoney(r.nPedidos ? Math.round(r.total / r.nPedidos) : 0)} />
            <Kpi label="Domicilios" value={formatMoney(r.domicilios)} />
          </div>
          <h3 className="admin-sub">Ventas por día</h3>
          {r.ventasDia.length ? <Barras data={r.ventasDia} /> : <p className="admin-muted">Sin datos.</p>}
          <h3 className="admin-sub">Productos más vendidos</h3>
          {r.topProductos.length ? <Barras data={r.topProductos.slice(0, 8).map((p) => ({ label: p.label, value: p.total }))} /> : <p className="admin-muted">Sin datos.</p>}
        </>
      )}
    </div>
  )
}

/* ========================= Módulo: Contabilidad ========================= */
function Contabilidad() {
  const [preset, setPreset] = useState('mes')
  const r = useReporte(preset)
  const exportar = () => {
    if (!r || r.error) return
    const filas = [['Fecha', 'Cliente', 'Entrega', 'Estado', 'Subtotal', 'Domicilio', 'Total']]
    r.activos.forEach((o) => filas.push([fmtFecha(o.created_at), o.customer_name, o.delivery_type, o.status, o.subtotal, o.delivery_fee, o.total]))
    descargarCSV(`ventas-${preset}.csv`, filas)
  }
  const margen = r && r.ventasProducto ? Math.round(r.utilidad / r.ventasProducto * 100) : 0
  return (
    <div>
      <div className="mod-top">
        <RangoFiltro preset={preset} setPreset={setPreset} />
        <button className="od-btn" onClick={exportar}>Exportar CSV</button>
      </div>
      {!r ? <p className="admin-muted">Calculando…</p> : r.error ? <p className="warn">No se pudieron cargar los datos.</p> : (
        <>
          <div className="kpi-row">
            <Kpi label="Ventas producto" value={formatMoney(r.ventasProducto)} />
            <Kpi label="Costo de ventas" value={formatMoney(r.costoVentas)} sub="según costo por producto" />
            <Kpi label="Utilidad bruta" value={formatMoney(r.utilidad)} />
            <Kpi label="Margen" value={margen + '%'} />
          </div>
          <table className="admin-table cont-table">
            <tbody>
              <tr><td>Ventas de producto</td><td className="num">{formatMoney(r.ventasProducto)}</td></tr>
              <tr><td>+ Domicilios cobrados</td><td className="num">{formatMoney(r.domicilios)}</td></tr>
              <tr className="tr-strong"><td>= Total facturado</td><td className="num">{formatMoney(r.total)}</td></tr>
              <tr><td>− Costo de ventas</td><td className="num">{formatMoney(r.costoVentas)}</td></tr>
              <tr className="tr-strong"><td>= Utilidad bruta</td><td className="num">{formatMoney(r.utilidad)}</td></tr>
            </tbody>
          </table>
          <p className="admin-muted">La utilidad usa el <b>costo</b> que pones en cada producto (pestaña Productos). Si un producto no tiene costo, su costo cuenta como 0.</p>
        </>
      )}
    </div>
  )
}

/* ========================= Shell ========================= */
const TABS = [
  { k: 'pedidos', l: 'Pedidos', C: Pedidos },
  { k: 'productos', l: 'Productos', C: Productos },
  { k: 'promociones', l: 'Promociones', C: Promociones },
  { k: 'inventario', l: 'Inventario', C: Inventario },
  { k: 'informes', l: 'Informes', C: Informes },
  { k: 'contabilidad', l: 'Contabilidad', C: Contabilidad },
]
function Shell({ onLogout }) {
  const [tab, setTab] = useState('pedidos')
  const Active = (TABS.find((t) => t.k === tab) || TABS[0]).C
  return (
    <div className="admin-wrap admin-dash">
      <div className="admin-top">
        <h2>Administración · {CONFIG.brand.name}</h2>
        <button className="btn-ghost ad-logout" onClick={onLogout}>Cerrar sesión</button>
      </div>
      <div className="admin-layout">
        <nav className="admin-tabs" aria-label="Módulos">
          {TABS.map((t) => <button key={t.k} className={'admin-tab' + (tab === t.k ? ' active' : '')} onClick={() => setTab(t.k)}>{t.l}</button>)}
          <Link to="/" className="admin-tab admin-tab--exit">← Volver a la tienda</Link>
        </nav>
        <div className="admin-panel"><Active /></div>
      </div>
    </div>
  )
}

/* ========================= Root ========================= */
export default function Admin() {
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!hasSupabase) { setReady(true); return }
    getSession().then((s) => { setSession(s); setReady(true) })
    return onAuthChange((s) => setSession(s))
  }, [])
  if (!hasSupabase) return <SinBackend />
  if (!ready) return <div className="admin-wrap"><p className="admin-muted">Cargando…</p></div>
  if (!session) return <Login onDone={() => getSession().then(setSession)} />
  return <Shell onLogout={async () => { await adminSignOut(); setSession(null) }} />
}
