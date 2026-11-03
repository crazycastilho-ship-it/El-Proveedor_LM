import { useEffect, useRef, useState } from 'react'
import { useRouter } from '../router'
import { fetchPromos } from '../lib/supabase'
import { PROMOS } from '../data/promos'

const IMG_MS = 6500       // duración de una imagen
const VIDEO_MAX_MS = 30000 // tope de seguridad por si un reel no dispara "ended"

export default function PromoBanner() {
  const { navigate } = useRouter()
  const [promos, setPromos] = useState(PROMOS)
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const [muted, setMuted] = useState(true)
  const vids = useRef({})
  const touchX = useRef(null)

  useEffect(() => {
    let vivo = true
    fetchPromos()
      .then((p) => { if (vivo && p && p.length) { setPromos(p); setI(0) } })
      .catch(() => {})
    return () => { vivo = false }
  }, [])

  const reduce =
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  const go = (n) => setI((n % promos.length + promos.length) % promos.length)
  const next = () => setI((n) => (n + 1) % promos.length)

  const hayVideo = promos.some((p) => p.media_type === 'video')

  // Reproduce el video activo, pausa los demás.
  useEffect(() => {
    Object.entries(vids.current).forEach(([idx, el]) => {
      if (!el) return
      const activo = Number(idx) === i
      el.muted = muted
      if (activo && !paused) {
        try { el.currentTime = 0; const pr = el.play(); if (pr && pr.catch) pr.catch(() => {}) } catch { /* noop */ }
      } else {
        try { el.pause() } catch { /* noop */ }
      }
    })
  }, [i, promos, paused, muted])

  // Avance automático (imágenes por tiempo; los reels avanzan al terminar, con tope).
  useEffect(() => {
    if (paused || reduce || promos.length <= 1) return
    const cur = promos[i]
    const ms = cur && cur.media_type === 'video' ? VIDEO_MAX_MS : IMG_MS
    const t = setTimeout(next, ms)
    return () => clearTimeout(t)
  }, [i, paused, reduce, promos])

  if (!promos.length) return null

  const onActivate = (e, href) => {
    if (!href) return
    if (href.startsWith('#')) {
      e.preventDefault()
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else if (href.startsWith('/')) {
      e.preventDefault()
      navigate(href)
    }
  }

  return (
    <section
      className="promo"
      aria-roledescription="carrusel"
      aria-label="Promociones"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX }}
      onTouchEnd={(e) => {
        if (touchX.current == null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 44) go(i + (dx < 0 ? 1 : -1))
        touchX.current = null
      }}
    >
      <div className="promo-stage">
        {promos.map((p, idx) => {
          const active = idx === i
          const isVideo = p.media_type === 'video'
          const media = isVideo ? (
            <video
              ref={(el) => { vids.current[idx] = el }}
              className="promo-media"
              src={p.media_url}
              muted={muted}
              loop={promos.length === 1}
              playsInline
              preload="metadata"
              onEnded={() => { if (active && promos.length > 1 && !paused) next() }}
            />
          ) : (
            <img
              className="promo-media"
              src={p.media_url}
              alt={p.title || 'Promoción'}
              loading={idx === 0 ? 'eager' : 'lazy'}
            />
          )
          const inner = (
            <>
              <span className="promo-bg" aria-hidden="true" style={isVideo ? undefined : { backgroundImage: `url(${p.media_url})` }} />
              {media}
            </>
          )
          return (
            <div key={p.id ?? idx} className={'promo-slide' + (active ? ' is-active' : '')} aria-hidden={active ? undefined : true}>
              {p.cta_href ? (
                <a
                  className="promo-link"
                  href={p.cta_href}
                  tabIndex={active ? 0 : -1}
                  aria-label={p.title || 'Ver promoción'}
                  onClick={(e) => onActivate(e, p.cta_href)}
                >
                  {inner}
                </a>
              ) : inner}
            </div>
          )
        })}

        {hayVideo && (
          <button
            type="button"
            className="promo-sound"
            aria-pressed={!muted}
            aria-label={muted ? 'Activar sonido' : 'Silenciar'}
            onClick={() => setMuted((m) => !m)}
          >
            {muted ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M18.5 5.5a9 9 0 0 1 0 13" /></svg>
            )}
          </button>
        )}
      </div>

      {promos.length > 1 && (
        <div className="promo-dots" role="tablist" aria-label="Elegir promoción">
          {promos.map((_, idx) => (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={idx === i}
              aria-label={`Promoción ${idx + 1} de ${promos.length}`}
              className={'promo-dot' + (idx === i ? ' is-active' : '')}
              onClick={() => go(idx)}
            />
          ))}
        </div>
      )}
    </section>
  )
}
