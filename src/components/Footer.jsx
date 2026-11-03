import { CONFIG } from '../config'

export default function Footer() {
  const { brand, contact, credit } = CONFIG
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <p className="foot-name">{brand.name}</p>
          <p className="foot-tag">{brand.tagline}</p>
        </div>
        <ul className="foot-contact">
          <li>{contact.address}</li>
          <li>{contact.hours}</li>
          <li>
            <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noreferrer">
              WhatsApp {contact.phoneDisplay}
            </a>
          </li>
          {contact.phoneFixed && <li>Tel. fijo {contact.phoneFixed}</li>}
          {contact.instagram && <li>{contact.instagram}</li>}
          {CONFIG.delivery.partnerUrl && (
            <li><a href={CONFIG.delivery.partnerUrl} target="_blank" rel="noreferrer">Domicilios: {CONFIG.delivery.partnerName}</a></li>
          )}
        </ul>
      </div>

      {credit?.show && (
        <div className="credit">
          <span className="credit-text">{credit.text}</span>
          {credit.url ? (
            <a className="credit-brand" href={credit.url} target="_blank" rel="noreferrer">
              {credit.logo && <img src={credit.logo} alt={credit.name} />}
              <span>{credit.name}</span>
            </a>
          ) : (
            <span className="credit-brand">
              {credit.logo && <img src={credit.logo} alt={credit.name} />}
              <span>{credit.name}</span>
            </span>
          )}
        </div>
      )}

      <p className="foot-legal">© {new Date().getFullYear()} {brand.name}. Precios sujetos a cambio.</p>
    </footer>
  )
}
