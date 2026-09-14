/**
 * SCRIPT DE DIAGNÓSTICO - FASE 1 a 6
 * Versión ES Module para ejecución directa
 *
 * Ejecución: node diagnose-product-issue.mjs
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
        // Remove quotes if present
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

// Credenciales
const WOOCOMMERCE_URL = process.env.WOOCOMMERCE_URL || "https://urbanprint.es";
const WOOCOMMERCE_CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
const WOOCOMMERCE_CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET;

const PRODUCT_IDS_TO_CHECK = [6590, 6589, 6586, 6585, 6584];

/**
 * Genera el header de autenticación Basic Auth
 */
function generateBasicAuthHeader(key, secret) {
  const credentials = `${key}:${secret}`;
  const encoded = Buffer.from(credentials).toString("base64");
  return `Basic ${encoded}`;
}

/**
 * Realiza una petición a WooCommerce
 */
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
 * FASE 1: Comprobar productos individuales
 */
async function fase1_checkIndividualProducts() {
  console.log("\n" + "=".repeat(80));
  console.log("FASE 1: COMPROBAR PRODUCTOS INDIVIDUALES");
  console.log("=".repeat(80));

  const results = {};

  for (const productId of PRODUCT_IDS_TO_CHECK) {
    console.log(`\n--- Producto ID: ${productId} ---`);
    try {
      const product = await fetchWooCommerce(`/products/${productId}`);
      console.log(`✓ Obtenido de WooCommerce`);
      console.log(`  - ID: ${product.id}`);
      console.log(`  - Name: ${product.name}`);
      console.log(`  - Slug: ${product.slug || "(VACÍO)"}`);
      console.log(`  - Status: ${product.status}`);
      console.log(`  - Catalog Visibility: ${product.catalog_visibility}`);
      console.log(`  - Categories: ${product.categories.map((c) => c.name).join(", ") || "(ninguna)"}`);

      results[productId] = { status: "success", product };
    } catch (error) {
      console.log(`✗ ERROR: ${error.message}`);
      results[productId] = { status: "error", error: error.message };
    }
  }

  return results;
}

/**
 * FASE 2 & 6: Comprobar paginación total
 */
async function fase2_checkPaginationAndTotal() {
  console.log("\n" + "=".repeat(80));
  console.log("FASE 2/6: COMPROBAR PAGINACIÓN Y TOTAL DE PRODUCTOS");
  console.log("=".repeat(80));

  const allProducts = [];
  let page = 1;
  let totalPages = 0;

  while (true) {
    console.log(`\nPágina ${page}...`);
    try {
      const products = await fetchWooCommerce(`/products`, { per_page: 100, page });

      if (products.length === 0) {
        console.log(`  Página vacía, finalizando.`);
        break;
      }

      console.log(`  ✓ Recibidos ${products.length} productos`);

      // Verificar presencia de IDs críticos
      const criticos = products.filter((p) => PRODUCT_IDS_TO_CHECK.includes(p.id));
      if (criticos.length > 0) {
        console.log(`  ✓ Contiene ${criticos.length} productos críticos: ${criticos.map((p) => p.id).join(", ")}`);
      }

      allProducts.push(...products);
      totalPages++;

      if (products.length < 100) {
        console.log(`  Última página (${products.length} < 100), finalizando.`);
        break;
      }

      page++;
    } catch (error) {
      console.log(`  ✗ Error: ${error.message}`);
      break;
    }
  }

  console.log(`\n--- RESUMEN PAGINACIÓN ---`);
  console.log(`Total de páginas: ${totalPages}`);
  console.log(`Total de productos: ${allProducts.length}`);
  console.log(`Productos sin slug: ${allProducts.filter((p) => !p.slug).length}`);
  console.log(`Productos sin name: ${allProducts.filter((p) => !p.name).length}`);
  console.log(`Productos sin id: ${allProducts.filter((p) => !p.id).length}`);
  console.log(`Productos draft/no publish: ${allProducts.filter((p) => p.status !== "publish").length}`);

  return { allProducts, totalPages };
}

