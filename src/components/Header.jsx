import Logo from './Logo'
import { Link, useRouter } from '../router'
import { useCart } from '../store/cart'
import { formatMoney } from '../lib/format'

export default function Header({ onOpenCart, hideCart, hideNav }) {
  const cart = useCart()
  const { path } = useRouter()
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to="/"><Logo /></Link>

        {!hideNav && (
          <nav className="nav" aria-label="Secciones">
            <Link to="/" className={'nav-link' + (path === '/' ? ' active' : '')}>El cerdo</Link>
            <Link to="/otros" className={'nav-link' + (path.startsWith('/otros') ? ' active' : '')}>Otros productos</Link>
          </nav>
        )}
        {hideNav && (
          <span className="admin-flag">Panel de administración</span>
        )}

        {!hideCart && (
          <button className="cart-btn" onClick={onOpenCart} aria-label="Abrir carrito">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 4h2l2.2 12.4a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 8H6" />
              <circle cx="9.5" cy="21" r="1.2" /><circle cx="17.5" cy="21" r="1.2" />
            </svg>
            {cart.count > 0 && <span className="cart-count">{cart.count}</span>}
            {cart.subtotal > 0 && <span className="cart-amount">{formatMoney(cart.subtotal)}</span>}
          </button>
        )}
      </div>
    </header>
  )
}
