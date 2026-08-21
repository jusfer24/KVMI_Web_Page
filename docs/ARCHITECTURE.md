# KVMI Digital Gallery - Arquitectura del MVP (Vertical Slice)

Este documento adapta el flujo de referencia del requerimiento original
(USER -> WEB -> PRODUCT -> WOOCOMMERCE -> PAYMENT -> HOTEL DELIVERY -> CRM -> N8N -> AI)
al stack definido en CLAUDE.md. WooCommerce queda sustituido por un backend
transaccional propio en Django + SQL Server.

## Flujo adaptado

```text
USER
  -> WEB (Astro SSR + islas React, Tailwind CSS)
  -> PRODUCT (catalogo: datos locales en el MVP; API Django /api/products/ en integracion)
  -> DJANGO COMMERCE CORE (sustituye a WooCommerce: ordenes, items, personalizacion)
  -> PAYMENT (pasarela externa PCI-DSS; simulada en el MVP)
  -> HOTEL DELIVERY (modelo HotelDelivery en SQL Server + coordinacion con conserjeria)
  -> CRM (los datos de orden y huesped en SQL Server son la fuente del CRM)
  -> N8N (automatizacion: webhooks de Django disparan flujos de notificacion)
  -> AI (KVMI AI Concierge: motor de reglas hoy, LLM orquestado por Django manana)
```

## 1. Componentes y responsabilidades

| Capa | Tecnologia | Responsabilidad |
|---|---|---|
| Presentacion | Astro 7 (SSR/SSG, enrutamiento) | Paginas de la galeria, SEO, transiciones fluidas |
| Interactividad | React 19 (islas) | AI Concierge, personalizacion, checkout multi-paso |
| Estilos | Tailwind CSS 4 | Sistema de diseno con la cromatica corporativa KVMI |
| Commerce core | Django 5 (Python 3.12+) | Ordenes, items, hotel delivery, catalogo, admin |
| Persistencia | SQL Server (Fase 1) | Toda la data transaccional, usuarios y autenticacion |
| Automatizacion | n8n (self-hosted o cloud) | Notificaciones a conserjeria, correos, sincronizacion CRM |
| IA | Motor de reglas (MVP) -> Claude API (produccion) | Recomendacion orientada a conversion |

### Detalle del recorrido

1. **USER -> WEB**: el visitante entra a la galeria servida por Astro. Las
   paginas son estaticas/SSR (rapidas, indexables); solo los componentes que
   requieren estado (concierge, producto, checkout) hidratan React.
2. **WEB -> PRODUCT**: en el MVP el catalogo de 3 piezas vive en
   `src/lib/catalog.ts`. En integracion, Astro consulta `GET /api/products/`
   de Django, que lee SQL Server (tablas `catalog_collection`,
   `catalog_product`, `catalog_productimage`).
3. **PRODUCT -> DJANGO COMMERCE CORE**: al confirmar el checkout, el frontend
   envia `POST /api/orders/` con items, personalizacion (grabado,
   presentacion, acabado) y los datos de hotel delivery. Django crea la orden
   dentro de una transaccion atomica: la integridad referencial de SQL Server
   es la razon de ser de la Fase 1.
4. **-> PAYMENT**: el MVP simula el pago en el cliente. En produccion se
   integra una pasarela certificada PCI-DSS (Stripe, PayPhone o Datafast para
   Ecuador) via webhook: la orden pasa de `PENDING` a `PAID` cuando la
   pasarela confirma. Los datos de tarjeta nunca tocan nuestros servidores.
5. **-> HOTEL DELIVERY**: el modelo `orders.HotelDelivery` (uno a uno con la
   orden) almacena huesped, hotel, ciudad, fechas de estadia, telefono e
   instrucciones. Al confirmarse el pago la orden pasa a `SCHEDULED` y n8n
   notifica al equipo de entregas y a la conserjeria del hotel.
6. **-> CRM**: no se compra un CRM en el MVP. Las tablas de ordenes, huespedes
   y entregas en SQL Server son la fuente unica de verdad; el Django Admin
   actua como panel operativo. Cuando exista un CRM externo (HubSpot,
   Odoo CRM), n8n sincroniza contactos y ordenes hacia el.
7. **-> N8N**: Django emite webhooks (orden creada, pago confirmado, entrega
   programada). n8n orquesta: correo de confirmacion al huesped, aviso
   interno, recordatorio a conserjeria el dia de la entrega y alta del
   contacto en el CRM.