/**
 * FASE 3: Análisis de slugs
 */
async function fase3_analyzeSlugIssues(allProducts) {
  console.log("\n" + "=".repeat(80));
  console.log("FASE 3: ANÁLISIS DE SLUGS Y VALIDACIONES");
  console.log("=".repeat(80));

  const problemProducts = [];

  for (const product of allProducts) {
    const issues = [];

    if (!product.id) issues.push("sin ID");
    if (!product.slug) issues.push("sin SLUG");
    if (!product.name) issues.push("sin NAME");
    if (product.status !== "publish") issues.push(`status=${product.status}`);
    if (product.catalog_visibility !== "visible") issues.push(`visibility=${product.catalog_visibility}`);

    if (issues.length > 0) {
      problemProducts.push({
        id: product.id,
        name: product.name || "(sin nombre)",
        slug: product.slug || "(sin slug)",
        issues,
      });
    }
  }

  console.log(`\nProductos con validación problemática: ${problemProducts.length}`);

  if (problemProducts.length > 0) {
    console.log(`\n✗ PRODUCTOS POTENCIALMENTE PROBLEMÁTICOS:`);
    for (const p of problemProducts.slice(0, 20)) {
      console.log(`  - ID ${p.id}: ${p.name}`);
      console.log(`    Issues: ${p.issues.join(", ")}`);
    }
    if (problemProducts.length > 20) {
      console.log(`  ... y ${problemProducts.length - 20} más`);
    }
  }

  return problemProducts;
}

/**
 * FASE 4: Comprobar slugs específicos
 */
async function fase4_testSlugLookup(allProducts) {
  console.log("\n" + "=".repeat(80));
  console.log("FASE 4: COMPROBAR BÚSQUEDA DE SLUGS ESPECÍFICOS");
  console.log("=".repeat(80));

  console.log(`\nSimulando: data.products.find((p) => p.slug === params.slug)`);

  for (const id of PRODUCT_IDS_TO_CHECK) {
    const producto = allProducts.find((p) => p.id === id);

    if (!producto) {
      console.log(`\n✗ ID ${id}: No existe en catálogo`);
      continue;
    }

    const slug = producto.slug;
    console.log(`\n--- ID ${id} ---`);
    console.log(`  Nombre: ${producto.name}`);
    console.log(`  Slug a buscar: "${slug}"`);
    console.log(`  Status: ${producto.status}`);
    console.log(`  Visibility: ${producto.catalog_visibility}`);

    if (!slug) {
      console.log(`  ✗ SLUG VACÍO - NO SE PUEDE BUSCAR`);
      continue;
    }

    const found = allProducts.find((p) => p.slug === slug);
    if (found) {
      console.log(`  ✓ ENCONTRADO en búsqueda exacta`);
    } else {
      console.log(`  ✗ NO ENCONTRADO - CAUSARÍA 404 EN /producto/${slug}`);
    }
  }
}

/**
 * FASE 5: Comprobar duplicados de slug
 */
async function fase5_checkSlugDuplicates(allProducts) {
  console.log("\n" + "=".repeat(80));
  console.log("FASE 5: COMPROBAR DUPLICADOS DE SLUG");
  console.log("=".repeat(80));

  const slugMap = new Map();

  for (const product of allProducts) {
    const slug = product.slug;
    if (!slug) continue;

    if (!slugMap.has(slug)) {
      slugMap.set(slug, []);
    }
    slugMap.get(slug).push(product);
  }

  const duplicates = Array.from(slugMap.entries()).filter(([_, products]) => products.length > 1);

  if (duplicates.length === 0) {
    console.log(`✓ No hay duplicados de slug`);
  } else {
    console.log(`✗ ENCONTRADOS ${duplicates.length} slugs duplicados:`);
    for (const [slug, products] of duplicates) {
      console.log(`\n  Slug: "${slug}"`);
      for (const p of products) {
        console.log(`    - ID: ${p.id}, Name: ${p.name}`);
      }
    }
  }

  return duplicates;
}

/**
 * FASE 6: Comprobar categorías
 */
