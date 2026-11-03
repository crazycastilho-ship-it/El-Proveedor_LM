# 🚀 Publicar Fonti Cerdo de la 18

Tres pasos: **GitHub** (guardar el código) → **Cloudflare Pages** (publicar la web) → **Supabase** (base de datos, opcional).

---

## 1) GitHub

1. Crea una cuenta en [github.com](https://github.com) y un repositorio nuevo (por ejemplo `fonti-cerdo-18`), vacío.
2. En tu computador, dentro de la carpeta del proyecto:

```bash
git init
git add .
git commit -m "Fonti Cerdo de la 18"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/fonti-cerdo-18.git
git push -u origin main
```

> El archivo `.gitignore` ya evita subir `node_modules` y `.env`.

---

## 2) Cloudflare Pages

1. Entra a [dash.cloudflare.com](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Elige tu repositorio `fonti-cerdo-18`.
3. Configura el build:

| Campo | Valor |
|-------|-------|
| **Framework preset** | `Vite` |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |

4. (Opcional, solo si usas Supabase) en **Environment variables** agrega:

```
VITE_SUPABASE_URL      = https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOi...   (la llave "anon public")
```

5. **Save and Deploy**. En 1–2 minutos tendrás una URL `https://fonti-cerdo-18.pages.dev`.
6. Cada vez que hagas `git push`, Cloudflare vuelve a publicar solo.

> El archivo `public/_redirects` ya está incluido para que la app (SPA) funcione en cualquier ruta.

### Dominio propio (opcional)
En el proyecto de Pages → **Custom domains** → agrega tu dominio (p. ej. `fonticerdo18.com`) y sigue las instrucciones de DNS.

---

## 3) Supabase (opcional pero recomendado)

Sirve para **guardar los pedidos** y administrar precios desde una base de datos.

1. Crea un proyecto en [supabase.com](https://supabase.com) (plan gratis alcanza de sobra).
2. Ve a **SQL Editor → New query**, pega el contenido de **`supabase/schema.sql`** y ejecútalo (crea tablas + seguridad).
3. Repite con **`supabase/seed.sql`** (carga los 12 cortes con precios).
4. Ve a **Project Settings → API** y copia:
   - **Project URL** → variable `VITE_SUPABASE_URL`
   - **anon public key** → variable `VITE_SUPABASE_ANON_KEY`
5. Pega esas variables en Cloudflare Pages (paso 2.4) y vuelve a desplegar.

### ¿Dónde veo los pedidos?
En Supabase → **Table editor → orders** (y `order_items` para el detalle). Puedes cambiar el `status` de cada pedido (`nuevo`, `preparando`, `enviado`, `entregado`).

### Cambiar precios
En **Table editor → products**, edita la columna `price_per_kg`. Los cambios se reflejan en la web al recargar.

---

## 4) Pago en línea con Wompi (opcional)

1. Crea tu comercio en [comercios.wompi.co](https://comercios.wompi.co).
2. Copia tu **llave pública** (`pub_prod_...` o `pub_test_...`).
3. Pégala en `src/config.js` → `payment.wompiPublicKey`, haz `git push` y Cloudflare redepliega.
4. Aparecerá la opción **“Pagar en línea (Wompi)”** en el checkout.

> **Importante:** para marcar un pedido como *pagado* automáticamente necesitas un **webhook** (un pequeño backend que reciba la confirmación de Wompi). Se puede hacer con una **Supabase Edge Function**. Mientras tanto, el pago en línea funciona y puedes verificarlo en el panel de Wompi.

---

## ✅ Checklist rápido

- [ ] Edité `src/config.js` (WhatsApp, dirección, logo, precios de domicilio).
- [ ] Revisé precios en `cortes.js` o en Supabase.
- [ ] Subí el código a GitHub.
- [ ] Conecté el repo en Cloudflare Pages (build `npm run build`, salida `dist`).
- [ ] (Opcional) Ejecuté `schema.sql` y `seed.sql` en Supabase y puse las variables.
- [ ] Abrí la URL en el celular y probé un pedido de prueba por WhatsApp.
