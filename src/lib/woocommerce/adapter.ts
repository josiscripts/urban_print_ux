/**
 * Adaptador: Convierte WooCommerce REST API → Estructura del Frontend
 *
 * Responsabilidad:
 * - Mapear WooCommerceProduct → Producto (tipo esperado por frontend)
 * - Mapear WooCommerceCategory → Categoria (tipo esperado por frontend)
 * - Manejar conversiones de tipos (string → number, etc.)
 * - Preservar datos originales para futuras mejoras
 * - Validar que no falten campos críticos
 */

import type { WooProduct, WooCategory } from "./types";
import { getDemoPrice } from "./demo-prices";

/**
 * Limpia etiquetas HTML de un texto
 * Convierte HTML a texto plano para descripciones
 */
function stripHtmlTags(html: string | null | undefined): string | null {
  if (!html) return null;
  // Reemplaza tags HTML comunes con espacios
  return html
    .replace(/<[^>]*>/g, " ") // Elimina todas las tags
    .replace(/&nbsp;/g, " ") // Entidades HTML
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ") // Normaliza espacios múltiples
    .trim() || null;
}

/**
 * Tipo Producto esperado por el frontend
 * (Copiado de src/lib/catalog.functions.ts para referencia)
 */
export type Producto = {
  id: string;
  slug: string;
  name: string;
  price: number;
  description: string | null;
  featured: boolean;
  category_id: string;
  image: string | null; // URL de la primera imagen de WooCommerce
};

/**
 * Tipo Categoria esperado por el frontend
 * (Copiado de src/lib/catalog.functions.ts para referencia)
 */
export type Categoria = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  position: number;
};

/**
 * Metadatos adicionales preservados de WooCommerce
 * Para futuras fases (carrito, checkout, stock, variaciones, etc.)
 */
export type WooProductMetadata = {
  woo_id: number; // ID original de WooCommerce
  woo_sku: string;
  woo_regular_price: string;
  woo_sale_price: string;
  woo_all_categories: Array<{ id: number; name: string; slug: string }>;
  woo_images: Array<{ id: number; src: string; alt: string }>;
  woo_stock_quantity: number | null;
  woo_stock_status: string;
  woo_type: string; // "simple", "variable", etc.
};

/**
 * Adapta un producto de WooCommerce al formato esperado por el frontend
 *
 * @param wooProd - Producto de WooCommerce REST API v3
 * @returns Producto adaptado + metadatos preservados
 * @throws Error si faltan campos críticos
 */
export function adaptarProductoWooCommerce(
  wooProd: WooProduct
): Producto & { _woo: WooProductMetadata } {
  // Validar campos críticos
  if (!wooProd.id || !wooProd.slug || !wooProd.name) {
    throw new Error(
      `[Adapter] Producto inválido: faltan campos críticos (id=${wooProd.id}, slug=${wooProd.slug}, name=${wooProd.name})`
    );
  }

  // Convertir precio: string → number
  // Prioridad: Precio real WooCommerce > Precio Demo > 0 (fallback)
  let priceNumber: number = 0;

  const priceStr = wooProd.price || "";

  // PASO 1: Intentar obtener precio real de WooCommerce
  if (priceStr && priceStr.trim()) {
    try {
      priceNumber = parseFloat(priceStr);
      if (isNaN(priceNumber)) {
        console.warn(
          `[Adapter] Precio inválido para "${wooProd.name}" (ID: ${wooProd.id}): "${priceStr}"`
        );
        priceNumber = 0;
      }
    } catch (err) {
      console.warn(
        `[Adapter] Error al convertir precio para "${wooProd.name}" (ID: ${wooProd.id}): "${priceStr}"`
      );
      priceNumber = 0;
    }
  }

  // PASO 2: Si no hay precio real, intentar precio DEMO
  if (priceNumber === 0) {
    const demoPrice = getDemoPrice(wooProd.id);
    if (demoPrice !== null) {
      priceNumber = demoPrice;
      console.warn(
        `[Adapter] Producto "${wooProd.name}" (ID: ${wooProd.id}) usando precio DEMO: ${demoPrice}€ (WooCommerce no tiene precio real)`
      );
    } else {
      console.warn(
        `[Adapter] Producto "${wooProd.name}" (ID: ${wooProd.id}) sin precio real ni demo → usando 0€`
      );
    }
  }

  // Determinar category_id (usar primera categoría)
  // Preservar todas las categorías en metadatos
  let categoryId: string = "0";
  if (wooProd.categories && wooProd.categories.length > 0) {
    categoryId = String((wooProd.categories as any)[0].id);
  } else {
    console.warn(
      `[Adapter] Producto "${wooProd.name}" (ID: ${wooProd.id}) no tiene categoría asignada`
    );
    // Asignar categoría "vacía" para que frontend no falle
    // (mejor que null, mantiene tipo string)
    categoryId = "0";
  }

  // Obtener primera imagen si está disponible
  let imageUrl: string | null = null;
  if (wooProd.images && wooProd.images.length > 0) {
    imageUrl = wooProd.images[0].src || null;
  }

  // Obtener descripción limpia: prioridad short_description > description
  // Luego limpiar etiquetas HTML
  let cleanDescription: string | null = null;
  if (wooProd.short_description && wooProd.short_description.trim()) {
    cleanDescription = stripHtmlTags(wooProd.short_description);
  } else if (wooProd.description && wooProd.description.trim()) {
    cleanDescription = stripHtmlTags(wooProd.description);
  }

  const producto: Producto & { _woo: WooProductMetadata } = {
    // Campos requeridos por frontend
    id: String(wooProd.id),
    slug: wooProd.slug,
    name: wooProd.name,
    price: priceNumber,
    description: cleanDescription,
    featured: wooProd.featured ?? false,
    category_id: categoryId,
    image: imageUrl,

    // Metadatos de WooCommerce preservados para fases posteriores
    _woo: {
      woo_id: wooProd.id,
      woo_sku: wooProd.sku || "",
      woo_regular_price: wooProd.regular_price || wooProd.price,
      woo_sale_price: wooProd.sale_price || "",
      woo_all_categories: wooProd.categories || [],
      woo_images: wooProd.images || [],
      woo_stock_quantity: wooProd.stock_quantity ?? null,
      woo_stock_status: wooProd.stock_status || "instock",
      woo_type: wooProd.type || "simple",
    },
  };

  return producto;
}

