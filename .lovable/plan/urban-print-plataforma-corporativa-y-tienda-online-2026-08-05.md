# Urban Print — plataforma corporativa y tienda online

Aplicación web completa en React (TanStack Start) con Lovable Cloud: 17 secciones, catálogo íntegro de productos, carrito, checkout básico y área de cliente. Paleta corporativa negro / blanco / rojo. Imágenes: placeholders neutros con el color corporativo y el nombre del producto, listos para sustituir por fotos reales.

## Identidad visual

- Tokens en `src/styles.css`: negro estructural, blanco de fondo, rojo solo para CTA, avisos, subrayados de título y elementos destacados.
- Tipografía condensada/industrial para titulares y sans neutra para texto.
- Componentes base: cabecera con datos de contacto y buscador, megamenú de categorías, tarjeta de producto, sellos de confianza, footer corporativo.
- Totalmente responsive (móvil, tablet, escritorio) con rejillas seguras para cabeceras mixtas.

## Páginas públicas

1. `/` Inicio — barra de contacto, buscador en tiempo real, accesos a categorías, sellos (envíos nacionales, calidad 100%, pagos seguros), bloques destacados, reseñas de Ekaterina Maksimkina, Paloma Lorente y Rocío Roca Mora, footer.
2. `/diseno-grafico`
3. `/eventos-personalizados`
4. `/gran-formato`
5. `/imprenta`
6. `/impresion-textil`
7. `/merchandising`
8. `/regalos-personalizados`
9. `/invitaciones-de-boda`
10. `/naturhouse` — diseño diferenciado "Natur House · Nutrición y Dietética, temporada 2026/27".
11. `/empresa` — servicio integral en Orihuela, asesoramiento gratuito, precios justos, maquinaria de última generación, revisión gratuita de archivos.
12. `/contacto` — formulario validado, mapa embebido de Calle Comunidad Valenciana 2, 03300 Orihuela, teléfono +34 966 57 83 45, urbanprint.orihuela@gmail.com e info@urbanprint.es.

Tienda: `/tienda`, `/categoria/$slug`, `/producto/$slug`, `/carrito`, `/checkout`. Cada ruta pública con su propio `head()` (título, descripción, Open Graph).

## Área de cliente (protegida)

Bajo `/_authenticated`, con login por email/contraseña y Google:

- `/cuenta` Escritorio
- `/cuenta/pedidos` (nº, fecha, estado, importe, detalle y factura)
- `/cuenta/descargas`
- `/cuenta/direcciones` (envío y facturación, predeterminadas)
- `/cuenta/detalles` (nombre, apellidos, email, contraseña)
- `/auth` pública para acceso y registro

## Catálogo

Se cargan en base de datos, sin omisiones, el árbol completo:

- **Impresión** → Imprenta General (7), Gran Formato (14), Impresión Textil (9)
- **Merchandising** (15)
- **Regalos Personalizados** (22)
- **Eventos y Bodas** → Candy Bar (12), Bodas e Invitaciones (10)
- **Sellos** (9)
- **NT - Natural** como enlace externo en el menú

## Detalles técnicos

- Lovable Cloud: tablas `categories`, `products`, `profiles`, `addresses`, `orders`, `order_items`, `downloads`, `contact_messages`, `reviews`. RLS activa: lectura pública anónima de catálogo y reseñas; el resto acotado a `auth.uid()`. GRANTs explícitos por tabla.
- Semilla en la propia migración con todas las categorías y productos listados.
- Lecturas públicas mediante server functions con cliente publishable; datos de cuenta con `requireSupabaseAuth`.
- Carrito en cliente (persistido en almacenamiento local) y creación de pedido en servidor al confirmar. El cobro real con pasarela queda fuera de esta entrega: el pedido se registra como "pendiente de pago" y se puede activar Stripe/Paddle después.
- Formulario de contacto validado con Zod en cliente y servidor, guardado en `contact_messages`.
- Buscador sobre nombre y categoría de producto.