8. **-> AI**: el KVMI AI Concierge cierra el circulo. Hoy es un motor de
   intenciones (frontend en `Concierge.tsx`; espejo en backend
   `POST /api/concierge/` contra la tabla `catalog_productintent`). En
   produccion el endpoint de Django orquesta un LLM (Claude API) con el
   catalogo como contexto y el mismo contrato JSON, por lo que el frontend no
   cambia.

## 2. Costos: gratuito vs. pagado

**Gratuitos (open source / sin licencia):**
- Astro, React, Tailwind CSS, Django, mssql-django, n8n self-hosted.
- SQL Server Express (hasta 10 GB por base) o Developer Edition para
  desarrollo.

**Pagados (produccion):**
- Hosting: frontend estatico (Vercel/Netlify tienen capa gratuita; el SSR a
  escala puede requerir plan pagado), backend Django (VPS o servicio gestionado,
  desde ~5-20 USD/mes).
- SQL Server Standard si el volumen supera Express, o Azure SQL Database
  (desde ~5 USD/mes en tiers basicos).
- Pasarela de pago: comision por transaccion (tipicamente 2.9% - 4.5% + fijo).
- Claude API para el concierge: pago por token consumido.
- n8n Cloud si no se autohospeda (desde ~20 USD/mes); self-hosted es gratis.
- Dominio y certificados (Let's Encrypt gratuito; dominio ~15 USD/anio).

## 3. APIs del sistema

**Expuestas por Django (contrato actual):**
- `GET /api/products/` y `GET /api/products/<slug>/`: catalogo.
- `POST /api/orders/`: creacion transaccional de orden + hotel delivery.
- `POST /api/concierge/`: recomendacion del AI Concierge.
- `/admin/`: panel operativo (CRM interno del MVP).

**Consumidas (integracion futura):**
- API de la pasarela de pagos (checkout session + webhook de confirmacion).
- Claude API (Anthropic) para el concierge conversacional.
- Webhooks salientes hacia n8n para automatizacion y CRM.

## 4. Almacenamiento de datos (Fase 1)

Todo en **SQL Server**, con integridad referencial estricta:
- `catalog_*`: colecciones, productos, imagenes (rutas hacia
  `src/assets/images/` del frontend), palabras clave de intencion.
- `orders_order` / `orders_orderitem`: ordenes con snapshot de nombre y precio
  (el historial no muta si el catalogo cambia).
- `orders_hoteldelivery`: datos del servicio Deliver To My Hotel.
- `auth_*` / `django_*`: usuarios, sesiones y administracion de Django.

## 5. Realidad Aumentada y Fase 2 (MongoDB)

Segun CLAUDE.md, la Fase 2 incorpora MongoDB mediante `DATABASE_ROUTERS` de
Django, sin tocar el nucleo transaccional:

- **Distribucion de carga**: SQL Server conserva ordenes, pagos, usuarios y
  todo lo que exige ACID. MongoDB recibe el catalogo masivo (documentos
  flexibles por producto, variantes y contenido editorial multiidioma) y los
  recursos de alta velocidad.
- **AR**: los assets de realidad aumentada (modelos 3D en glTF/GLB y USDZ,
  texturas, anclas y metadatos de escena) se describen como documentos en
  MongoDB, referenciando binarios en almacenamiento de objetos. Un router de
  base de datos dirige los modelos `arcontent.*` a MongoDB y el resto a SQL
  Server.
- **Entrega al cliente**: en web, `model-viewer` o WebXR consumen un endpoint
  Django que lee MongoDB y sirve el modelo 3D del producto (ver la pieza sobre
  la mesa del huesped antes de comprar). Las experiencias inmersivas nativas
  (Unity) consumirian esa misma API.
- **Regla de oro**: ninguna transaccion de dinero pasa por MongoDB; toda
  conversion termina en SQL Server.

## 6. Estructura del repositorio

```text
src/                  Frontend Astro + React + Tailwind
  lib/catalog.ts      Catalogo demo (3 piezas) y helpers
  lib/cart.ts         Store del carrito (localStorage)
  components/react/   Islas: Concierge, ProductExperience, CheckoutFlow, CartBadge
  pages/              home, the-origin, collections, products/[slug],
                      el-ritual, exclusive-handicrafts, contact, checkout
backend/              Django 5 + SQL Server
  catalog/            Colecciones, productos, imagenes, intents
  orders/             Ordenes, items, hotel delivery
  concierge/          Endpoint de recomendacion del AI Concierge
docs/ARCHITECTURE.md  Este documento
```
