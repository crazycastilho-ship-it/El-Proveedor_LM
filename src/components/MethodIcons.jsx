// Íconos SVG de método de cocción sugerido para cada corte.
const LABELS = {
  guiso: 'Guiso / caldo',
  parrilla: 'Parrilla',
  sarten: 'Sartén',
  horno: 'Horno',
}

function Icon({ type }) {
  const common = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (type) {
    case 'guiso': // olla con vapor
      return (
        <svg {...common}><path d="M4 11h16v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z"/><path d="M3 11h18"/><path d="M9 7c0-1 .8-1.5.8-2.5M12 7c0-1 .8-1.5.8-2.5M15 7c0-1 .8-1.5.8-2.5"/></svg>
      )
    case 'parrilla': // parrilla
      return (
        <svg {...common}><rect x="4" y="4" width="16" height="9" rx="1.5"/><path d="M8 4v9M12 4v9M16 4v9M4 8h16"/><path d="M8 13l-1.5 6M16 13l1.5 6"/></svg>
      )
    case 'sarten': // sartén
      return (
        <svg {...common}><circle cx="10" cy="13" r="6"/><path d="M16 13h6"/></svg>
      )
    case 'horno': // horno
      return (
        <svg {...common}><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M4 9h16"/><path d="M8 6.5h.01M11 6.5h.01"/><rect x="7" y="12" width="10" height="5" rx="1"/></svg>
      )
    default:
      return null
  }
}

export default function MethodIcons({ methods = [], showLabels = false }) {
  return (
    <div className="methods" role="list" aria-label="Formas de preparación">
      {methods.map((m) => (
        <span className="method" role="listitem" title={LABELS[m]} key={m}>
          <Icon type={m} />
          {showLabels && <span className="method-label">{LABELS[m]}</span>}
        </span>
      ))}
    </div>
  )
}
