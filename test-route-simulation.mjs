/**
 * TEST: Simular EXACTAMENTE el flujo de la ruta /producto/$slug
 *
 * Usuario visita URL → loader ejecuta find() → componente renderiza
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

// Adapter simplificado
function stripHtmlTags(html) {
  if (!html) return null;
  return (
    html
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim() || null
  );
}

function adaptarProductosWooCommerce(wooProds) {
  const adaptados = [];
  for (let index = 0; index < wooProds.length; index++) {
    const prod = wooProds[index];
    if (!prod.id || !prod.slug || !prod.name) {
      continue;
    }
    const priceStr = prod.price || "";
    let priceNumber = 0;
    if (priceStr && priceStr.trim()) {
      priceNumber = parseFloat(priceStr);
      if (isNaN(priceNumber)) priceNumber = 0;
    }

    let categoryId = "0";
    if (prod.categories && prod.categories.length > 0) {
      categoryId = String(prod.categories[0].id);
    }

    let imageUrl = null;
    if (prod.images && prod.images.length > 0) {
      imageUrl = prod.images[0].src || null;
    }

    let cleanDescription = null;
    if (prod.short_description && prod.short_description.trim()) {
      cleanDescription = stripHtmlTags(prod.short_description);
    } else if (prod.description && prod.description.trim()) {
      cleanDescription = stripHtmlTags(prod.description);
    }

    adaptados.push({
      id: String(prod.id),
      slug: prod.slug,
      name: prod.name,
      price: priceNumber,
      description: cleanDescription,
      featured: prod.featured ?? false,
      category_id: categoryId,
      image: imageUrl,
    });
  }
  return adaptados;
}

/**
 * Simula EXACTAMENTE lo que hace el loader de /producto/$slug
 */
function simulateRouteLoader(catalog, params_slug) {
  // Esto es la línea EXACTA del loader:
  // const producto = data.products.find((p) => p.slug === params.slug);

  const producto = catalog.products.find((p) => p.slug === params_slug);

  if (!producto) {
    return {
      found: false,
      notFound: true,
      slug: params_slug,
    };
  }

  return {
    found: true,
    notFound: false,
    slug: params_slug,
    producto: {
      id: producto.id,
      name: producto.name,
      price: producto.price,
    },
  };
}

/**
 * TEST: Comprobar slugs con posibles problemas de encoding
 */
async function testSlugEncoding() {
  console.log("\n" + "=".repeat(80));
  console.log("TEST: SIMULACIÓN DE RUTA Y ENCODING DE SLUG");
  console.log("=".repeat(80));

  // Obtener catálogo
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

  // Adaptar (como hace la app)
  const adaptados = adaptarProductosWooCommerce(allProducts);
  console.log(`✓ Adaptados ${adaptados.length} productos`);

  const catalog = { products: adaptados };

  // Probar slugs problemáticos
  console.log(`\n--- PRUEBA DE SLUGS ---`);

  const testCases = [
    // Slugs normales
    { slug: "tarjetas-de-boda-love-story", esperado: true },
    { slug: "sellos-de-caucho", esperado: true },
    { slug: "invitacion-con-sobre-forrado", esperado: true },
    { slug: "invitacion-love-story", esperado: true },

    // Variaciones que PODRÍAN causar problemas
    { slug: "tarjetas-de-boda-love-story ", esperado: false }, // Con espacio al final
    { slug: " tarjetas-de-boda-love-story", esperado: false }, // Con espacio al inicio
    { slug: "TARJETAS-DE-BODA-LOVE-STORY", esperado: false }, // Mayúsculas
    { slug: "tarjetas-de-boda-love-story\n", esperado: false }, // Con newline
    { slug: "tarjetas%20de%20boda%20love%20story", esperado: false }, // URL encoded

    // Slugs inexistentes
    { slug: "producto-inexistente", esperado: false },
  ];

  for (const testCase of testCases) {
    const result = simulateRouteLoader(catalog, testCase.slug);
    const status = result.found ? "✓ ENCONTRADO" : "✗ NO ENCONTRADO";
    const expected = testCase.esperado ? "(esperado)" : "(INESPERADO)";

    console.log(`\nSlug: "${testCase.slug}"`);
    console.log(`  Resultado: ${status} ${expected}`);

    if (result.found !== testCase.esperado) {
      console.log(`  ⚠️  DISCREPANCIA: Se esperaba ${testCase.esperado ? "ENCONTRAR" : "NO ENCONTRAR"}`);
    }
  }

  // Comprobar TODOS los slugs del catálogo
  console.log(`\n--- VERIFICACIÓN DE TODOS LOS PRODUCTOS ---`);
  console.log(`Comprobando que cada producto se encuentra por su propio slug...`);

  let successCount = 0;
  let failureCount = 0;
  const failures = [];

  for (const producto of adaptados) {
    const result = simulateRouteLoader(catalog, producto.slug);
    if (result.found) {
      successCount++;
    } else {
      failureCount++;
      failures.push({
        id: producto.id,
        name: producto.name,
        slug: producto.slug,
      });
    }
  }

  console.log(`\n✓ Encontrados: ${successCount}`);
  console.log(`✗ No encontrados: ${failureCount}`);

  if (failures.length > 0) {
    console.log(`\n⚠️  ENCONTRADOS ${failures.length} PRODUCTOS QUE NO SE ENCUENTRAN:`);
    for (const f of failures.slice(0, 10)) {
      console.log(`  - ID ${f.id}: "${f.name}" (slug: "${f.slug}")`);
    }
    if (failures.length > 10) {
      console.log(`  ... y ${failures.length - 10} más`);
    }
  } else {
    console.log(`\n✓ TODOS LOS PRODUCTOS SE ENCUENTRAN CORRECTAMENTE`);
  }

  // Análisis de caracteres especiales
  console.log(`\n--- ANÁLISIS DE CARACTERES ESPECIALES EN SLUGS ---`);
  const specialCharProducts = adaptados.filter((p) => {
    return /[^a-z0-9-]/.test(p.slug);
  });

  if (specialCharProducts.length > 0) {
    console.log(`Encontrados ${specialCharProducts.length} productos con caracteres especiales:`);
    for (const p of specialCharProducts.slice(0, 10)) {
      console.log(`  - ID ${p.id}: slug="${p.slug}" (name="${p.name}")`);
    }
  } else {
    console.log(`✓ Todos los slugs contienen solo [a-z0-9-]`);
  }
}

// Main
async function main() {
  console.log("\n");
  console.log("╔" + "═".repeat(78) + "╗");
  console.log("║ TEST: SIMULACIÓN DE RUTA Y ENCODING".padEnd(79) + "║");
  console.log("╚" + "═".repeat(78) + "╝");

  try {
    await testSlugEncoding();
  } catch (error) {
    console.error(`\n✗ ERROR:`, error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
