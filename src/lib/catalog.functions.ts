import { createServerFn } from "@tanstack/react-start";
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

    // Validación defensiva: asegurar que siempre retornamos arrays válidos
    if (!Array.isArray(productos) || !Array.isArray(categorias)) {
      console.error(
        `[Catalog] ERROR CRÍTICO: productos o categorias no son arrays`,
        {
          productosType: typeof productos,
          categoriasType: typeof categorias,
        }
      );
      throw new Error(
        `[Catalog] Respuesta de WooCommerce inválida (datos no son arrays)`
      );
    }

    console.log(
      `[Catalog] ✓ Cargados ${productos.length} productos y ${categorias.length} categorías desde WooCommerce`
    );

    return {
      categories: categorias,
      products: productos,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : "";

    // Log detallado para debugging en Vercel
    console.error(`[Catalog] ✗ CRÍTICO: Error al obtener catálogo`);
    console.error(`[Catalog] Error message: ${errorMessage}`);
    console.error(`[Catalog] Error stack:`, stack);

    // Intentar identificar la causa específica
    if (errorMessage.includes("Missing environment variable")) {
      console.error(`[Catalog] ⚠️  CAUSA PROBABLE: Variables de entorno WooCommerce no configuradas`);
      console.error(`[Catalog] Verifica WOOCOMMERCE_URL, WOOCOMMERCE_CONSUMER_KEY, WOOCOMMERCE_CONSUMER_SECRET`);
    } else if (errorMessage.includes("401") || errorMessage.includes("403")) {
      console.error(`[Catalog] ⚠️  CAUSA PROBABLE: Credenciales WooCommerce inválidas o expiradas`);
    } else if (errorMessage.includes("ECONNREFUSED") || errorMessage.includes("ETIMEDOUT")) {
      console.error(`[Catalog] ⚠️  CAUSA PROBABLE: WooCommerce no responde (conectividad o URL incorrecta)`);
    }

    throw new Error(
      `No se pudo cargar el catálogo. Error: ${errorMessage}. Por favor, intenta más tarde.`
    );
  }
});

async function getGoogleFiveStarReviews() {
  const apiKey = process.env['GOOGLE_PLACES_API_KEY'];
  const placeId = process.env['GOOGLE_PLACE_ID'];

  console.log("[REVIEWS] Fetching reviews for placeId:", placeId);

  if (!apiKey || apiKey === "MI_API_KEY" || !placeId || placeId === "MI_PLACE_ID") {
    console.log("[REVIEWS] Missing credentials");
    return [];
  }

  try {
    // Usar Web Service API (antiguo) que SÍ devuelve reviews
    // El endpoint v1/places NO devuelve reviews, por eso usamos el antiguo nearbySearch/details
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}&fields=reviews,rating`;

    console.log("[REVIEWS] Requesting URL:", url.substring(0, 100) + "...");
    const response = await fetch(url);

    console.log("[REVIEWS] Response status:", response.status);

    if (!response.ok) {
      console.log("[REVIEWS] Request failed");
      return [];
    }

    const data = await response.json();
    console.log("[REVIEWS] Response data:", JSON.stringify(data).substring(0, 500));

    if (data.status !== "OK" || !data.result?.reviews || data.result.reviews.length === 0) {
      return [];
    }

    // Filtrar SOLO reseñas con exactamente 5 estrellas
    const fiveStarReviews = data.result.reviews.filter((review: any) => review.rating === 5);

    // Transformar al formato esperado por ReviewsCarousel
    return fiveStarReviews.map((review: any, index: number) => ({
      id: `google-${index}`,
      author: review.author_name || "Anonymous",
      rating: review.rating,
      content: review.text || "",
    }));
  } catch (error) {
    console.error("Error fetching Google reviews:", error);
    return [];
  }
}

export const getReviews = createServerFn({ method: "GET" }).handler(async () => {
  try {
    // Obtener reseñas de 5 estrellas de Google Places API
    // Sin fallback a Supabase - solo reseñas reales de Google
    const googleReviews = await getGoogleFiveStarReviews();
    return googleReviews;
  } catch (error) {
    console.error("Error fetching reviews from Google:", error);
    // No fallback to Supabase - if Google fails, no reviews shown
    return [];
  }
});
