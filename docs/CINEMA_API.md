# API de cine: catálogo, sedes y programación

Prefijo: `/api/v1`. Swagger: `/api/docs`. El backend actual usa adaptadores en memoria para este catálogo: las escrituras son funcionales durante la ejecución local, pero **no persisten al reiniciar**. No hay reservas, pagos ni ventas de entradas de cine conectadas. Los títulos, cines y fechas de demostración no representan cartelera comercial confirmada.

## Casos de uso implementados

| Recurso | Público | Administración (`ADMIN`, JWT) |
| --- | --- | --- |
| Películas | `GET /movies` (búsqueda y género), `/movies/now-playing`, `/movies/upcoming`, `/movies/:slug`, `/movies/:slug/trailers`, `/movies/rankings/top-selling` | `GET,POST /admin/movies`; `GET,PATCH,DELETE /admin/movies/:slug`; `POST /admin/movies/:slug/publish`, `/unpublish` |
| Portada | `GET /banners`, `/advertisements`, `/promotions` | `PUT,DELETE /admin/movies/:slug/placements/:section` (`NOW_PLAYING`, `UPCOMING`) |
| Versiones | visibles en la ficha | `GET,POST /admin/movies/:slug/versions`; `DELETE /admin/movies/:slug/versions/:id` |
| Material | `GET /movies/:slug/trailers` | `GET,POST /admin/movies/:slug/assets`; `DELETE /admin/movies/:slug/assets/:id` |
| Cines | `GET /cinemas` (ciudad, país, distrito), `GET /cinemas/nearby?latitude=&longitude=`, `GET /cinemas/:slug`, `GET /cinemas/:slug/auditoriums` | `GET,POST /admin/cinemas`; `PATCH,DELETE /admin/cinemas/:slug`; `GET,POST /admin/cinemas/:slug/auditoriums` |
| Salas y butacas | `GET /auditoriums/:id/seats` (plano físico, no disponibilidad) | `PATCH,DELETE /admin/auditoriums/:id`; `POST /admin/auditoriums/:id/seats`; `DELETE /admin/auditoriums/:id/seats/:seatId` |
| Funciones | `GET /showtimes` (cine/película/fecha local), `GET /showtimes/:id`, `GET /showtimes/:id/availability`, `GET /cinemas/:slug/showtimes`, `GET /movies/:slug/showtimes`, `GET /movies/:slug/schedule` | `GET,POST /admin/showtimes`; `PATCH /admin/showtimes/:id`; `POST /admin/showtimes/:id/on-sale`, `/cancel` |
| Pago | `GET /payments/methods?countryCode=PE&channel=ONLINE` | `POST /payments/intents` (JWT, contrato bloqueado con 503 hasta integrar órdenes y pasarela) |
| Comprobantes | `GET /receipts/types` | `POST /receipts/requests` (JWT, contrato bloqueado con 503 hasta integrar emisión electrónica) |

Las listas paginadas de películas, cines y funciones usan `page`/`limit` con máximo 10 y devuelven `{data, meta}`. Las operaciones de administración no aceptan permisos de una sede: el rol `CINEMA_MANAGER` **no** tiene acceso global hasta implementar y probar alcance por `cinemaId`. El borrado de película/cine/sala es lógico (archivo/cierre/mantenimiento); se preserva historial. Una película publicada sólo aparece en `now-playing` o `upcoming` después de asignarle esa sección. Película y versión deben estar publicadas/compatibles con la sala para programar. Se rechazan solapamientos de la misma sala incluyendo el tiempo de limpieza; no se puede cerrar una sede, cambiar el aforo/plano o retirar una versión con funciones futuras activas.

El ranking `GET /movies/rankings/top-selling` responde `{ "status": "NO_SALES_DATA", "data": [], "calculatedAt": null }` hasta integrar `Ticket` pagado/reembolsado y `PaymentAttempt` capturado. `GET /showtimes/:id/availability` devuelve `NOT_CONNECTED` y `availableSeats: null`; `configuredSeats` es sólo el número físico de butacas. Mostrar un número de entradas libres sin reservas atómicas sería incorrecto.

## Flujo de cine cercano y horarios

1. El navegador solicita permiso de geolocalización; si se niega, el usuario elige cine manualmente. El servidor **no deduce la ubicación por IP**. `GET /cinemas/nearby?latitude=-12.109&longitude=-77.035` ordena sólo sedes activas con coordenadas registradas; devuelve `distanceKm` en línea recta y `distanceType=STRAIGHT_LINE`, no tiempo de viaje. Las sedes demo tienen direcciones provisionales y por eso no tienen coordenadas inventadas.
2. `GET /movies/{slug}/schedule?cinemaSlug={slug}` o `?latitude=...&longitude=...` devuelve los cinco días **consecutivos** desde hoy en la zona horaria del cine. Las coordenadas seleccionan el cine cercano que tenga funciones de la película, o el más cercano si ninguno la tiene. Si no hay sedes geocodificadas, devuelve `locationStatus=NO_GEOCODED_CINEMA` y la UI debe ofrecer selección manual. Filtros: `format`, `audioLanguage`, `days` (1–5).
3. Cada fecha agrupa horarios por formato, audio y subtítulos; cada función incluye `showtimeId`, hora local, precio y `bookable`. `seatAvailability=UNKNOWN` hasta que existan reservas transaccionales. El usuario elige un `showtimeId` antes del futuro mapa de butacas. El backend no rellena días sin funciones con horarios ficticios.

