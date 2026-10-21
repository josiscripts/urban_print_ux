# Reorganización de navegación y pie de Urban Print

## Objetivo

Mantener intactos la identidad, el hero, la cabecera glass fija y el comportamiento actual, modificando solo la arquitectura de navegación, el buscador de escritorio y el pie.

## Cambios

- **Cabecera de escritorio:** distribuir logo, navegación y acciones en tres zonas estables. La navegación ocupará una zona central independiente, con separación adaptable según el ancho y sin colisiones.
- **Buscador de escritorio:** convertirlo en un control compacto que se expande dentro de una reserva fija del área derecha durante 300 ms; al cerrarse recuperará su estado compacto sin desplazar la navegación. Mantendrá resultados, teclado y rutas actuales.
- **Menú móvil/tablet:** dejar únicamente el logo, Inicio y las ocho categorías como enlaces directos del mismo nivel: Imprenta, Gran Formato, Textil, Merchandising, Eventos, Bodas, Sellos y Regalos. Eliminar por completo Catálogo, submenús de productos, Servicios y Empresa. Conservar favoritos y redes como acciones auxiliares, sin añadir navegación duplicada.
- **Pie:** crear seis bloques explícitos: Tienda, Servicios, Empresa, Contacto, Ayuda y Social / Legal. Ayuda dejará de estar dentro de Empresa. Se reutilizarán exclusivamente rutas existentes; los conceptos sin página propia apuntarán a la sección o página válida más cercana, sin crear páginas nuevas ni enlaces rotos.
- **Responsive:** seis columnas en pantallas amplias, distribución intermedia equilibrada y bloques apilados en móvil, conservando el estilo actual.

## Validación

- Comprobar apertura/cierre del buscador y resultados.
- Comprobar el menú móvil y todos sus destinos.
- Revisar ausencia de solapamientos y desbordamiento en 360, 390, 430, 768, 820, 1024, 1280, 1440 y 1920 px.
- Confirmar que hero, glassmorphism, navegación funcional y contenido no relacionado permanecen sin cambios.
