# Adaptación específica de cabecera, hero y beneficios

## Objetivo

Conservar intacta la composición de escritorio desde 1280 px y crear composiciones propias para tablet (768–1024 px) y móvil (hasta 767 px), sin cambiar contenido, rutas ni lógica comercial.

## Cambios

- **Cabecera tablet:** logo a la izquierda; acciones de búsqueda, favoritos, carrito y menú a la derecha; búsqueda desplegable desde el icono; sin navegación horizontal.
- **Cabecera móvil:** logo compacto; búsqueda, carrito y menú; favoritos ocultos solo en la barra, pero accesibles dentro del menú lateral.
- **Menú lateral:** convertir el menú pequeño actual en un drawer lateral con Inicio, las ocho categorías y todos sus subniveles y enlaces actuales; mantener servicios, contacto, cuenta, favoritos, redes y NT - Natural.
- **Hero tablet:** fotografía a sangre como fondo, overlay oscuro y contenido superpuesto; botones horizontales cuando quepan; encuadre específico para 768–1024 px.
- **Hero móvil:** composición vertical propia sobre fotografía de fondo, título sin cortes, botones apilados de ancho controlado y encuadre específico para 360–430 px.
- **Beneficios:** cuadrícula 2×2 compacta en tablet y móvil, conservando iconos y textos; escritorio permanece en una fila de cuatro.

## Verificación

- Revisar visualmente 360×844, 390×844, 430×932, 768×1024, 820×1180, 1024×768 y 1280×900.
- Comprobar en cada tamaño: ancho del documento, recortes de texto, botones, encuadre de imagen, drawer, búsqueda, contador del carrito y ausencia de solapamientos.
- Confirmar que el diseño de 1280 px en adelante no cambia y que la compilación queda limpia.

## Detalles técnicos

- Reutilizar `Logo`, `Button`, datos de categorías, búsqueda, favoritos y carrito existentes.
- Aplicar cambios solo en la cabecera global, el hero y la franja de beneficios.
- Mantener el breakpoint de escritorio en `xl` (1280 px) y separar reglas móviles/tablet mediante utilidades responsivas y estilos de fondo dedicados.
