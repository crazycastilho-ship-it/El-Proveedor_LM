import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'

const CartContext = createContext(null)
const STORAGE_KEY = 'proveedorlm-cart-v2'

// Total de una línea. Soporta dos tipos de ítem:
//  - kind 'weight': se vende por peso -> pricePerKg * kg
//  - kind 'unit'  : se vende por unidad -> unitPrice * qty
export function lineTotal(i) {
  return Math.round(i.kind === 'unit' ? i.unitPrice * i.qty : i.pricePerKg * i.kg)
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'add': {
      const it = action.item
      const ex = state.find((i) => i.id === it.id)
      if (ex) {
        return state.map((i) => {
          if (i.id !== it.id) return i
          if (i.kind === 'unit') return { ...i, qty: i.qty + (it.qty || 1) }
          return { ...i, kg: Math.round((i.kg + (it.kg || 0)) * 1000) / 1000 }
        })
      }
      return [...state, it]
    }
    case 'setAmount':
      return state
        .map((i) =>
          i.id === action.id
            ? i.kind === 'unit'
              ? { ...i, qty: action.value }
              : { ...i, kg: action.value }
            : i
        )
        .filter((i) => (i.kind === 'unit' ? i.qty > 0 : i.kg > 0))
    case 'remove':
      return state.filter((i) => i.id !== action.id)
    case 'clear':
      return []
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const value = useMemo(
    () => ({
      items,
      subtotal: items.reduce((s, i) => s + lineTotal(i), 0),
      count: items.length,
      add: (item) => dispatch({ type: 'add', item }),
      setAmount: (id, value) => dispatch({ type: 'setAmount', id, value }),
      remove: (id) => dispatch({ type: 'remove', id }),
      clear: () => dispatch({ type: 'clear' }),
    }),
    [items]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}
