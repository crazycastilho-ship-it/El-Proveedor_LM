import { CONFIG } from '../config'

// Logo controlado 100% desde src/config.js:
//   showLogo: false        -> no se muestra nada
//   logoSrc: '/icons/x.png'-> muestra tu imagen
//   (por defecto)          -> logo de texto con la insignia "18"
export default function Logo() {
  const { showLogo, logoSrc, logoBadge, logoBadgeImage, logoLine0, logoLine1, logoLine2 } = CONFIG.brand
  if (!showLogo) return <span className="brand-fallback">{CONFIG.brand.name}</span>

  if (logoSrc) {
    return <img className="logo-img" src={logoSrc} alt={CONFIG.brand.name} />
  }

  return (
    <span className="logo">
      {logoBadgeImage ? (
        <img className="logo-badge-img" src={logoBadgeImage} alt="" aria-hidden="true" />
      ) : (
        <span className="logo-badge" aria-hidden="true">{logoBadge}</span>
      )}
      <span className="logo-text">
        {logoLine0 && <span className="logo-l0">{logoLine0}</span>}
        <span className="logo-l1">{logoLine1}</span>
        <span className="logo-l2">{logoLine2}</span>
      </span>
    </span>
  )
}
