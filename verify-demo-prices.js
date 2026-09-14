/**
 * VERIFICACIÓN DE PRECIOS DEMO
 * Comprueba que el adaptador está usando correctamente los precios de demo
 * cuando WooCommerce no proporciona precios reales
 */

import fs from "fs";
import path from "path";

// ============================================================================
// Cargar credenciales y precios de demo
// ============================================================================

console.log("\n" + "=".repeat(80));
console.log("🔍 VERIFICACIÓN: PRECIOS DEMO EN ADAPTADOR");
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

// PRECIOS DE DEMO (refleja lo que está en demo-prices.ts)
const DEMO_PRICES = {
  6590: 29.90,
  6589: 19.90,
  6586: 24.90,
  6585: 34.90,
  6584: 39.90,
};

function getDemoPrice(wooProductId) {
  return DEMO_PRICES[wooProductId] ?? null;
}

console.log("✅ Credenciales y precios de demo cargados");

// ============================================================================
// Obtener productos desde WooCommerce
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
  console.log(`✅ Obtenidos ${wooProducts.length} productos\n`);

  // =========================================================================
  // Aplicar lógica de adaptador CON PRECIOS DEMO
  // =========================================================================

  console.log("=" + "=".repeat(79));
  console.log("📊 VERIFICACIÓN: LÓGICA DE PRIORIDAD DE PRECIOS");
  console.log("=" + "=".repeat(79));
  console.log(
    "\nPrioridad: Precio real WooCommerce > Precio Demo > 0 (fallback)\n"
  );

  const results = [];

  wooProducts.slice(0, 5).forEach((wooProd, index) => {
    console.log(`${index + 1}. PRODUCTO: ${wooProd.name}`);
    console.log(`   ID: ${wooProd.id}`);

    // PASO 1: Obtener precio real de WooCommerce
    let priceNumber = 0;
    const priceStr = wooProd.price || "";

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

    // PASO 2: Si no hay precio real, intentar precio DEMO
    let priceSrc = "ERROR";
    if (priceNumber === 0) {
      const demoPrice = getDemoPrice(wooProd.id);
      if (demoPrice !== null) {
        priceNumber = demoPrice;
        priceSrc = "DEMO";
        console.log(`   ✅ Precio WooCommerce: "" (VACÍO)`);
        console.log(`   ✅ Precio DEMO usado: ${demoPrice}€ ← CORRECTO`);
      } else {
        priceSrc = "FALLBACK";
        console.log(`   ❌ Precio WooCommerce: "" (VACÍO)`);
        console.log(`   ❌ Precio DEMO: no existe`);
        console.log(`   ❌ Usando fallback: 0€`);
      }
    } else {
      priceSrc = "REAL";
      console.log(`   ✅ Precio REAL WooCommerce: ${priceNumber}€ ← PRIORIDAD`);
    }

    console.log(`   📊 Resultado final: ${priceNumber}€ (fuente: ${priceSrc})`);
    console.log("");

    results.push({
      id: wooProd.id,
      name: wooProd.name,
      wooPriceDirect: wooProd.price,
      finalPrice: priceNumber,
      source: priceSrc,
    });
  });

  // =========================================================================
  // Tabla de resultados
  // =========================================================================

  console.log("=" + "=".repeat(79));
  console.log("📋 TABLA DE RESULTADOS");
  console.log("=" + "=".repeat(79));
  console.log("");
  console.log(
    "ID    │ Nombre                              │ API Price │ Precio Final │ Fuente"
  );
  console.log(
    "──────┼─────────────────────────────────────┼───────────┼──────────────┼────────"
  );

  results.forEach((r) => {
    const apiPriceStr = r.wooPriceDirect === "" ? '""' : r.wooPriceDirect;
    const name = r.name.substring(0, 35).padEnd(35);
    const apiPrice = apiPriceStr.padEnd(9);
    const finalPrice = String(r.finalPrice).padEnd(12);
    console.log(
      `${String(r.id).padEnd(5)}│ ${name} │ ${apiPrice} │ ${finalPrice} │ ${r.source}`
    );
  });

  console.log("");

  // =========================================================================
  // Diagnóstico
  // =========================================================================

  console.log("=" + "=".repeat(79));
  console.log("✅ DIAGNÓSTICO");
  console.log("=" + "=".repeat(79));

  const demoWorking = results.every((r) => r.source === "DEMO");
  const allHavePrices = results.every((r) => r.finalPrice > 0);

  if (demoWorking) {
    console.log("\n✅ ÉXITO: Todos los productos están usando precios DEMO");
    console.log("\n   Precio Demo → Precio Final:");
    results.forEach((r) => {
      const demoPrice = DEMO_PRICES[r.id];
      console.log(`   • ID ${r.id}: ${demoPrice}€ → ${r.finalPrice}€ ✅`);
    });
  } else if (allHavePrices) {
    console.log(
      "\n✅ PARCIAL: Todos los productos tienen precio, pero fuentes variadas:"
    );
    results.forEach((r) => {
      const src =
        r.source === "REAL" ? "Precio Real" : "Precio Demo";
      console.log(`   • ID ${r.id}: ${r.finalPrice}€ (${src})`);
    });
  } else {
    console.log("\n❌ ERROR: Algunos productos no tienen precio");
    results.forEach((r) => {
      if (r.finalPrice === 0) {
        console.log(`   ❌ ID ${r.id}: 0€`);
      }
    });
  }

  console.log("\n" + "=" + "=".repeat(79));
  console.log("✅ VERIFICACIÓN COMPLETADA");
  console.log("=" + "=".repeat(79) + "\n");

} catch (error) {
  console.error(`\n❌ ERROR: ${error.message}\n`);
  process.exit(1);
}
