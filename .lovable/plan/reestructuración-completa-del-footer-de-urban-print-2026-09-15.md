# Reestructuración completa del footer de Urban Print

## Alcance

Modificar exclusivamente `SiteFooter`, sin tocar cabeceras, menús, catálogo, productos, rutas ni otras funciones.

## Implementación

- Crear una cabecera de pie con logo y descripción a la izquierda, y un CTA destacado “¿Tienes un proyecto?” enlazado a `/contacto` a la derecha.
- Sustituir las seis columnas actuales por cuatro grupos: Tienda, Servicios, Empresa y Ayuda.
- En Tienda, reutilizar las ocho categorías y destinos existentes (`CATEGORIAS`) con sus nombres visibles correctos, seguidas de un separador y Natur House como destino especial a `/naturhouse`.
- Mantener exclusivamente los cinco servicios reales ya presentes; retirar Blog de Empresa; conservar los destinos existentes de Ayuda.
- Separar Contacto y Síguenos de la navegación, conservando dirección, teléfono, dos correos, horario e iconos actuales.
- Crear una franja legal independiente con Aviso legal, Privacidad y Condiciones de venta. No se mostrará Cookies porque no existe una ruta válida y no se crearán páginas nuevas.
- Fijar el copyright solicitado para 2026 y mantener “Urban Print · Orihuela, Alicante”.

## Responsive y accesibilidad

- Desktop: cabecera en dos zonas, navegación en cuatro columnas, contacto y redes en una banda inferior.
- Tablet: navegación en una cuadrícula de dos columnas, sin comprimir el contenido.
- Móvil: logo, descripción y CTA visibles; cuatro acordeones cerrados inicialmente con indicadores +/− y transición de 200–250 ms; contacto, redes, legal y copyright siempre visibles.
- Mantener áreas táctiles amplias, foco visible, enlaces telefónicos y de correo, contraste y ausencia de desbordamiento horizontal.

## Validación

- Confirmar que solo cambió el footer y que el menú hamburguesa permanece intacto.
- Verificar contenido exacto de las cuatro secciones, ausencia de Blog, Cookies y nombres técnicos SVG.
- Probar acordeones, CTA, Natur House, contacto y redes.
- Revisar el footer en móvil, tablet y desktop, incluyendo pantallas bajas y ausencia de overflow horizontal.
