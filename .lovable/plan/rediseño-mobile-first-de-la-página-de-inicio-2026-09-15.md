# Rediseño mobile-first de la página de inicio

## Objetivo

Crear una experiencia móvil inmersiva y premium en negro, blanco y rojo, manteniendo intacta la versión de escritorio desde 1280 px y sin cambiar rutas ni lógica de tienda.

## Cambios

- Superponer la cabecera móvil sobre el hero únicamente en la portada, con fondo transparente/semitransparente, logo, búsqueda, carrito con contador y menú.
- Sustituir el hero móvil/tablet actual por una portada de ancho completo y aproximadamente `100svh`, usando la fotografía del taller a pantalla completa, recorte `cover`, degradado oscuro y contenido en la zona media-baja.
- Mantener el texto solicitado y colocar los dos botones en vertical con áreas táctiles amplias.
- Tras el hero, mostrar una banda compacta de cuatro beneficios: Entrega rápida, Diseño incluido, Calidad garantizada y Envíos península y Baleares.
- Conservar el orden natural de Categorías, Productos destacados, Opiniones, Preguntas frecuentes, llamada final y pie.
- Convertir las categorías en carrusel horizontal táctil en móvil; mantener productos y opiniones navegables mediante deslizamiento.
- Compactar el pie en una composición móvil apilada, sin alterar su contenido ni la disposición de escritorio.

## Verificación

- Revisar 360, 390, 430, 768, 820, 1024 y 1280 px.
- Confirmar que el primer viewport solo muestra la experiencia hero, sin espacios laterales, recortes de texto, solapamientos ni desplazamiento horizontal.
- Comprobar búsqueda, carrito, menú, enlaces, carruseles y botones.

## Detalles técnicos

- Aplicar los cambios móviles con variantes inferiores a `xl`; el diseño de escritorio seguirá activo desde 1280 px.
- Reutilizar la fotografía, el logo, los componentes de botones, el drawer y los datos actuales.
- Usar exclusivamente los tokens visuales existentes y conservar la identidad Urban Print.
