# Hero exclusivo para móvil y tablet

## Objetivo

Crear una composición independiente hasta 1279 px, manteniendo sin cambios el hero y los beneficios actuales de escritorio.

## Cambios

- Mantener la cabecera existente sin cambios.
- Crear un bloque móvil/tablet independiente con:
  - fotografía protagonista superior en formato aproximado 4:5, esquinas de 16–20 px y degradado inferior sutil;
  - badge “ORIHUELA” sobre la zona baja de la imagen;
  - titular de dos líneas “Impresión que” / “vende más”, con la segunda línea en rojo;
  - texto “Gran formato · Textil · Merchandising”;
  - botones “Ver catálogo” y “Pedir presupuesto” a ancho completo;
  - banda compacta con Entrega rápida, Diseño incluido y +500 proyectos.
- Usar exactamente la misma estructura para móvil y tablet, variando únicamente anchos y tipografía.
- Mostrar el hero actual únicamente desde 1280 px, sin alterar su composición.

## Verificación

Comprobar visualmente 360, 390, 430, 768, 820, 1024 y 1280 px: sin desbordamiento horizontal, texto cortado, solapamientos ni exceso de altura.

## Detalles técnicos

- Reutilizar la imagen temporal existente, las rutas actuales y los componentes `Button` y `Link`.
- Aplicar únicamente tokens semánticos existentes y clases responsive de Tailwind.
- Mantener intactos catálogo, navegación, carrito, favoritos y el resto del Home.
