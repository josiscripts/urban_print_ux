/**
 * Server functions para integración con WooCommerce
 * FASE 1: Infraestructura de conexión y prueba
 *
 * Estas funciones corren exclusivamente en el servidor (Nitro/Vercel)
 * Las credenciales de WooCommerce NUNCA se exponen al navegador
 */

import { createServerFn } from "@tanstack/react-start";
import { getWooCommerceClient } from "@/lib/woocommerce/client.server";

/**
 * PRUEBA DE CONEXIÓN
 * Verifica que Vercel/TanStack Start puede comunicarse correctamente con WooCommerce
 * Realiza un GET /wp-json/wc/v3/products y devuelve los datos
 *
 * Uso desde el navegador:
 * const result = await testWooCommerceConnection();
 * console.log(result);
 */
export const testWooCommerceConnection = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const client = getWooCommerceClient();

      // Realiza la petición REAL a WooCommerce
      const products = await client.getProducts({ per_page: 5 });

      return {
        status: "success" as const,
        message: "WooCommerce connection successful",
        productsCount: products.length,
        products: products.map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          price: p.price,
          regular_price: p.regular_price,
          sale_price: p.sale_price,
          sku: p.sku,
          stock_quantity: p.stock_quantity,
          stock_status: p.stock_status,
          featured: p.featured,
          images: p.images.slice(0, 1).map((img) => ({
            id: img.id,
            src: img.src,
            alt: img.alt,
          })),
          categories: p.categories,
        })),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        status: "error" as const,
        message: "Failed to connect to WooCommerce",
        error: errorMessage,
      };
    }
  }
);

/**
 * HEALTH CHECK
 * Verifica rápidamente si WooCommerce está accesible
 */
export const checkWooCommerceHealth = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const client = getWooCommerceClient();
      const health = await client.healthCheck();

      return {
        status: health.status,
        message: health.message,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        status: "error" as const,
        message: `Health check failed: ${errorMessage}`,
        timestamp: new Date().toISOString(),
      };
    }
  }
);

/**
 * OBTENER CATEGORÍAS
 * Consulta las categorías de WooCommerce
 */
export const getWooCategoriesServerFn = createServerFn({ method: "GET" }).handler(
  async () => {
    try {
      const client = getWooCommerceClient();
      const categories = await client.getCategories({ per_page: 100 });

      return {
        status: "success" as const,
        categoriesCount: categories.length,
        categories: categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          parent: c.parent,
          description: c.description,
          image: c.image ? { src: c.image.src, alt: c.image.alt } : null,
          count: c.count,
        })),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        status: "error" as const,
        message: "Failed to fetch categories",
        error: errorMessage,
      };
    }
  }
);
