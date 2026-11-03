// ============================================================================
//  CONFIGURACIÓN DE LA TIENDA  —  edita SOLO este archivo para personalizar
// ============================================================================
// Aquí cambias el nombre, el logo, los datos de contacto, los domicilios y
// los pagos. No necesitas tocar el resto del código.

export const CONFIG = {
  // ---- Marca -------------------------------------------------------------
  brand: {
    name: 'El Proveedor_LM',
    tagline: 'Distribuidora de Carne de Cerdo al Mayor y al Detal',
    // LOGO: para usar tu propia imagen, pon el archivo en /public/icons/ y
    // escribe aquí la ruta, por ejemplo: logoSrc: '/icons/mi-logo.png'
    // Si lo dejas en null, se muestra el logo de texto de abajo.
    // Para QUITAR el logo por completo, pon showLogo: false.
    showLogo: true,
    logoSrc: '/icons/logo-proveedor-full.png',
    // Logo de texto (se usa cuando logoSrc es null): número grande + nombre.
    logoBadge: 'LM',
    // Para usar una IMAGEN en la insignia (en vez del "18"), pon la ruta aquí.
    // Déjalo en null para volver al número.
    logoBadgeImage: '/icons/logo-proveedor-badge.png',
    logoLine0: 'Distribuidora',
    logoLine1: 'El Proveedor_LM',
    logoLine2: 'desde 1990',
  },

  // ---- Crédito del desarrollador (pie de página) ------------------------
  // Marca de quién desarrolló la página. Para ocultarlo: show: false.
  credit: {
    show: true,
    text: 'Desarrollada por',
    name: 'Maxik-IA Technology',
    logo: '/maxikia.png',   // pon null para mostrar solo el texto
    url: '',                // enlace opcional (ej: 'https://maxik-ia.com')
  },

  // ---- Contacto y ubicación ---------------------------------------------
  contact: {
    // WhatsApp en formato internacional SIN "+", SIN espacios (Colombia: 57...)
    whatsapp: '573102518181',
    phoneDisplay: '+57 310 251 8181',
    phoneFixed: '+57 601 360 8253',   // teléfono fijo (opcional)
    address: 'Plaza de Paloquemao, Local 80-047A, Bogotá',
    hours: 'Lun a Sáb 5:00 a.m. – 5:00 p.m.',
    instagram: '',
  },

  // ---- Moneda y unidades -------------------------------------------------
  currency: {
    code: 'COP',
    locale: 'es-CO',
  },
  // 1 libra en Colombia = 500 g = 0.5 kg. Cambia si vendes en otra medida.
  libraEnKg: 0.5,

  // ---- Cerdo interactivo -------------------------------------------------
  // El cerdo se arma con piezas recortadas de tu despiece (una por corte) que
  // están en /public/piezas/ y se posicionan según src/data/pieces.json.
  // Tu imagen original queda en /public/despiece.png como referencia.
  // (No necesitas editar esto para el uso normal.)

  // ---- Domicilios --------------------------------------------------------
  delivery: {
    enablePickup: true,             // permitir recoger en tienda
    enableDelivery: true,           // permitir domicilio
    fee: 5000,                      // costo del domicilio (COP)
    freeOver: 120000,               // domicilio gratis desde este total (COP). 0 = nunca
    minOrder: 20000,                // pedido mínimo (COP)
    note: 'Despachamos al mayor y al detal. Confirmamos el tiempo de entrega por WhatsApp.',
    partnerName: '',
    partnerUrl: '',
  },

  // ---- Pagos -------------------------------------------------------------
  payment: {
    // Métodos que se ofrecen en el checkout.
    cashOnDelivery: true,           // pago contra entrega (efectivo/datáfono)
    // Pago en línea con Wompi (Bancolombia). Deja la llave vacía para ocultarlo.
    // Consíguela en https://comercios.wompi.co  (usa la llave pública pub_...)
    wompiPublicKey: '',             // ej: 'pub_test_xxxxxxxx'
    // Redondeo mínimo de Wompi: los montos van en centavos (COP * 100).
  },
}

// Colores de la marca (deben coincidir con las variables CSS de styles.css).
export const THEME = {
  smoke: '#f1ebdf',
  paper: '#26272e',
  paprika: '#cf9d1e',
  brass: '#8f7016',
}