## Flujo de pago y comprobante preparado

1. `GET /payments/methods` clasifica tarjeta crédito/débito, prepago, Yape, PagoEfectivo y transferencia (online), efectivo o terminal (taquilla). Son **opciones previstas**, todas `NOT_CONFIGURED`; la disponibilidad real se consultará al proveedor según país/cuenta/contrato. `readyForCheckout=false` impide que el frontend muestre un pago activo.
2. Futuro flujo: seleccionar butacas → crear `BookingOrder` y reservar atómicamente con expiración → solicitar comprobante boleta/factura → `POST /payments/intents` con `Idempotency-Key` → tokenizar tarjeta sólo con SDK del proveedor (nunca enviar PAN/CVV a Cinetrux) → confirmar estado mediante webhook con firma y consulta al proveedor → marcar orden/entradas pagadas → emitir `FiscalReceipt` por SUNAT/OSE → entregar ticket y comprobante. PagoEfectivo/transferencia puede quedar pendiente; **no** se emite ticket como pagado por crear la intención.
3. Por ahora `POST /payments/intents` y `POST /receipts/requests` responden 503 sin efectos. La factura exige RUC de 11 dígitos. No se crea numeración tributaria ni se anuncia pago exitoso. En Prisma están preparados `BookingOrder`, `PaymentAttempt` (método, referencia externa, estado, idempotencia) y `FiscalReceipt` (tipo, comprador, estado y archivos); no hay migración aplicada.

## Próxima etapa para producción

1. Implementar repositorios Prisma para película, estreno regional, cine, sala, butaca y función; migración y seed de ambientes. La API y el esquema ya están preparados, no aplicados.
2. Definir idioma/país de publicación y derechos de exhibición: fechas de estreno/preventa por territorio (`MovieRelease`), clasificación por jurisdicción, zonas horarias, feriados y posibles excepciones por sede.
3. Añadir transacciones de reservas de butaca y pagos. Debe haber una restricción de unicidad para butacas activas por función, expiración de holds y reembolsos. Sólo entonces calcular disponibilidad y ranking por tickets pagados netos.
4. Añadir autorización por sede para gerentes/taquilla, auditoría de cambios, idempotencia de compras y publicación, subida/validación de multimedia, y fuente autorizada/licencias para pósteres y tráilers.
5. Acordar políticas comerciales: precio por formato/sede/franja, descuentos, accesibilidad, asiento acompañante, cancelación/reprogramación de funciones con entradas emitidas y política de notificaciones.

## Criterios usados

- Recursos, filtrado y paginación: [Microsoft REST API design](https://learn.microsoft.com/en-gb/azure/architecture/best-practices/api-design).
- Diferenciar pósteres, fondos, logos y video: [TMDB movie images](https://developer.themoviedb.org/reference/movie-images).
- Popularidad no equivale a venta de entradas: [TMDB popularity and trending](https://developer.themoviedb.org/docs/popularity-and-trending).
- Las reservas concurrentes requieren control transaccional: [Prisma transactions](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
- Ubicación web bajo permiso y contexto seguro: [MDN Permissions API](https://developer.mozilla.org/en-US/docs/Web/API/Permissions_API/Using_the_Permissions_API).
- Distancia vial requiere cálculo de ruta adicional; las coordenadas solas no bastan: [Google Routes API](https://developers.google.com/maps/documentation/routes/).
- Medios de pago peruanos y su disponibilidad dependen de la cuenta/proveedor: [Mercado Pago: medios de pago](https://www.mercadopago.com.pe/developers/es/docs/sales-processing/payment-methods).
- Pagos requieren idempotencia y notificaciones verificadas: [Mercado Pago: idempotencia](https://www.mercadopago.com.pe/developers/es/news/2023/01/04/Idempotency-key-usage-will-be-mandatory), [webhooks](https://www.mercadopago.com.pe/developers/en/docs/checkout-pro-orders/resources/notifications/webhooks).
- Boleta para consumidor final y factura a adquirente con RUC: [SUNAT: tipos de comprobante](https://cpe.sunat.gob.pe/informacion_general/tipos_comprobantes_pago).
- Referencia del orden cine → película → función y consulta de boleta: [Cinemark Perú: proceso de compra](https://preguntas.cinemark-peru.com/hc/es-mx/articles/360021588634--D%C3%B3nde-encuentro-las-promociones-en-sitio-web), [Cinemark Perú: cines](https://www.cinemark-peru.com/cines).

Estas referencias orientan el diseño, no suministran datos comerciales para Cinetrux.
