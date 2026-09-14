/**
 * TEST: Simular exactamente lo que hace el adapter
 *
 * Comprueba si el adapter filtra productos que causan "Producto no encontrado"
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar .env
function loadEnv() {
  const envPath = path.join(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    content.split("\n").forEach((line) => {
      const [key, ...valueParts] = line.split("=");
      const trimmedKey = key?.trim();
      if (trimmedKey && !trimmedKey.startsWith("#")) {
        let value = valueParts.join("=").trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        process.env[trimmedKey] = value;
      }
    });
  }
}

loadEnv();

const WOOCOMMERCE_URL = process.env.WOOCOMMERCE_URL || "https://urbanprint.es";
const WOOCOMMERCE_CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
const WOOCOMMERCE_CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET;

const PRODUCT_IDS_TO_CHECK = [6590, 6589, 6586, 6585, 6584];

function generateBasicAuthHeader(key, secret) {
  const credentials = `${key}:${secret}`;
  const encoded = Buffer.from(credentials).toString("base64");
  return `Basic ${encoded}`;
}

async function fetchWooCommerce(endpoint, params = {}) {
  const queryString = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();

  const url = `${WOOCOMMERCE_URL}/wp-json/wc/v3${endpoint}${queryString ? `?${queryString}` : ""}`;
  const authHeader = generateBasicAuthHeader(WOOCOMMERCE_CONSUMER_KEY, WOOCOMMERCE_CONSUMER_SECRET);

  const response = await fetch(url, {
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `[WooCommerce API Error] ${response.status} ${errorData.message || response.statusText}`
    );
  }

  return response.json();
}

/**
 * Replica EXACTAMENTE el adapter de la app
 */
function stripHtmlTags(html) {
  if (!html) return null;
  return (
    html
      .replace(/<[^>]*>/g, " ") // Elimina todas las tags
      .replace(/&nbsp;/g, " ") // Entidades HTML
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ") // Normaliza espacios múltiples
      .trim() || null
  );
}

/**
 * Replica adaptarProductoWooCommerce
 */
function adaptarProductoWooCommerce(wooProd, throwOnError = true) {
  // VALIDACIÓN CRÍTICA - líneas 87-90 del adapter
  if (!wooProd.id || !wooProd.slug || !wooProd.name) {
    const error = new Error(
      `[Adapter] Producto inválido: faltan campos críticos (id=${wooProd.id}, slug=${wooProd.slug}, name=${wooProd.name})`
    );

    if (throwOnError) {
      throw error;
    }
    return { error: error.message, producto: null };
  }

  const priceStr = wooProd.price || "";
  let priceNumber = 0;

  if (priceStr && priceStr.trim()) {
    try {
      priceNumber = parseFloat(priceStr);
      if (isNaN(priceNumber)) {
        priceNumber = 0;
      }
    } catch (err) {
      priceNumber = 0;
    }
  }

  let categoryId = "0";
  if (wooProd.categories && wooProd.categories.length > 0) {
    categoryId = String(wooProd.categories[0].id);
  }

  let imageUrl = null;
  if (wooProd.images && wooProd.images.length > 0) {
    imageUrl = wooProd.images[0].src || null;
  }

  let cleanDescription = null;
  if (wooProd.short_description && wooProd.short_description.trim()) {
    cleanDescription = stripHtmlTags(wooProd.short_description);
  } else if (wooProd.description && wooProd.description.trim()) {
    cleanDescription = stripHtmlTags(wooProd.description);
  }

  return {
    error: null,
    producto: {
      id: String(wooProd.id),
      slug: wooProd.slug,
      name: wooProd.name,
      price: priceNumber,
      description: cleanDescription,
      featured: wooProd.featured ?? false,
      category_id: categoryId,
      image: imageUrl,
    },
  };
}

/**
 * Replica adaptarProductosWooCommerce
 */
function adaptarProductosWooCommerce(wooProds, logErrors = true) {
  const adaptados = [];
  const errores = [];

  for (let index = 0; index < wooProds.length; index++) {
    const prod = wooProds[index];
    try {
      const result = adaptarProductoWooCommerce(prod, true);
      if (result.producto) {
        adaptados.push(result.producto);
      }
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      errores.push({ index, id: prod.id, error: mensaje });
      if (logErrors) {
        console.error(`[Adapter] Error adaptando producto[${index}] ID ${prod.id}: ${mensaje}`);
      }
    }
  }

  if (errores.length > 0 && logErrors) {
    console.warn(
      `[Adapter] ${errores.length}/${wooProds.length} productos no se pudieron adaptar`
    );
  }

  return { adaptados, errores };
}

