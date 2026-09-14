/** Grupo (familia) dentro del mega menú de una categoría principal. */
export type NavGrupo = {
  /** Título visible de la familia. */
  titulo: string;
  /** Slug de la subcategoría real del catálogo (sus productos se listan aquí). */
  categoria?: string;
  /** Slugs de productos relacionados que pertenecen a otra categoría principal. */
  extras?: string[];
};

export type NavItem = {
  name: string;
  slug: string;
  descripcion: string;
  grupos: NavGrupo[];
};

/**
 * Arquitectura de navegación: 8 líneas comerciales independientes.
 * Cada grupo se corresponde con una subcategoría real del catálogo.
 */
export const CATEGORIAS: NavItem[] = [
  {
    name: "Imprenta",
    slug: "imprenta",
    descripcion: "Impresión comercial, papelería y material impreso para tu negocio.",
    grupos: [
      { titulo: "Papelería y productos impresos", categoria: "imprenta-papeleria" },
      { titulo: "Material promocional", categoria: "imprenta-material-promocional" },
      { titulo: "Productos corporativos impresos", categoria: "imprenta-corporativos" },
    ],
  },
  {
    name: "Gran Formato",
    slug: "gran-formato",
    descripcion: "Displays, rotulación y soportes publicitarios de gran tamaño.",
    grupos: [
      { titulo: "Lonas y soportes", categoria: "gf-lonas-soportes" },
      { titulo: "Displays y eventos", categoria: "gf-displays" },
      { titulo: "Publicidad exterior", categoria: "gf-publicidad-exterior" },
      { titulo: "Rotulación", categoria: "gf-rotulacion" },
      { titulo: "Adhesivos", categoria: "gf-adhesivos" },
    ],
  },
  {
    name: "Textil",
    slug: "impresion-textil",
    descripcion: "Personalización textil con bordado, serigrafía, vinilo y sublimación.",
    grupos: [
      { titulo: "Personalización", categoria: "textil-personalizacion" },
      { titulo: "Técnicas de impresión", categoria: "textil-tecnicas" },
      { titulo: "Ropa profesional y deportiva", categoria: "textil-profesional" },
    ],
  },
  {
    name: "Merchandising",
    slug: "merchandising",
    descripcion: "Artículos promocionales y corporativos personalizados con tu marca.",
    grupos: [
      { titulo: "Oficina", categoria: "merch-oficina", extras: ["agenda"] },
      { titulo: "Bebidas", categoria: "merch-bebidas" },
      { titulo: "Textil promocional", categoria: "merch-textil" },
      {
        titulo: "Promoción y publicidad",
        extras: [
          "tarjetas-de-visita",
          "cartel-individual",
          "cartel-de-primera-visita",
          "carteles-promocion-12-unidades",
        ],
      },
      { titulo: "Packs", extras: ["pack-especial", "pack-promocional"] },
    ],
  },
  {
    name: "Eventos",
    slug: "eventos",
    descripcion: "Candy Bar, comuniones, bautizos, despedidas y eventos personalizados.",
    grupos: [
      { titulo: "Candy Bar", categoria: "eventos-candy-bar" },
      { titulo: "Celebraciones", categoria: "eventos-celebraciones" },
      { titulo: "Eventos personalizados", categoria: "eventos-personalizados" },
      { titulo: "Despedidas", categoria: "eventos-despedidas" },
    ],
  },
  {
    name: "Bodas",
    slug: "bodas",
    descripcion: "Invitaciones, papelería, decoración y detalles para invitados.",
    grupos: [
      { titulo: "Invitaciones", categoria: "bodas-invitaciones" },
      {
        titulo: "Papelería de boda",
        categoria: "bodas-papeleria",
        extras: ["numeros-troquelados-con-fotos"],
      },
      {
        titulo: "Decoración de boda",
        categoria: "bodas-decoracion",
        extras: ["laminas-enmarcadas", "lienzos-personalizados", "lienzo-firmas", "lienzo-huellas"],
      },
      {
        titulo: "Detalles para invitados",
        extras: ["panuelo-boda", "libro-firmas-personalizado", "recuerdo-evento-marcapaginas", "pegatinas-eventos"],
      },
    ],
  },
  {
    name: "Sellos",
    slug: "sellos",
    descripcion: "Sellos automáticos, fechadores, cuñas de madera y almohadillas.",
    grupos: [
      { titulo: "Sellos y fechadores", categoria: "sellos-fechadores" },
      { titulo: "Sellos de madera", categoria: "sellos-madera" },
      { titulo: "Otros", categoria: "sellos-otros" },
    ],
  },
  {
    name: "Regalos",
    slug: "regalos-personalizados",
    descripcion: "Regalos y detalles personalizados para cada ocasión.",
    grupos: [
      { titulo: "Bebés", categoria: "regalos-bebes" },
      { titulo: "Hogar y decoración", categoria: "regalos-hogar" },
      { titulo: "Bebidas", categoria: "regalos-bebidas" },
      {
        titulo: "Accesorios",
        categoria: "regalos-accesorios",
        extras: ["panoleta-para-eventos"],
      },
      { titulo: "Recuerdos y celebraciones", categoria: "regalos-recuerdos" },
    ],
  },
];

/** Nombre completo para las tarjetas del Home. */
export const CATEGORIA_TITULOS: Record<string, string> = {
  imprenta: "Imprenta",
  "gran-formato": "Gran Formato",
  "impresion-textil": "Textil",
  merchandising: "Merchandising",
  eventos: "Eventos",
  bodas: "Bodas",
  sellos: "Sellos",
  "regalos-personalizados": "Regalos Personalizados",
};

export const SERVICIOS = [
  { name: "Diseño Gráfico", to: "/diseno-grafico" },
  { name: "Eventos Personalizados", to: "/eventos-personalizados" },
  { name: "Gran Formato", to: "/gran-formato" },
  { name: "Imprenta", to: "/imprenta" },
  { name: "Impresión Textil", to: "/impresion-textil" },
  { name: "Merchandising", to: "/merchandising" },
  { name: "Regalos Personalizados", to: "/regalos-personalizados" },
  { name: "Invitaciones de Boda", to: "/invitaciones-de-boda" },
  { name: "Natur House", to: "/naturhouse" },
] as const;

export const REDES = {
  facebook: "https://www.facebook.com/UrbanPrintOrihuela/",
  instagram: "https://www.instagram.com/urbanprintorihuela/",
};

export const TITULAR = {
  nombre: "Pedro Martinez García",
  nif: "48481947 - V",
  direccion: "Calle Comunidad Valenciana 5, 03300 Orihuela (Alicante)",
  telefono: "+34 966 57 83 45",
  email: "info@urbanprint.es",
  web: "www.urbanprint.es",
};

export const EMPRESA = {
  nombre: "Urban Print",
  direccion: "Calle Comunidad Valenciana 2, 03300 Orihuela (Alicante)",
  telefono: "+34 966 57 83 45",
  telefonoLink: "+34966578345",
  emails: ["urbanprint.orihuela@gmail.com", "info@urbanprint.es"],
  enlaceExterno: { name: "NT - Natural", url: "https://www.naturhouse.com/" },
};
