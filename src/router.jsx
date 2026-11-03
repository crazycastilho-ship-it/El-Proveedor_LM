import { createContext, useContext, useState, useEffect, useCallback } from 'react'

// Enrutador mínimo basado en rutas (sin librerías extra). Funciona con el
// fallback SPA de Cloudflare (public/_redirects).
const RouterCtx = createContext(null)

export function RouterProvider({ children }) {
  const [path, setPath] = useState(window.location.pathname)

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const navigate = useCallback((to) => {
    if (to !== window.location.pathname) {
      window.history.pushState({}, '', to)
      setPath(to)
    }
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [])

  return <RouterCtx.Provider value={{ path, navigate }}>{children}</RouterCtx.Provider>
}

export function useRouter() {
  const ctx = useContext(RouterCtx)
  if (!ctx) throw new Error('useRouter debe usarse dentro de RouterProvider')
  return ctx
}

export function Link({ to, children, className, ...rest }) {
  const { navigate } = useRouter()
  return (
    <a
      href={to}
      className={className}
      onClick={(e) => {
        e.preventDefault()
        navigate(to)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
