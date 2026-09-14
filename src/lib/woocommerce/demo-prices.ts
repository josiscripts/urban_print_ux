/**
 * PRECIOS DE DEMOSTRACIÓN - TEMPORAL PARA DESARROLLO
 *
 * ⚠️  ESTOS PRECIOS SON SOLO PARA DESARROLLO
 *
 * Cuando WooCommerce tenga precios reales configurados en la API,
 * este archivo se puede eliminar directamente.
 *
 * La prioridad siempre es:
 * Precio real WooCommerce > Precio Demo > 0 (fallback)
 *
 * Identificados por WooCommerce Product ID
 */

/**
 * Mapa de precios de demostración
 * Key: WooCommerce Product ID
 * Value: Precio en EUR (demostración)
 */
const DEMO_PRICES: Record<number, number> = {
  6590: 29.90, // Tarjetas de boda "love story"
  6589: 19.90, // Sellos de caucho (copia)
  6586: 24.90, // Sellos de caucho
  6585: 34.90, // Invitación con sobre forrado
  6584: 39.90, // Invitaciones con traseras en kraft
};

/**
 * Obtiene el precio de demostración para un producto
 * @param wooProductId ID del producto en WooCommerce
 * @returns Precio demo si existe, null si no
 */
export function getDemoPrice(wooProductId: number): number | null {
  return DEMO_PRICES[wooProductId] ?? null;
}
