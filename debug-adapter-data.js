/**
 * DEBUG: Verifica exactamente qué datos devuelve el adaptador
 * para los 5 productos de prueba
 */

import fs from "fs";
import path from "path";

console.log("\n" + "=".repeat(80));
console.log("🔍 DEBUG: DATOS REALES DEL ADAPTADOR");
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

const DEMO_PRICES = {
  6590: 29.9,
  6589: 19.9,
  6586: 24.9,
  6585: 34.9,
  6584: 39.9,
};

function getDemoPrice(id) {
  return DEMO_PRICES[id] ?? null;
}

function stripHtmlTags(html) {
  if (!html) return null;
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim() || null;
}

const credentials = `${WOOCOMMERCE_CONSUMER_KEY}:${WOOCOMMERCE_CONSUMER_SECRET}`;
const encoded = Buffer.from(credentials).toString("base64");
const authHeader = `Basic ${encoded}`;

(async () => {
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

    wooProducts.slice(0, 5).forEach((wooProd, index) => {
      console.log(`\n${"─".repeat(80)}`);
      console.log(`PRODUCTO ${index + 1}: ${wooProd.name}`);
      console.log(`${"─".repeat(80)}`);

      // Simular la lógica del adaptador
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

      if (priceNumber === 0) {
        const demoPrice = getDemoPrice(wooProd.id);
        if (demoPrice !== null) {
          priceNumber = demoPrice;
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

      console.log("\nDATA ADAPTADO:");
      console.log(`  id: "${wooProd.id}"`);
      console.log(`  name: "${wooProd.name}"`);
      console.log(`  slug: "${wooProd.slug}"`);
      console.log(`  price: ${priceNumber}`);
      console.log(`  featured: ${wooProd.featured}`);
      console.log(`  category_id: "${categoryId}"`);
      console.log(`  description: ${cleanDescription ? `"${cleanDescription.substring(0, 50)}..."` : "null"}`);
      console.log(`  image: ${imageUrl ? `"${imageUrl.substring(0, 60)}..."` : "null"}`);

      console.log("\nWOOCOMMERCE ORIGINALES:");
      console.log(`  wooProd.images.length: ${wooProd.images?.length || 0}`);
      if (wooProd.images?.length > 0) {
        console.log(`  wooProd.images[0].src: "${wooProd.images[0].src}"`);
      }
      console.log(`  wooProd.short_description: ${wooProd.short_description ? `"${wooProd.short_description.substring(0, 50)}..."` : "empty"}`);
      console.log(`  wooProd.description: ${wooProd.description ? `"${wooProd.description.substring(0, 50)}..."` : "empty"}`);

      console.log("\n_WOO METADATOS:");
      console.log(`  _woo.woo_images.length: ${wooProd.images?.length || 0}`);
      if (wooProd.images?.length > 0) {
        console.log(`  _woo.woo_images[0].src: "${wooProd.images[0].src}"`);
      }

      // Comprobaciones
      console.log("\n✅ COMPROBACIONES:");
      const hasImage = imageUrl !== null;
      const imageMatchesWoo =
        hasImage &&
        wooProd.images?.length > 0 &&
        imageUrl === wooProd.images[0].src;

      console.log(
        `  ✓ product.image tiene valor: ${hasImage ? "SÍ" : "NO"}`
      );
      console.log(
        `  ✓ product.image coincide con wooProd.images[0].src: ${imageMatchesWoo ? "SÍ" : "NO"}`
      );
      console.log(
        `  ✓ description limpia: ${cleanDescription !== null ? "SÍ" : "NO"}`
      );
      console.log(`  ✓ precio: ${priceNumber}€`);
    });

    console.log("\n" + "=".repeat(80));
    console.log("✅ DEBUG COMPLETADO");
    console.log("=".repeat(80) + "\n");
  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}\n`);
    process.exit(1);
  }
})();
