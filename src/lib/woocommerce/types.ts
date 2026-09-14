/**
 * Tipos TypeScript para WooCommerce REST API v3
 * Definiciones básicas de productos y categorías
 */

/**
 * Imagen de producto en WooCommerce
 */
export type WooImage = {
  id: number;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  src: string;
  name: string;
  alt: string;
};

/**
 * Atributo de producto (ej: talla, color)
 */
export type WooAttribute = {
  id: number;
  name: string;
  option: string;
};

/**
 * Variación de producto (ej: talla S/M/L con precios diferentes)
 */
export type WooVariation = {
  id: number;
  date_created: string;
  date_modified: string;
  description: string;
  permalink: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  status: string;
  attributes: WooAttribute[];
  image: WooImage | null;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: string;
};

/**
 * Producto de WooCommerce
 */
export type WooProduct = {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string;
  date_modified: string;
  type: string; // "simple", "variable", etc.
  status: string; // "publish", "draft", etc.
  featured: boolean;
  catalog_visibility: string;
  description: string;
  short_description: string;
  sku: string;
  regular_price: string;
  sale_price: string;
  date_on_sale_from: string | null;
  date_on_sale_to: string | null;
  price: string;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: string; // "instock", "outofstock"
  images: WooImage[];
  categories: Array<{ id: number; name: string; slug: string }>;
  tags: Array<{ id: number; name: string; slug: string }>;
  attributes: Array<{
    id: number;
    name: string;
    options: string[];
    visible: boolean;
    variation: boolean;
  }>;
  related_ids: number[];
  upsell_ids: number[];
  cross_sell_ids: number[];
  parent_id: number;
  purchase_note: string;
  menu_order: number;
};

/**
 * Categoría de producto en WooCommerce
 */
export type WooCategory = {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  display: string; // "default", "products", "subcategories"
  image: WooImage | null;
  menu_order: number;
  count: number;
  links: Array<{ href: string; rel: string }>;
};

/**
 * Respuesta paginated de WooCommerce API
 */
export type WooPaginatedResponse<T> = {
  data: T[];
  headers: {
    "x-wp-total": number;
    "x-wp-totalpages": number;
  };
};

/**
 * Error de WooCommerce API
 */
export type WooErrorResponse = {
  code: string;
  message: string;
  data?: {
    status: number;
  };
};