/**
 * Adapta una categoría de WooCommerce al formato esperado por el frontend
 *
 * @param wooCat - Categoría de WooCommerce REST API v3
 * @returns Categoria adaptada
 * @throws Error si faltan campos críticos
 */
export function adaptarCategoriaWooCommerce(wooCat: WooCategory): Categoria {
  // Validar campos críticos
  if (!wooCat.id || !wooCat.slug || !wooCat.name) {
    throw new Error(
      `[Adapter] Categoría inválida: faltan campos críticos (id=${wooCat.id}, slug=${wooCat.slug}, name=${wooCat.name})`
    );
  }

  const categoria: Categoria = {
    id: String(wooCat.id),
    slug: wooCat.slug,
    name: wooCat.name,
    description: stripHtmlTags(wooCat.description || null),
    // En WooCommerce: parent es un número (0 si no tiene padre)
    // Frontend espera: parent_id string | null
    parent_id: wooCat.parent && wooCat.parent > 0 ? String(wooCat.parent) : null,
    // WooCommerce no devuelve position en lista directamente
    // Usamos menu_order como aproximación (si está disponible)
    // Por ahora, asignamos 0 (será ordenado por backend)
    position: wooCat.menu_order ?? 0,
  };

  return categoria;
}

/**
 * Adapta un array de productos de WooCommerce
 * Maneja errores individualmente - un producto corrupto no rompe toda la lista
 *
 * @param wooProds - Array de productos WooCommerce
 * @param logErrors - Si true, loguea errores (por defecto true)
 * @returns Array de productos adaptados (sin los que fallaron)
 */
export function adaptarProductosWooCommerce(
  wooProds: WooProduct[],
  logErrors: boolean = true
): (Producto & { _woo: WooProductMetadata })[] {
  const adaptados: (Producto & { _woo: WooProductMetadata })[] = [];
  const errores: { index: number; error: string }[] = [];

  wooProds.forEach((prod, index) => {
    try {
      const adaptado = adaptarProductoWooCommerce(prod);
      adaptados.push(adaptado);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      errores.push({ index, error: mensaje });
      if (logErrors) {
        console.error(`[Adapter] Error adaptando producto[${index}]: ${mensaje}`);
      }
    }
  });

  if (errores.length > 0 && logErrors) {
    console.warn(
      `[Adapter] ${errores.length}/${wooProds.length} productos no se pudieron adaptar`
    );
  }

  return adaptados;
}

/**
 * Adapta un array de categorías de WooCommerce
 * Maneja errores individualmente
 *
 * @param wooCats - Array de categorías WooCommerce
 * @param logErrors - Si true, loguea errores
 * @returns Array de categorías adaptadas
 */
export function adaptarCategoriasWooCommerce(
  wooCats: WooCategory[],
  logErrors: boolean = true
): Categoria[] {
  const adaptadas: Categoria[] = [];
  const errores: { index: number; error: string }[] = [];

  wooCats.forEach((cat, index) => {
    try {
      const adaptada = adaptarCategoriaWooCommerce(cat);
      adaptadas.push(adaptada);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      errores.push({ index, error: mensaje });
      if (logErrors) {
        console.error(`[Adapter] Error adaptando categoría[${index}]: ${mensaje}`);
      }
    }
  });

  if (errores.length > 0 && logErrors) {
    console.warn(
      `[Adapter] ${errores.length}/${wooCats.length} categorías no se pudieron adaptar`
    );
  }

  return adaptadas;
}
