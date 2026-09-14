/**
 * VERIFICACIÓN: Adaptador con imágenes y descripciones limpias
 * Verifica que los 5 productos tengan:
 * - Propiedad `image` con URL
 * - Descripción limpia (sin HTML)
 */

import fs from "fs";
import path from "path";

console.log("\n" + "=".repeat(80));
console.log("🔍 VERIFICACIÓN: ADAPTADOR CON IMÁGENES Y DESCRIPCIONES");
console.log("=".repeat(80));

// Cargar credenciales
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

// Precios demo
const DEMO_PRICES = {
  6590: 29.9,
  6589: 19.9,
  6586: 24.9,
  6585: 34.9,
  6584: 39.9,
};

// Función para limpiar HTML (igual a la del adaptador)
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
    console.log(`\n✅ Obtenidos ${wooProducts.length} productos\n`);

    console.log("=" + "=".repeat(79));
    console.log("📊 VERIFICACIÓN POR PRODUCTO");
    console.log("=" + "=".repeat(79) + "\n");

    const results = [];

    wooProducts.slice(0, 5).forEach((wooProd, index) => {
      console.log(`${index + 1}. ${wooProd.name}`);
      console.log(`   ID: ${wooProd.id}`);

      // IMAGEN
      let imageUrl = null;
      if (wooProd.images && wooProd.images.length > 0) {
        imageUrl = wooProd.images[0].src || null;
        console.log(
          `   ✅ Image: ${imageUrl.substring(0, 60)}...`
        );
      } else {
        console.log(`   ❌ Image: null (sin imágenes)`);
      }

      // DESCRIPCIÓN LIMPIA
      let cleanDescription = null;
      if (wooProd.short_description && wooProd.short_description.trim()) {
        cleanDescription = stripHtmlTags(wooProd.short_description);
      } else if (wooProd.description && wooProd.description.trim()) {
        cleanDescription = stripHtmlTags(wooProd.description);
      }

      const hasHtml = (text) => /<[^>]*>/.test(text);
      const htmlPresent =
        (wooProd.short_description && hasHtml(wooProd.short_description)) ||
        (wooProd.description && hasHtml(wooProd.description));

      if (cleanDescription) {
        const preview = cleanDescription.substring(0, 70);
        console.log(`   ✅ Description (limpia): "${preview}..."`);
        if (htmlPresent) {
          console.log(`      ✅ HTML removido correctamente`);
        }
      } else {
        console.log(`   ⚠️  Description: null`);
      }

      console.log("");

      results.push({
        id: wooProd.id,
        name: wooProd.name,
        hasImage: imageUrl !== null,
        imageUrl: imageUrl,
        hasDescription: cleanDescription !== null,
        descriptionPreview: cleanDescription
          ? cleanDescription.substring(0, 60)
          : "(vacía)",
        hasHtmlRemoved: htmlPresent && cleanDescription !== null,
      });
    });

    // TABLA DE RESULTADOS
    console.log("=" + "=".repeat(79));
    console.log("📋 TABLA DE RESULTADOS");
    console.log("=" + "=".repeat(79) + "\n");

    console.log(
      "ID    │ Name                    │ Image      │ Description │ HTML Limpio"
    );
    console.log(
      "──────┼─────────────────────────┼────────────┼─────────────┼────────────"
    );

    results.forEach((r) => {
      const name = r.name.substring(0, 23).padEnd(23);
      const img = r.hasImage ? "✅" : "❌";
      const desc = r.hasDescription ? "✅" : "❌";
      const html = r.hasHtmlRemoved ? "✅" : (r.hasDescription ? "✅" : "─");
      console.log(
        `${String(r.id).padEnd(5)}│ ${name} │ ${img.padEnd(10)} │ ${desc.padEnd(11)} │ ${html}`
      );
    });

    console.log("");

    // DIAGNÓSTICO
    console.log("=" + "=".repeat(79));
    console.log("✅ DIAGNÓSTICO");
    console.log("=" + "=".repeat(79));

    const allHaveImages = results.every((r) => r.hasImage);
    const allHaveDescriptions = results.every((r) => r.hasDescription);
    const allClean = results.every((r) => !r.hasHtmlRemoved || r.hasDescription);

    if (allHaveImages) {
      console.log("\n✅ Todas las imágenes están presentes");
    } else {
      console.log("\n❌ Algunas imágenes falta");
    }

    if (allHaveDescriptions) {
      console.log("✅ Todas las descripciones están presentes");
    } else {
      console.log("❌ Algunas descripciones falta");
    }

    if (allClean) {
      console.log("✅ HTML ha sido removido correctamente de las descripciones");
    } else {
      console.log("⚠️  Algunas descripciones pueden tener HTML");
    }

    console.log("\n" + "=" + "=".repeat(79));
    console.log("✅ VERIFICACIÓN COMPLETADA");
    console.log("=" + "=".repeat(79) + "\n");
  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}\n`);
    process.exit(1);
  }
})();
