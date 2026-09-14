/**
 * Test script: Valida la conexión a WooCommerce
 * Ejecutar: node test-woocommerce-connection.js
 */

// Leer variables desde .env manualmente
import fs from "fs";
import path from "path";

// Parsear .env
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

// Asignar al process.env
Object.assign(process.env, env);

async function testConnection() {
  console.log("\n🧪 PRUEBA DE CONEXIÓN WOOCOMMERCE\n");
  console.log("=".repeat(50));

  // 1. Verificar variables de entorno
  console.log("\n1️⃣  VALIDANDO VARIABLES DE ENTORNO:");
  const required = [
    "WOOCOMMERCE_URL",
    "WOOCOMMERCE_CONSUMER_KEY",
    "WOOCOMMERCE_CONSUMER_SECRET",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.log("❌ FALTA:", missing.join(", "));
    return;
  }

  console.log("✅ WOOCOMMERCE_URL:", process.env.WOOCOMMERCE_URL);
  console.log(
    "✅ WOOCOMMERCE_CONSUMER_KEY:",
    process.env.WOOCOMMERCE_CONSUMER_KEY.substring(0, 10) + "..."
  );
  console.log(
    "✅ WOOCOMMERCE_CONSUMER_SECRET:",
    process.env.WOOCOMMERCE_CONSUMER_SECRET.substring(0, 10) + "..."
  );

  // 2. Generar Basic Auth
  console.log("\n2️⃣  GENERANDO BASIC AUTH:");
  const credentials = `${process.env.WOOCOMMERCE_CONSUMER_KEY}:${process.env.WOOCOMMERCE_CONSUMER_SECRET}`;
  const encoded = Buffer.from(credentials).toString("base64");
  const authHeader = `Basic ${encoded}`;
  console.log("✅ Authorization header generado (", authHeader.length, "chars )");

  // 3. Hacer petición a WooCommerce
  console.log("\n3️⃣  CONECTANDO A WOOCOMMERCE:");
  console.log(
    `   Petición: GET ${process.env.WOOCOMMERCE_URL}/wp-json/wc/v3/products?per_page=3`
  );

  try {
    const response = await fetch(
      `${process.env.WOOCOMMERCE_URL}/wp-json/wc/v3/products?per_page=3`,
      {
        method: "GET",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`   Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const error = await response.json();
      console.log("❌ ERROR:", error.message);
      return;
    }

    const products = await response.json();

    // 4. Mostrar resultados
    console.log("\n4️⃣  RESULTADOS:");
    console.log(`✅ Conexión exitosa!`);
    console.log(`✅ Productos obtenidos: ${products.length}`);

    if (products.length > 0) {
      console.log("\n📦 PRODUCTOS DEVUELTOS:");
      products.forEach((p, i) => {
        console.log(
          `\n   ${i + 1}. ${p.name}`
        );
        console.log(`      ID: ${p.id}`);
        console.log(`      Slug: ${p.slug}`);
        console.log(`      Precio: €${p.price}`);
        console.log(`      Precio regular: €${p.regular_price}`);
        if (p.sale_price) console.log(`      Precio oferta: €${p.sale_price}`);
        console.log(`      SKU: ${p.sku || "N/A"}`);
        console.log(`      Stock: ${p.stock_quantity ?? "No gestionado"}`);
        console.log(`      Destacado: ${p.featured ? "Sí" : "No"}`);
        console.log(
          `      Categorías: ${p.categories.map((c) => c.name).join(", ") || "Ninguna"}`
        );
        if (p.images.length > 0) {
          console.log(`      Imagen: ${p.images[0].src}`);
        }
      });
    }

    console.log("\n" + "=".repeat(50));
    console.log("✅ PRUEBA COMPLETADA CON ÉXITO\n");
    console.log("🎯 LA CONEXIÓN WOOCOMMERCE ↔ VERCEL FUNCIONA\n");
  } catch (error) {
    console.log("\n❌ ERROR DE CONEXIÓN:");
    console.log(error.message);
    console.log("\n" + "=".repeat(50));
    console.log("❌ PRUEBA FALLIDA\n");
  }
}

testConnection();