/**
 * TEST: Verificar qué pasa con productos específicos
 */
async function testAdapterFiltering() {
  console.log("\n" + "=".repeat(80));
  console.log("TEST: VALIDACIÓN DEL ADAPTER");
  console.log("=".repeat(80));

  // Obtener todos los productos
  console.log("\nObteniendo todos los productos de WooCommerce...");
  const allProducts = [];
  let page = 1;

  while (true) {
    const productos = await fetchWooCommerce(`/products`, { per_page: 100, page });
    if (productos.length === 0) break;
    allProducts.push(...productos);
    if (productos.length < 100) break;
    page++;
  }

  console.log(`✓ Obtenidos ${allProducts.length} productos`);

  // Procesar con adapter (igual que la app)
  console.log(`\nProcesando con adapter...`);
  const { adaptados, errores } = adaptarProductosWooCommerce(allProducts, false);

  console.log(`✓ ${adaptados.length} productos adaptados`);
  console.log(`✗ ${errores.length} productos descartados por el adapter`);

  // Mostrar detalles de los productos críticos
  console.log(`\n--- ANÁLISIS DE PRODUCTOS CRÍTICOS ---`);

  for (const id of PRODUCT_IDS_TO_CHECK) {
    const wooProduct = allProducts.find((p) => p.id === id);

    if (!wooProduct) {
      console.log(`\nID ${id}: ✗ NO EXISTE EN WOOCOMMERCE`);
      continue;
    }

    const adaptado = adaptados.find((p) => p.id === String(id));
    const error = errores.find((e) => e.id === id);

    console.log(`\nID ${id}: ${wooProduct.name}`);
    console.log(`  WooCommerce - slug: "${wooProduct.slug || "(VACÍO)"}"`);
    console.log(`  WooCommerce - status: ${wooProduct.status}`);
    console.log(`  WooCommerce - id: ${wooProduct.id}`);
    console.log(`  WooCommerce - name: ${wooProduct.name}`);

    // Validación: ¿Qué campos faltan?
    const campos = [];
    if (!wooProduct.id) campos.push("id");
    if (!wooProduct.slug) campos.push("slug");
    if (!wooProduct.name) campos.push("name");

    if (campos.length > 0) {
      console.log(`  ✗ FALTA VALIDACIÓN: ${campos.join(", ")}`);
    }

    if (adaptado) {
      console.log(`  ✓ ADAPTADO - puede buscarse por /producto/${adaptado.slug}`);
    } else if (error) {
      console.log(`  ✗ DESCARTADO POR ADAPTER: ${error.error}`);
    } else {
      console.log(`  ✗ NO ENCONTRADO EN ADAPTADOS`);
    }
  }

  // Resumen de qué se descartó
  console.log(`\n--- PRODUCTOS DESCARTADOS POR ADAPTER ---`);
  console.log(`Total descartados: ${errores.length}`);

  if (errores.length > 0) {
    console.log(`\nDetalle:`);
    for (const err of errores) {
      console.log(`  - ID ${err.id}: ${err.error}`);
    }
  }

  // Comparación
  console.log(`\n--- COMPARACIÓN WooCommerce vs Adaptados ---`);
  console.log(`WooCommerce bruto: ${allProducts.length}`);
  console.log(`Después del adapter: ${adaptados.length}`);
  console.log(`Diferencia (descartados): ${allProducts.length - adaptados.length}`);

  // Buscar cuál es la razón de descarte
  const razonesDescarte = new Map();
  for (const producto of allProducts) {
    if (!adaptados.find((a) => a.id === String(producto.id))) {
      // Este producto fue descartado
      const razon = [];
      if (!producto.id) razon.push("sin ID");
      if (!producto.slug) razon.push("sin SLUG");
      if (!producto.name) razon.push("sin NAME");

      const razonStr = razon.join(", ") || "desconocido";
      razonesDescarte.set(razonStr, (razonesDescarte.get(razonStr) || 0) + 1);
    }
  }

  console.log(`\n--- RAZONES DE DESCARTE ---`);
  for (const [razon, count] of razonesDescarte) {
    console.log(`  ${count}x: ${razon}`);
  }
}

// Main
async function main() {
  console.log("\n");
  console.log("╔" + "═".repeat(78) + "╗");
  console.log("║ TEST: VALIDACIÓN DEL ADAPTER".padEnd(79) + "║");
  console.log("╚" + "═".repeat(78) + "╝");

  try {
    await testAdapterFiltering();
  } catch (error) {
    console.error(`\n✗ ERROR:`, error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
