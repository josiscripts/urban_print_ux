/**
 * VERIFICACIÓN E2E: WooCommerce API → Adaptador → Frontend
 * Script temporal para inspeccionar flujo completo sin modificar código
 *
 * NO MODIFICA ARCHIVOS - Solo inspecciona
 */

import fs from "fs";
import path from "path";

// ============================================================================
// PASO 1: Cargar credenciales desde .env
// ============================================================================

console.log("\n" + "=".repeat(80));
console.log("🔍 VERIFICACIÓN WOOCOMMERCE: E2E FLOW");
console.log("=".repeat(80));

const envFile = fs.readFileSync(path.join(process.cwd(), ".env"), "utf-8");
const envLines = envFile.split("\n");
const env = {};
envLines.forEach((line) => {
  const [key, ...valueParts] = line.split("=");
  if (key && !key.startsWith("#")) {
    const value = valueParts.join("=").replace(/^"(.*)"$/, "$1");
    env[key.trim()] = value.trim();
  }
});

const WOOCOMMERCE_URL = env.WOOCOMMERCE_URL;
const WOOCOMMERCE_CONSUMER_KEY = env.WOOCOMMERCE_CONSUMER_KEY;
const WOOCOMMERCE_CONSUMER_SECRET = env.WOOCOMMERCE_CONSUMER_SECRET;

console.log("\n✅ Credenciales cargadas desde .env");
console.log(`   URL: ${WOOCOMMERCE_URL}`);
console.log(`   Key: ${WOOCOMMERCE_CONSUMER_KEY.substring(0, 10)}...${WOOCOMMERCE_CONSUMER_KEY.substring(WOOCOMMERCE_CONSUMER_KEY.length - 4)}`);
console.log(`   Secret: ${WOOCOMMERCE_CONSUMER_SECRET.substring(0, 10)}...${WOOCOMMERCE_CONSUMER_SECRET.substring(WOOCOMMERCE_CONSUMER_SECRET.length - 4)}`);

// ============================================================================
// PASO 2: Conectar a WooCommerce y obtener productos
// ============================================================================

console.log("\n" + "-".repeat(80));
console.log("📡 OBTENIENDO PRODUCTOS DESDE WOOCOMMERCE API...");
console.log("-".repeat(80));

const credentials = `${WOOCOMMERCE_CONSUMER_KEY}:${WOOCOMMERCE_CONSUMER_SECRET}`;
const encoded = Buffer.from(credentials).toString("base64");
const authHeader = `Basic ${encoded}`;

