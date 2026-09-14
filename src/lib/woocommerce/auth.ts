/**
 * Autenticación para WooCommerce REST API
 * Genera credenciales Basic Auth (base64 encoding)
 * SOLO para uso en servidor (server functions, .server.ts)
 */

/**
 * Genera header de autenticación Basic Auth para WooCommerce
 * Formato: Authorization: Basic base64(key:secret)
 */
export function generateBasicAuthHeader(
  consumerKey: string,
  consumerSecret: string
): string {
  const credentials = `${consumerKey}:${consumerSecret}`;
  const encoded = Buffer.from(credentials).toString("base64");
  return `Basic ${encoded}`;
}

/**
 * Valida que las credenciales de WooCommerce estén configuradas
 * Lanza error si falta alguna variable de entorno
 */
export function validateWooCommerceEnv(): {
  url: string;
  key: string;
  secret: string;
} {
  const url = process.env["WOOCOMMERCE_URL"];
  const key = process.env["WOOCOMMERCE_CONSUMER_KEY"];
  const secret = process.env["WOOCOMMERCE_CONSUMER_SECRET"];

  const missing: string[] = [];
  if (!url) missing.push("WOOCOMMERCE_URL");
  if (!key) missing.push("WOOCOMMERCE_CONSUMER_KEY");
  if (!secret) missing.push("WOOCOMMERCE_CONSUMER_SECRET");

  if (missing.length > 0) {
    throw new Error(
      `[WooCommerce] Missing environment variable(s): ${missing.join(", ")}`
    );
  }

  return {
    url: url!,
    key: key!,
    secret: secret!,
  };
}
