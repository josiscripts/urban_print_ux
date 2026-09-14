/**
 * Cliente HTTP para WooCommerce REST API v3
 * SOLO PARA USO EN SERVIDOR (server functions, .server.ts)
 * NUNCA importar en componentes React
 *
 * Maneja:
 * - Autenticación Basic Auth
 * - Validación de variables de entorno
 * - Requests a endpoints de WooCommerce
 * - Manejo de errores
 */

import { generateBasicAuthHeader, validateWooCommerceEnv } from "./auth";
import type { WooProduct, WooCategory, WooErrorResponse } from "./types";

/**
 * Cliente para comunicarse con WooCommerce REST API
 */
export class WooCommerceClient {
  private baseUrl: string;
  private authHeader: string;

  /**
   * Inicializa el cliente con credenciales desde variables de entorno
   */
  constructor() {
    const env = validateWooCommerceEnv();
    this.baseUrl = env.url;
    this.authHeader = generateBasicAuthHeader(env.key, env.secret);
  }

  /**
   * Realiza una petición HTTP a WooCommerce
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers = new Headers(options.headers || {});
    headers.set("Authorization", this.authHeader);
    headers.set("Content-Type", "application/json");

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = (await response.json()) as WooErrorResponse;
      throw new Error(
        `[WooCommerce API Error] ${response.status} ${errorData.message || response.statusText}`
      );
    }

    return (await response.json()) as T;
  }

  /**
   * Obtiene lista de productos
   * @param params - Parámetros de query (per_page, page, search, etc.)
   */
  async getProducts(
    params: Record<string, string | number> = {}
  ): Promise<WooProduct[]> {
    const queryString = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString();

    const endpoint = `/wp-json/wc/v3/products${queryString ? `?${queryString}` : ""}`;

    return this.request<WooProduct[]>(endpoint);
  }

  /**
   * Obtiene un producto específico por ID
   */
  async getProductById(productId: number): Promise<WooProduct> {
    return this.request<WooProduct>(`/wp-json/wc/v3/products/${productId}`);
  }

  /**
   * Obtiene un producto específico por slug
   * (Nota: WooCommerce no tiene endpoint directo por slug, requiere búsqueda)
   */
  async getProductBySlug(slug: string): Promise<WooProduct | null> {
    const products = await this.getProducts({ search: slug, per_page: 1 });
    const found = products.find((p) => p.slug === slug);
    return found || null;
  }

  /**
   * Obtiene lista de categorías
   */
  async getCategories(
    params: Record<string, string | number> = {}
  ): Promise<WooCategory[]> {
    const queryString = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString();

    const endpoint = `/wp-json/wc/v3/products/categories${queryString ? `?${queryString}` : ""}`;

    return this.request<WooCategory[]>(endpoint);
  }

  /**
   * Obtiene una categoría específica por ID
   */
  async getCategoryById(categoryId: number): Promise<WooCategory> {
    return this.request<WooCategory>(
      `/wp-json/wc/v3/products/categories/${categoryId}`
    );
  }

  /**
   * Obtiene variaciones de un producto variable
   */
  async getProductVariations(
    productId: number,
    params: Record<string, string | number> = {}
  ): Promise<any[]> {
    const queryString = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString();

    const endpoint = `/wp-json/wc/v3/products/${productId}/variations${queryString ? `?${queryString}` : ""}`;

    return this.request<any[]>(endpoint);
  }

  /**
   * Health check: verifica que la conexión a WooCommerce funciona
   */
  async healthCheck(): Promise<{ status: "ok" | "error"; message: string }> {
    try {
      const products = await this.getProducts({ per_page: 1 });
      return {
        status: "ok",
        message: `WooCommerce API is reachable. Found ${products.length} product(s).`,
      };
    } catch (error) {
      return {
        status: "error",
        message: `WooCommerce API error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}

/**
 * Instancia singleton del cliente WooCommerce
 * Se inicializa una única vez y se reutiliza
 */
let _wooClient: WooCommerceClient | undefined;

/**
 * Obtiene la instancia del cliente WooCommerce
 * SOLO USAR EN SERVER FUNCTIONS Y ARCHIVOS .server.ts
 */
export function getWooCommerceClient(): WooCommerceClient {
  if (!_wooClient) {
    _wooClient = new WooCommerceClient();
  }
  return _wooClient;
}