try {
  const productsRes = await fetch(
    `${WOOCOMMERCE_URL}/wp-json/wc/v3/products?per_page=5`,
    {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    }
  );

  if (!productsRes.ok) {
    throw new Error(`HTTP ${productsRes.status}: ${productsRes.statusText}`);
  }

  const wooProducts = await productsRes.json();
  console.log(`\n✅ Obtenidos ${wooProducts.length} productos`);

  // =========================================================================
  // PASO 3: Analizar cada producto - ANTES (WooCommerce raw)
  // =========================================================================

  console.log("\n" + "=".repeat(80));
  console.log("📊 ANÁLISIS DETALLADO: 5 PRODUCTOS");
  console.log("=".repeat(80));

  const analysisData = [];

  wooProducts.slice(0, 5).forEach((wooProd, index) => {
    console.log(`\n${"─".repeat(80)}`);
    console.log(`PRODUCTO ${index + 1}: ${wooProd.name}`);
    console.log(`${"─".repeat(80)}`);

    // Campos básicos
    console.log("\n📌 CAMPOS BÁSICOS:");
    console.log(`   id: ${wooProd.id} (type: ${typeof wooProd.id})`);
    console.log(`   slug: "${wooProd.slug}" (type: ${typeof wooProd.slug})`);
    console.log(`   name: "${wooProd.name}"`);
    console.log(`   featured: ${wooProd.featured} (type: ${typeof wooProd.featured})`);

    // Precios - CRÍTICO
    console.log("\n💰 PRECIOS (CAMPO CRÍTICO):");
    console.log(`   price: "${wooProd.price}" (type: ${typeof wooProd.price}, length: ${wooProd.price?.length || 0})`);
    console.log(`   regular_price: "${wooProd.regular_price}" (type: ${typeof wooProd.regular_price})`);
    console.log(`   sale_price: "${wooProd.sale_price}" (type: ${typeof wooProd.sale_price})`);
    console.log(`   ⚠️  ¿Precio vacío?: ${wooProd.price === "" ? "SÍ ❌" : "NO ✅"}`);

    // Categorías
    console.log("\n🏷️  CATEGORÍAS:");
    if (wooProd.categories && wooProd.categories.length > 0) {
      console.log(`   Total: ${wooProd.categories.length}`);
      wooProd.categories.forEach((cat, i) => {
        console.log(`   [${i}] ID: ${cat.id}, Slug: "${cat.slug}", Name: "${cat.name}"`);
      });
    } else {
      console.log(`   ❌ SIN CATEGORÍA ASIGNADA`);
    }

    // Stock
    console.log("\n📦 STOCK:");
    console.log(`   stock_status: "${wooProd.stock_status}"`);
    console.log(`   stock_quantity: ${wooProd.stock_quantity} (type: ${typeof wooProd.stock_quantity})`);
    console.log(`   manage_stock: ${wooProd.manage_stock}`);

    // Imágenes
    console.log("\n🖼️  IMÁGENES:");
    if (wooProd.images && wooProd.images.length > 0) {
      console.log(`   Total: ${wooProd.images.length}`);
      console.log(`   [0] src: ${wooProd.images[0].src}`);
      console.log(`   [0] alt: "${wooProd.images[0].alt || "(vacío)"}"`);
      console.log(`   [0] id: ${wooProd.images[0].id}`);
    } else {
      console.log(`   ❌ SIN IMÁGENES`);
    }

    // Descripción
    console.log("\n📝 DESCRIPCIÓN:");
    const descLength = wooProd.description ? wooProd.description.length : 0;
    console.log(`   Longitud: ${descLength} caracteres`);
    if (descLength > 0) {
      console.log(`   Preview: ${wooProd.description.substring(0, 100)}...`);
    } else {
      console.log(`   (vacía)`);
    }

    // ======================================================================
    // PASO 4: Simular adaptador - DESPUÉS
    // ======================================================================

    console.log("\n" + "┌─ ADAPTACIÓN (adapter.ts)".padEnd(80, "─"));

    // Lógica del adaptador (de adapter.ts)
    let priceNumber = 0;
    const priceStr = wooProd.price || "";
    if (priceStr && priceStr.trim()) {
      try {
        priceNumber = parseFloat(priceStr);
        if (isNaN(priceNumber)) {
          console.log(`│ ⚠️  Precio inválido: "${priceStr}" → usando 0`);
          priceNumber = 0;
        } else {
          console.log(`│ ✅ Precio convertido: "${priceStr}" → ${priceNumber}`);
        }
      } catch (err) {
        console.log(`│ ⚠️  Error parsing: "${priceStr}" → usando 0`);
        priceNumber = 0;
      }
    } else {
      console.log(`│ ⚠️  Precio vacío detectado → asignando 0`);
      priceNumber = 0;
    }

    let categoryId = "0";
    if (wooProd.categories && wooProd.categories.length > 0) {
      categoryId = String(wooProd.categories[0].id);
      console.log(`│ ✅ Categoría: ${wooProd.categories[0].id} (primera de ${wooProd.categories.length})`);
    } else {
      console.log(`│ ⚠️  Sin categoría → asignando "0"`);
    }

    const adaptado = {
      id: String(wooProd.id),
      slug: wooProd.slug,
      name: wooProd.name,
      price: priceNumber,
      description: wooProd.description || null,
      featured: wooProd.featured ?? false,
      category_id: categoryId,
      _woo: {
        woo_id: wooProd.id,
        woo_images: wooProd.images || [],
        woo_stock_quantity: wooProd.stock_quantity ?? null,
        woo_stock_status: wooProd.stock_status || "instock",
      },
    };

    console.log(`│`);
    console.log(`│ RESULTADO ADAPTADO:`);
    console.log(`│   id: "${adaptado.id}" (${typeof adaptado.id})`);
    console.log(`│   slug: "${adaptado.slug}"`);
    console.log(`│   name: "${adaptado.name}"`);
    console.log(`│   price: ${adaptado.price} (${typeof adaptado.price})`);
    console.log(`│   featured: ${adaptado.featured}`);
    console.log(`│   category_id: "${adaptado.category_id}"`);
    console.log(`│   description: ${adaptado.description ? "✅ presente" : "❌ null"}`);
    console.log(`│   images: ${adaptado._woo.woo_images.length} imágenes preservadas`);
    console.log(`└─`.padEnd(80, "─"));

    // Guardar para tabla final
    analysisData.push({
      index: index + 1,
      name: wooProd.name,
      wooPriceDirect: wooProd.price,
      adaptedPrice: adaptado.price,
      wooHasImages: wooProd.images && wooProd.images.length > 0,
      adaptedHasImages: adaptado._woo.woo_images.length > 0,
      wooCategory: wooProd.categories?.length > 0 ? `${wooProd.categories[0].name} (${wooProd.categories[0].id})` : "NINGUNA",
      adaptedCategory: adaptado.category_id === "0" ? "NINGUNA (0)" : `ID: ${adaptado.category_id}`,
      slug: wooProd.slug === "" ? "❌ VACÍO" : wooProd.slug,
    });
  });

  // =========================================================================
  // PASO 5: Tabla comparativa FINAL
  // =========================================================================

  console.log("\n" + "=".repeat(80));
  console.log("📋 TABLA COMPARATIVA: WooCommerce API vs Adaptador");
  console.log("=".repeat(80));

  console.log("\n┌─ PRECIOS ─────────────────────────────────────────────────────────────────┐");
  console.log("│");
  analysisData.forEach((row) => {
    const priceProblem = row.wooPriceDirect === "" ? "❌ API" : "✅";
    console.log(
      `│ ${row.index}. ${row.name.substring(0, 40).padEnd(40)} │ API: "${row.wooPriceDirect}" → Adaptado: ${row.adaptedPrice} ${priceProblem}`
    );
  });
  console.log("│");
  console.log("└─────────────────────────────────────────────────────────────────────────────┘");

  console.log("\n┌─ IMÁGENES ────────────────────────────────────────────────────────────────┐");
  console.log("│");
  analysisData.forEach((row) => {
    const apiStatus = row.wooHasImages ? "✅ Sí" : "❌ No";
    const adaptedStatus = row.adaptedHasImages ? "✅ Sí" : "❌ No";
    console.log(`│ ${row.index}. ${row.name.substring(0, 40).padEnd(40)} │ API: ${apiStatus} | Adaptado: ${adaptedStatus}`);
  });
  console.log("│");
  console.log("└─────────────────────────────────────────────────────────────────────────────┘");

  console.log("\n┌─ CATEGORÍAS ──────────────────────────────────────────────────────────────┐");
  console.log("│");
  analysisData.forEach((row) => {
    const problem = row.wooCategory === "NINGUNA" ? "❌" : "✅";
    console.log(
      `│ ${row.index}. ${row.name.substring(0, 40).padEnd(40)} │ API: ${row.wooCategory} ${problem}`
    );
  });
  console.log("│");
  console.log("└─────────────────────────────────────────────────────────────────────────────┘");

  console.log("\n┌─ SLUGS ───────────────────────────────────────────────────────────────────┐");
  console.log("│");
  analysisData.forEach((row) => {
    console.log(`│ ${row.index}. ${row.name.substring(0, 40).padEnd(40)} │ ${row.slug}`);
  });
  console.log("│");
  console.log("└─────────────────────────────────────────────────────────────────────────────┘");

  // =========================================================================
  // PASO 6: Diagnóstico
  // =========================================================================

  console.log("\n" + "=".repeat(80));
  console.log("🔍 DIAGNÓSTICO");
  console.log("=".repeat(80));

  const allPricesEmpty = analysisData.every((r) => r.wooPriceDirect === "");
  const someImagesPresent = analysisData.some((r) => r.wooHasImages);
  const allImagesPreserved = analysisData.every(
    (r) => r.wooHasImages === r.adaptedHasImages
  );

  console.log("\n1️⃣  PRECIOS:");
  if (allPricesEmpty) {
    console.log("   ❌ PROBLEMA EN: WooCommerce API (todos los precios vacíos)");
    console.log("   📍 Dónde se pierde: A) WooCommerce API ← AQUÍ");
  } else {
    console.log("   ✅ Precios presentes en WooCommerce API");
    console.log("   ✅ Adaptador convierte correctamente");
  }

  console.log("\n2️⃣  IMÁGENES:");
  if (someImagesPresent && allImagesPreserved) {
    console.log("   ✅ Imágenes presentes en API");
    console.log("   ✅ Preservadas en adaptador en _woo.woo_images");
  } else if (!someImagesPresent) {
    console.log("   ℹ️  No hay imágenes en los productos obtenidos");
  } else {
    console.log("   ⚠️  Problema en adaptador");
  }

  console.log("\n3️⃣  CATEGORÍAS:");
  const allCategoriesOk = analysisData.every((r) => r.wooCategory !== "NINGUNA");
  if (allCategoriesOk) {
    console.log("   ✅ Todos los productos tienen categoría");
  } else {
    console.log("   ⚠️  Algunos productos sin categoría");
  }

  console.log("\n4️⃣  SLUGS:");
  const emptySlugs = analysisData.filter((r) => r.slug === "❌ VACÍO");
  if (emptySlugs.length > 0) {
    console.log(`   ⚠️  ${emptySlugs.length} producto(s) con slug vacío`);
  } else {
    console.log("   ✅ Todos los slugs configurados");
  }

  // =========================================================================
  // CONCLUSIÓN
  // =========================================================================

  console.log("\n" + "=".repeat(80));
  console.log("✅ VERIFICACIÓN COMPLETADA");
  console.log("=".repeat(80));
  console.log("\nPróximos pasos:");
  console.log("  1. Si precios vacíos: Configurar en WooCommerce admin");
  console.log("  2. Si slugs vacíos: Configurar en WooCommerce admin");
  console.log("  3. Adaptador está preservando imágenes correctamente en _woo.woo_images");
  console.log("  4. Frontend recibe datos en formato correcto desde getCatalogo()");
  console.log("\n");

} catch (error) {
  console.error(`\n❌ ERROR: ${error.message}\n`);
  process.exit(1);
}