async function fase6_checkCategories() {
  console.log("\n" + "=".repeat(80));
  console.log("FASE 6: COMPROBAR CATEGORÍAS");
  console.log("=".repeat(80));

  try {
    const categories = await fetchWooCommerce(`/products/categories`, { per_page: 100 });
    console.log(`✓ Obtuvieron ${categories.length} categorías`);

    const invalid = categories.filter((c) => !c.id || !c.slug || !c.name);
    if (invalid.length === 0) {
      console.log(`✓ Todas las categorías tienen id, slug y name`);
    } else {
      console.log(`✗ ${invalid.length} categorías inválidas`);
    }

    return categories;
  } catch (error) {
    console.log(`✗ ERROR: ${error.message}`);
    throw error;
  }
}

/**
 * MAIN
 */
async function main() {
  console.log("\n");
  console.log("╔" + "═".repeat(78) + "╗");
  console.log("║ DIAGNÓSTICO COMPLETO - PROBLEMA 'PRODUCTO NO ENCONTRADO'".padEnd(79) + "║");
  console.log("╚" + "═".repeat(78) + "╝");

  // Validar env
  console.log(`\n--- VALIDACIÓN DE VARIABLES DE ENTORNO ---`);
  console.log(`WOOCOMMERCE_URL: ${WOOCOMMERCE_URL ? "✓ configurada" : "✗ NO configurada"}`);
  console.log(
    `WOOCOMMERCE_CONSUMER_KEY: ${WOOCOMMERCE_CONSUMER_KEY ? "✓ configurada" : "✗ NO configurada"}`
  );
  console.log(
    `WOOCOMMERCE_CONSUMER_SECRET: ${WOOCOMMERCE_CONSUMER_SECRET ? "✓ configurada" : "✗ NO configurada"}`
  );

  if (!WOOCOMMERCE_URL || !WOOCOMMERCE_CONSUMER_KEY || !WOOCOMMERCE_CONSUMER_SECRET) {
    console.error(`\n✗ FATAL: Faltan variables de entorno requeridas`);
    process.exit(1);
  }

  try {
    // Ejecutar fases
    const fase1Results = await fase1_checkIndividualProducts();
    const fase2Data = await fase2_checkPaginationAndTotal();
    const problemProducts = await fase3_analyzeSlugIssues(fase2Data.allProducts);
    await fase4_testSlugLookup(fase2Data.allProducts);
    const fase5Duplicates = await fase5_checkSlugDuplicates(fase2Data.allProducts);
    const fase6Categories = await fase6_checkCategories();

    // RESUMEN FINAL
    console.log("\n" + "=".repeat(80));
    console.log("RESUMEN FINAL DE DIAGNÓSTICO");
    console.log("=".repeat(80));

    console.log(`\n--- ESTADÍSTICAS GENERALES ---`);
    console.log(`Total de productos en WooCommerce: ${fase2Data.allProducts.length}`);
    console.log(`Productos sin slug: ${fase2Data.allProducts.filter((p) => !p.slug).length}`);
    console.log(`Productos con problema de validación: ${problemProducts.length}`);
    console.log(`Slugs duplicados: ${fase5Duplicates.length}`);
    console.log(`Total de categorías: ${fase6Categories.length}`);

    console.log(`\n--- PRODUCTOS CRÍTICOS ---`);
    for (const id of PRODUCT_IDS_TO_CHECK) {
      const fase1 = fase1Results[id];
      if (!fase1) continue;

      if (fase1.status === "success") {
        const exists = fase2Data.allProducts.find((p) => p.id === id);
        const hasSlug = exists && exists.slug;
        const status = exists && exists.status === "publish" ? "publish" : `${exists?.status || "no-existe"}`;

        console.log(
          `ID ${id}: ✓ ENCONTRADO (status=${status}, slug=${hasSlug ? "✓" : "✗"})`
        );
      } else {
        console.log(`ID ${id}: ✗ ERROR - ${fase1.error}`);
      }
    }

  } catch (error) {
    console.error(`\n✗ FATAL ERROR:`, error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
