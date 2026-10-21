# Panel de Administración de Urban Print

## Fase 1 — Resultado de la auditoría

Lo que ya existe y se reutiliza:

- **Productos reales**: tabla `products` (id, slug, nombre, precio, descripción, destacado, categoría) y `categories` (8 líneas comerciales). Se leen mediante una función de servidor de catálogo. El panel usará estos mismos productos por su identificador real; no se duplica nada.
- **Ventas reales**: tablas `orders` y `order_items` (producto, precio unitario, cantidad, fecha, estado). Sirven para calcular ventas, costes y beneficios por producto, categoría y periodo.
- **Diseño y componentes**: ya hay biblioteca completa de tarjetas, tablas, pestañas, formularios, gráficos, panel lateral y hojas laterales, más los colores negro/blanco/rojo. El panel se construye con eso, sin estilos nuevos.
- **Cabecera y menú móvil**: se añade únicamente un acceso "Panel Admin"; no se toca nada más.

Lo que falta y hay que crear:

- No existe ningún dato económico: ni coste, ni referencia (SKU), ni IVA por producto, ni gastos, ni histórico. Tampoco existe zona administrativa.
- Los precios públicos actuales se tratan como **precio final con IVA**; el panel calcula el precio sin IVA a partir del tipo aplicable (21 % por defecto). Los precios públicos **no se modifican**.

Riesgo detectado: sin costes introducidos, todos los márgenes son desconocidos. El panel los marcará como "pendiente de configurar" en lugar de inventar cifras.

## Fase 2 — Datos nuevos (relacionados con los productos existentes)

Tablas nuevas, todas enlazadas al producto real por su identificador:

- **Ficha económica del producto**: referencia (SKU), tipo de IVA, y los costes unitarios de materiales, impresión, producción, mano de obra, embalaje, manipulación, envío asumido y otros. El coste total se calcula, no se escribe a mano.
- **Tramos por cantidad** (opcional por producto): cantidad mínima, cantidad máxima y coste unitario de ese tramo.
- **Histórico de costes**: producto, coste anterior, coste nuevo, fecha y motivo. Se registra en cada cambio; nunca se sobrescribe en silencio.
- **Gastos**: nombre, tipo (comisión de pago, comisión externa, envío asumido, descuento, publicidad, otros), valor, si es porcentaje o importe fijo, activo o no, y ámbito (global, por categoría o por producto). Así no se aplican todos los gastos a todos los productos.

Se deja preparado el espacio para stock y proveedores, pero no se construyen todavía.

## Fase 3 a 6 — Panel

Zona `/admin` independiente, con navegación propia y enlace "Volver a Urban Print":

- **Panel principal**: ventas, costes, beneficio bruto, margen bruto %, gastos, beneficio neto y margen neto %; más listas de productos más rentables, de menor margen y sin costes configurados, y evolución de costes y rentabilidad.
- **Productos**: listado de los productos reales con precio con IVA, sin IVA, coste total, beneficio y margen; ficha lateral para introducir referencia, IVA y cada coste, con el total y los márgenes recalculándose en vivo.
- **Costes**: entrada rápida de costes por producto, tramos por cantidad e histórico de cambios.
- **Gastos**: alta y edición de gastos con su ámbito de aplicación.
- **Rentabilidad**: por producto y por categoría, con filtros de periodo (hoy, 7 días, 30 días, este mes, mes anterior, este año, rango personalizado) y ranking ordenable por beneficio, margen, ventas o coste.
- **Calculadora**: simulador con producto, cantidad, precio, descuento, coste unitario y gastos; muestra venta total, coste total, beneficio y margen bruto y neto. No guarda nada.

Cálculos, en un único módulo compartido: precio sin IVA = precio con IVA ÷ (1 + IVA); coste total = suma de costes; beneficio bruto = precio sin IVA − coste total; margen bruto % sobre precio sin IVA; beneficio neto = beneficio bruto − gastos aplicables; margen neto % sobre precio sin IVA. Bruto y neto quedan siempre separados.

## Fase 7 y 8 — Comprobaciones

Composición propia para móvil (tarjetas apiladas, navegación administrativa en menú desplegable, tablas convertidas en fichas), tablet y escritorio con panel lateral. Se verifica de 320 px a 1920 px sin recortes ni desplazamiento horizontal, y que la tienda pública (inicio, catálogo, producto, carrito, pago, cuenta) sigue intacta.

## Nota

El panel queda **sin protección de acceso** en esta fase, tal como pediste: cualquiera con el enlace entra. Lo cerraremos cuando lo indiques.
