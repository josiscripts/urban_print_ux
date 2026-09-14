import { createServerFn } from "@tanstack/react-start";
import { publicSupabase } from "./supabase-public.server";
import { getWooCommerceClient } from "./woocommerce/client.server";
import type { WooProduct } from "./woocommerce/types";
import {
  adaptarProductosWooCommerce,
  adaptarCategoriasWooCommerce,
  type Producto,
  type Categoria,
} from "./woocommerce/adapter";

// Re-export tipos para compatibilidad con componentes existentes
export type { Producto, Categoria };

/**
 * Obtiene todos los productos de WooCommerce con paginación
 * WooCommerce devuelve máx 100 por página, así que iteramos si necesario
 */
async function obtenerTodosLosProductos(
  wooClient: ReturnType<typeof getWooCommerceClient>
): Promise<(Producto & { _woo: any })[]> {
  const todosLosProductos: any[] = [];
  let page = 1;
  let tieneProxima = true;

  while (tieneProxima) {
    const productos = await wooClient.getProducts({ per_page: 100, page });
    todosLosProductos.push(...productos);

    // Si obtuvo menos de 100, no hay más páginas
    tieneProxima = productos.length === 100;
    page++;
  }

  return adaptarProductosWooCommerce(todosLosProductos, true);
}

/**
 * getCatalogo() - Obtiene productos y categorías
 * FASE 2: Migrado a WooCommerce como fuente de verdad
 *
 * Obtiene TODOS los datos de WooCommerce REST API mediante cliente server-only.
 * Adapta respuesta a formato esperado por frontend.
 * Si WooCommerce falla, error se propaga (sin fallback silencioso).
 */
export const getCatalogo = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const wooClient = getWooCommerceClient();

    // Obtener productos (con paginación) y categorías en paralelo de WooCommerce
    const [productos, wooCategories] = await Promise.all([
      obtenerTodosLosProductos(wooClient),
      wooClient.getCategories({ per_page: 100 }),
    ]);

    // Adaptar categorías
    const categorias = adaptarCategoriasWooCommerce(wooCategories, true);

    console.log(
      `[Catalog] Cargados ${productos.length} productos y ${categorias.length} categorías desde WooCommerce`
    );

    return {
      categories: categorias,
      products: productos,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Catalog] Error al obtener catálogo de WooCommerce: ${errorMessage}`);
    throw new Error(
      `No se pudo cargar el catálogo. Error: ${errorMessage}. Por favor, intenta más tarde.`
    );
  }
});

/**
 * getReviews() - Obtiene reseñas
 * FASE 2: Sigue usando Supabase (no migrado a WooCommerce)
 *
 * Mantiene la fuente en Supabase de momento.
 * Será revisado en futuras fases si WooCommerce tiene datos de reseñas.
 */
export const getReviews = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicSupabase();
  const { data } = await supabase
    .from("reviews")
    .select("id, author, rating, content")
    .order("position");
  return data ?? [];
});
