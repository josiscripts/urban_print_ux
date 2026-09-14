/**
 * Test detallado FASE 2: Investigar estructura de productos WooCommerce
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

console.log("\n" + "=".repeat(70));
console.log("🔍 INVESTIGACIÓN DETALLADA: PRECIOS EN WOOCOMMERCE");
console.log("=".repeat(70) + "\n");

const credentials = `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`;
const encoded = Buffer.from(credentials).toString("base64");
const authHeader = `Basic ${encoded}`;

const productsRes = await fetch(
  `${process.env.WOOCOMMERCE_URL}/wp-json/wc/v3/products?per_page=5`,
  {
    headers: { Authorization: authHeader, "Content-Type": "application/json" },
  }
);

const wooProducts = await productsRes.json();

console.log(`📦 PRODUCTOS OBTENIDOS: ${wooProducts.length}\n`);

wooProducts.forEach((p, i) => {
  console.log(`${i + 1}. ${p.name}`);
  console.log(`   ID: ${p.id}`);
  console.log(`   Slug: "${p.slug}"`);
  console.log(`   Type: ${p.type}`);
  console.log(`   Price: "${p.price}" (${typeof p.price})`);
  console.log(`   Regular Price: "${p.regular_price}" (${typeof p.regular_price})`);
  console.log(`   Sale Price: "${p.sale_price}" (${typeof p.sale_price})`);
  console.log(`   Featured: ${p.featured}`);
  console.log(`   Stock Quantity: ${p.stock_quantity}`);
  console.log(`   Stock Status: ${p.stock_status}`);
  console.log(`   Categories: ${p.categories.length}`);
  p.categories.forEach((c) => console.log(`      - ${c.name} (ID: ${c.id})`));
  console.log("");
});

// Buscar productos con precio válido
console.log("\n🔍 ANÁLISIS DE PRECIOS:");
const productsWithPrice = wooProducts.filter((p) => p.price && parseFloat(p.price));
const productsWithoutPrice = wooProducts.filter((p) => !p.price || !parseFloat(p.price));
const productsVariable = wooProducts.filter((p) => p.type === "variable");

console.log(`  • Con precio válido: ${productsWithPrice.length}`);
console.log(`  • Sin precio: ${productsWithoutPrice.length}`);
console.log(`  • Tipo "variable": ${productsVariable.length}`);

if (productsVariable.length > 0) {
  console.log("\n  ℹ️  Productos variables encontrados. Deben obtener precio de variaciones.");
  console.log(`      (GET /products/{id}/variations)\n`);
}

// Si hay productos sin precio, obtener más información
if (productsWithoutPrice.length > 0) {
  console.log("\n📋 PRODUCTOS SIN PRECIO:");
  productsWithoutPrice.forEach((p) => {
    console.log(`  • ${p.name} (ID: ${p.id}, Type: ${p.type})`);
  });
}
