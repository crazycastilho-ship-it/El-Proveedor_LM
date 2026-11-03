# 🐷 Fonti Cerdo de la 18

PWA (aplicación web instalable) para una carnicería de cerdo. El cliente **toca la parte del cerdo** que quiere, elige la cantidad en **libras o kilos**, arma su carrito y hace el pedido con **domicilio o recogida en tienda**. Los pedidos salen por **WhatsApp** y, opcionalmente, se guardan en **Supabase** y se cobran en línea con **Wompi**.

Hecho con **Vite + React**. Funciona sin backend (modo local) y también conectado a Supabase.

---

## 🚀 Empezar en tu computador

Necesitas [Node.js 18+](https://nodejs.org).

```bash
npm install      # instala dependencias
npm run dev      # abre el modo desarrollo (http://localhost:5173)
npm run build    # genera la carpeta dist/ lista para publicar
npm run preview  # revisa el build localmente
```

La app funciona de una vez, **sin configurar nada**: los cortes salen de `src/data/cortes.js` y los pedidos se envían por WhatsApp.

---

## ✏️ Personalizar (todo en un solo archivo)

Abre **`src/config.js`**. Ahí cambias, sin tocar el resto del código:

| Qué | Dónde |
|-----|-------|
| Nombre y eslogan | `brand.name`, `brand.tagline` |
| **Logo** (ver abajo) | `brand.showLogo`, `brand.logoSrc`, `brand.logoBadge` |
| WhatsApp de la tienda | `contact.whatsapp` (formato `57300...`, sin `+`) |
| Dirección y horario | `contact.address`, `contact.hours` |
| Costo del domicilio, mínimo, gratis desde | `delivery.*` |
| Pago contra entrega / en línea | `payment.*` |

### El logo (modificable o removible)

- **Quitarlo:** pon `showLogo: false`.
- **Usar tu imagen:** guarda el archivo en `public/icons/` y escribe la ruta, por ejemplo:
  ```js
  logoSrc: '/icons/mi-logo.png',
  ```
- **Logo de texto (por defecto):** deja `logoSrc: null` y edita la insignia y el nombre:
  ```js
  logoBadge: '18',
  logoLine1: 'Fonti Cerdo',
  logoLine2: 'de la 18',
  ```

### Precios y cortes

- Sin Supabase: edita `src/data/cortes.js` (campo `pricePerKg` en pesos).
- Con Supabase: edita los precios en la tabla `products` (ver `DEPLOY.md`).

> La conversión **1 libra = 0.5 kg** se controla en `config.js` → `libraEnKg`.

### El cerdo interactivo (piezas)

El cerdo está **armado con piezas**: cada corte es su propia imagen, recortada
de tu despiece original, y se ubica para reconstruir el cerdo. Al pasar el mouse
o tocar, la pieza se **separa y se resalta**; al hacer clic, abre el pedido.

- Las piezas están en `public/piezas/<corte>.png` (una por corte, con fondo transparente).
- Su posición y tamaño están en `src/data/pieces.json` (en % relativos al cerdo). Normalmente **no necesitas tocar nada aquí**.
- Tu imagen original queda guardada en `public/despiece.png` como referencia.

Para **ajustar la separación** de las piezas al resaltar, cambia el valor `off`
en `src/components/PigDiagram.jsx`. Para cambiar el color del borde de resaltado,
edita `.piece.on` en `src/styles.css`.

> Si algún día quieres usar OTRO despiece, hay que volver a recortar las piezas
> de la nueva imagen (es un paso de edición de imagen). Escríbeme y te paso el
> procedimiento; para el día a día solo edita precios y datos en `config.js`.

---

## 💳 Pagos

- **WhatsApp (siempre activo):** al confirmar, se abre WhatsApp con el resumen del pedido hacia el número de la tienda. No requiere backend.
- **Contra entrega:** efectivo o datáfono al recibir. Se activa con `payment.cashOnDelivery`.
- **Wompi (opcional, Colombia):** pon tu llave pública `pub_...` en `payment.wompiPublicKey`. Aparece el botón de pago en línea que redirige al checkout de Wompi. Para confirmar automáticamente el pago necesitarás un webhook (ver notas en `DEPLOY.md`).

---

## 🗄️ Supabase (opcional)

Si conectas Supabase, los cortes/precios se cargan desde la base de datos y **cada pedido queda guardado**. Si no lo conectas, todo sigue funcionando en modo local.

Los pasos están en **`DEPLOY.md`**.

---

## 📁 Estructura

```
src/
  config.js            ← configuración (edita aquí)
  data/cortes.js       ← cortes + geometría del cerdo
  components/
    PigDiagram.jsx     ← el cerdo interactivo (SVG)
    CutDrawer.jsx      ← elegir cantidad (libras/kg)
    CartDrawer.jsx     ← carrito + checkout + pago
    Header/Footer/Logo/MethodIcons
  lib/
    supabase.js        ← base de datos (opcional)
    payments.js        ← WhatsApp + Wompi
    format.js          ← moneda y conversiones
supabase/
  schema.sql           ← tablas + seguridad
  seed.sql             ← cortes iniciales
```

---

## 📱 PWA

Se puede **instalar** en el celular (“Agregar a pantalla de inicio”) y abre en pantalla completa. Funciona offline para navegar el catálogo. Los íconos están en `public/icons/` (puedes reemplazarlos por los tuyos manteniendo los nombres).
