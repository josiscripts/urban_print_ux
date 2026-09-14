/**
 * AUDITORÍA READ-ONLY: Estructura de precios en WooCommerce
 * NO MODIFICA NADA - Solo analiza e informa
 */

import fs from "fs";
import path from "path";

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
Object.assign(process.env, env);

const credentials = `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`;
const encoded = Buffer.from(credentials).toString("base64");
const authHeader = `Basic ${encoded}`;

console.log("\n" + "=".repeat(80));
console.log("🔍 AUDITORÍA READ-ONLY: ESTRUCTURA DE PRECIOS WOOCOMMERCE");
console.log("=".repeat(80) + "\n");

try {
  // Obtener TODOS los productos (sin límite de paginación, pero máximo 100 por request)
  const allProducts = [];
  let page = 1;
  let hasMore = true;

  console.log("📥 Obteniendo todos los productos de WooCommerce...\n");

  while (hasMore) {
    const res = await fetch(
      `${process.env.WOOCOMMERCE_URL}/wp-json/wc/v3/products?per_page=100&page=${page}`,
      {
        headers: { Authorization: authHeader, "Content-Type": "application/json" },
      }
    );

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const products = await res.json();
    allProducts.push(...products);

    // Verificar si hay más páginas
    const totalPages = parseInt(res.headers.get("x-wp-totalpages") || "1");
    page++;
    hasMore = page <= totalPages;

    process.stdout.write(`  Página ${page - 1}/${totalPages}...`);
    if (hasMore) {
      process.stdout.write("\r");
    } else {
      console.log(" ✅");
    }
  }

  console.log(`\n✅ Total de productos obtenidos: ${allProducts.length}\n`);

  // ESTADÍSTICAS GENERALES
  console.log("📊 ESTADÍSTICAS GENERALES:");
  console.log("-".repeat(80));

  const stats = {
    total: allProducts.length,
    simple: 0,
    variable: 0,
    grouped: 0,
    external: 0,
    other: 0,
    conPrecio: 0,
    sinPrecio: 0,
    conRegularPrice: 0,
    conSalePrice: 0,
    variableConVariations: 0,
    variableSinVariations: 0,
  };

  allProducts.forEach((p) => {
    // Tipo de producto
    switch (p.type) {
      case "simple":
        stats.simple++;
        break;
      case "variable":
        stats.variable++;
        break;
      case "grouped":
        stats.grouped++;
        break;
      case "external":
        stats.external++;
        break;
      default:
        stats.other++;
    }

    // Precio
    if (p.price && p.price.trim()) {
      stats.conPrecio++;
    } else {
      stats.sinPrecio++;
    }

    // Regular price
    if (p.regular_price && p.regular_price.trim()) {
      stats.conRegularPrice++;
    }

    // Sale price
    if (p.sale_price && p.sale_price.trim()) {
      stats.conSalePrice++;
    }
  });

  console.log(`Tipos de producto:`);
  console.log(`  • Simple: ${stats.simple}`);
  console.log(`  • Variable: ${stats.variable}`);
  console.log(`  • Grouped: ${stats.grouped}`);
  console.log(`  • External: ${stats.external}`);
  console.log(`  • Otros: ${stats.other}`);

  console.log(`\nPrecios:`);
  console.log(`  • Con precio (price): ${stats.conPrecio} (${((stats.conPrecio / stats.total) * 100).toFixed(1)}%)`);
  console.log(`  • SIN precio (price vacío): ${stats.sinPrecio} (${((stats.sinPrecio / stats.total) * 100).toFixed(1)}%)`);
  console.log(`  • Con regular_price: ${stats.conRegularPrice}`);
  console.log(`  • Con sale_price: ${stats.conSalePrice}`);

  // ANÁLISIS DETALLADO DE PRODUCTOS SIN PRECIO
  console.log("\n" + "=".repeat(80));
  console.log("🔴 ANÁLISIS: PRODUCTOS SIN PRECIO (price vacío)");
  console.log("=".repeat(80) + "\n");

  const productossinprecio = allProducts.filter((p) => !p.price || !p.price.trim());
  console.log(`Total: ${productossinprecio.length}/${allProducts.length}\n`);

  // Detalles de primeros 10
  console.log("Primeros 10 productos sin precio:");
  console.log("-".repeat(80));
  productossinprecio.slice(0, 10).forEach((p, i) => {
    console.log(`\n${i + 1}. ${p.name}`);
    console.log(`   ID: ${p.id}`);
    console.log(`   Type: ${p.type}`);
    console.log(`   Price: "${p.price || "(vacío)"}" | Regular: "${p.regular_price || "(vacío)"}" | Sale: "${p.sale_price || "(vacío)"}"`);
    console.log(`   Categories: ${p.categories.length}`);
    if (p.type === "variable") {
      console.log(`   ⚠️  VARIABLE - revisar variaciones`);
    }
  });

  // ANÁLISIS DE PRODUCTOS VARIABLES
  console.log("\n" + "=".repeat(80));
  console.log("🔵 ANÁLISIS: PRODUCTOS VARIABLES (pueden tener precio en variaciones)");
  console.log("=".repeat(80) + "\n");

  const variables = allProducts.filter((p) => p.type === "variable");
  console.log(`Total variables: ${variables.length}\n`);

  if (variables.length > 0) {
    console.log("Primeros 5 productos variables:");
    console.log("-".repeat(80));

    for (let i = 0; i < Math.min(5, variables.length); i++) {
      const varProduct = variables[i];
      console.log(`\n${i + 1}. ${varProduct.name}`);
      console.log(`   ID: ${varProduct.id}`);
      console.log(`   Price: "${varProduct.price || "(vacío)"}" | Regular: "${varProduct.regular_price || "(vacío)"}" | Sale: "${varProduct.sale_price || "(vacío)"}"`);

      // Obtener variaciones
      const varRes = await fetch(
        `${process.env.WOOCOMMERCE_URL}/wp-json/wc/v3/products/${varProduct.id}/variations?per_page=5`,
        {
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
        }
      );

      if (varRes.ok) {
        const variations = await varRes.json();
        console.log(`   Variaciones: ${variations.length}`);
        variations.slice(0, 3).forEach((v) => {
          console.log(
            `     • ${v.attributes.map((a) => `${a.name}: ${a.option}`).join(", ")} → Price: "${v.price || "(vacío)"}"`
          );
        });
      }
    }
  }

  // RESUMEN DE PROBLEMAS
  console.log("\n" + "=".repeat(80));
  console.log("⚠️  RESUMEN DE HALLAZGOS");
  console.log("=".repeat(80) + "\n");

  console.log("🔴 CRÍTICO:");
  console.log(`  • ${stats.sinPrecio} productos SIN precio configurado (${((stats.sinPrecio / stats.total) * 100).toFixed(1)}%)`);
  console.log(`  • Estos productos mostrarán precio 0 en el frontend`);
  console.log(`  • Adaptador los maneja sin fallar, pero es incorrecto\n`);

  console.log("🟡 IMPORTANTE:");
  if (stats.variable > 0) {
    console.log(
      `  • ${stats.variable} productos variables: revisar si tienen precio en variaciones`
    );
  }
  if (stats.conSalePrice > 0) {
    console.log(`  • ${stats.conSalePrice} productos con sale_price (ofertas activas)`);
  }
  console.log(`  • ${stats.conRegularPrice} productos con regular_price`);

  console.log("\n🟢 LISTO:");
  console.log(`  • ${stats.conPrecio} productos con precio válido`);

  // RECOMENDACIONES
  console.log("\n" + "=".repeat(80));
  console.log("✅ RECOMENDACIONES");
  console.log("=".repeat(80) + "\n");

  console.log("1. ACCIÓN REQUERIDA EN WOOCOMMERCE:");
  console.log(`   → Configurar precios para los ${stats.sinPrecio} productos sin precio`);
  console.log(`   → URL: https://urbanprint.es/wp-admin/edit.php?post_type=product`);

  console.log("\n2. ADAPTADOR ACTUAL:");
  console.log("   ✅ Maneja correctamente productos sin precio (asigna 0, loguea warning)");
  console.log("   ✅ Preserva metadatos de precios originales para debuggeo");
  console.log("   ✅ No rompe en frontend");

  console.log("\n3. PRÓXIMOS PASOS:");
  console.log("   → Configurar precios en WooCommerce");
  console.log("   → Verificar que sale_price/regular_price sean interpretados correctamente");
  console.log("   → Re-auditar después de configurar precios\n");

  console.log("=".repeat(80));
} catch (error) {
  console.log(`❌ ERROR: ${error.message}\n`);
  process.exit(1);
}
