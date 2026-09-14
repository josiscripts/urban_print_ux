/**
 * Punto de entrada único para integración WooCommerce
 * Exporta: cliente + tipos + adaptador
 */

export { getWooCommerceClient } from "./client.server";
export type { WooProduct, WooCategory, WooVariation, WooAttribute, WooImage } from "./types";
export {
  adaptarProductoWooCommerce,
  adaptarCategoriaWooCommerce,
  adaptarProductosWooCommerce,
  adaptarCategoriasWooCommerce,
} from "./adapter";
export type { Producto, Categoria, WooProductMetadata } from "./adapter";
