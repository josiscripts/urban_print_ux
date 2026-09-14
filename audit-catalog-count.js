/**
 * AUDITORÍA: ¿Cuántos productos tiene realmente el catálogo?
 *
 * Verifica:
 * 1. Total de productos en WooCommerce
 * 2. Lo que obtiene con per_page: 100
 * 3. Si existe paginación
 * 4. Lo que obtiene la aplicación actualmente
 */

import fs from "fs";
import path from "path";

console.log("\n" + "=".repeat(80));
console.log("🔍 AUDITORÍA: CONTEO DEL CATÁLOGO");
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

const credentials = `${WOOCOMMERCE_CONSUMER_KEY}:${WOOCOMMERCE_CONSUMER_SECRET}`;
const encoded = Buffer.from(credentials).toString("base64");
const authHeader = `Basic ${encoded}`;

(async () => {
  try {
    console.log("\n📡 CONSULTANDO WOOCOMMERCE...\n");

    // PRUEBA 1: Obtener con per_page: 100 (como hace la app actualmente)
    console.log("1️⃣  Obteniendo con per_page: 100 (configuración actual)");
    const res100 = await fetch(
      `${WOOCOMMERCE_URL}/wp-json/wc/v3/products?per_page=100`,
      {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res100.ok) {
      throw new Error(`HTTP ${res100.status}: ${res100.statusText}`);
    }

    const products100 = await res100.json();
    const totalHeader = res100.headers.get("x-wp-total");
    const totalPagesHeader = res100.headers.get("x-wp-totalpages");

    console.log(`   ✅ Respuesta obtenida`);
    console.log(`   📊 Productos en esta página: ${products100.length}`);
    console.log(
      `   📊 Total en WooCommerce (header x-wp-total): ${totalHeader}`
    );
    console.log(
      `   📊 Total de páginas (header x-wp-totalpages): ${totalPagesHeader}`
    );

    // PRUEBA 2: Obtener solo la primera página con per_page: 1 para verificar headers
    console.log(
      "\n2️⃣  Verificando headers de paginación con per_page: 1"
    );
    const res1 = await fetch(
      `${WOOCOMMERCE_URL}/wp-json/wc/v3/products?per_page=1`,
      {
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
      }
    );

    if (res1.ok) {
      const total1 = res1.headers.get("x-wp-total");
      const pages1 = res1.headers.get("x-wp-totalpages");
      console.log(`   ✅ Verificado`);
      console.log(`   📊 Total: ${total1}`);
      console.log(`   📊 Páginas: ${pages1}`);
    }

    // ANÁLISIS
    console.log("\n" + "=".repeat(80));
    console.log("📊 ANÁLISIS");
    console.log("=".repeat(80));

    const totalProducts = parseInt(totalHeader);
    const totalPages = parseInt(totalPagesHeader);

    console.log(`\nWooCommerce tiene: ${totalProducts} productos`);
    console.log(`En ${totalPages} página(s) (con per_page: 100)`);
    console.log(`La aplicación obtiene: ${products100.length} productos`);

    if (totalProducts === products100.length) {
      console.log(
        `\n✅ CORRECTO: Con per_page: 100 se obtienen todos los productos`
      );
      console.log(`   No existe paginación real, o los productos caben en 1 página.`);
    } else {
      console.log(
        `\n⚠️  ATENCIÓN: Existen ${totalProducts - products100.length} productos más`
      );
      console.log(
        `   Necesita paginación para obtener todas los productos.`
      );
      console.log(`   Productos faltantes: ${totalProducts - products100.length}`);
      console.log(`   Páginas adicionales necesarias: ${totalPages - 1}`);
    }

    // LISTA DE PRODUCTOS
    console.log("\n" + "=".repeat(80));
    console.log("📋 PRODUCTOS OBTENIDOS");
    console.log("=".repeat(80) + "\n");

    console.log(
      "ID    │ Nombre                              │ Slug"
    );
    console.log(
      "──────┼─────────────────────────────────────┼──────────────────────────────"
    );

    products100.forEach((p) => {
      const name = p.name.substring(0, 35).padEnd(35);
      const slug = (p.slug || "(vacío)").substring(0, 28);
      console.log(
        `${String(p.id).padEnd(5)}│ ${name} │ ${slug}`
      );
    });

    console.log("\n" + "=".repeat(80));
    console.log("✅ AUDITORÍA COMPLETADA");
    console.log("=".repeat(80) + "\n");

    // CONCLUSIÓN
    console.log("📌 CONCLUSIÓN:");
    console.log(
      `   WooCommerce: ${totalProducts} productos`
    );
    console.log(
      `   Aplicación obtiene: ${products100.length} productos`
    );

    if (totalProducts <= 100) {
      console.log(`   ✅ No requiere paginación`);
    } else {
      console.log(`   ⚠️  Requiere paginación para obtener todos`);
    }

    console.log("");
  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}\n`);
    process.exit(1);
  }
})();
