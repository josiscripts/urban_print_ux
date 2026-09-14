/**
 * Convierte archivos JPG de categorías a PNG
 * Usa fs puro para copiar archivos y renombrarlos como PNG
 * (los navegadores modernos entienden el contenido independientemente de la extensión)
 */

import fs from "fs";
import path from "path";

const categoriesDir = "src/assets/categories";

const conversions = [
  { from: "categoria-eventos.jpg", to: "categoria-eventos.png" },
  { from: "categoria-sellos.jpg", to: "categoria-sellos.png" },
];

console.log("\n" + "=".repeat(80));
console.log("🎨 CONVERSIÓN: Preparar archivos JPG como PNG");
console.log("=".repeat(80) + "\n");

conversions.forEach(({ from, to }) => {
  const fromPath = path.join(categoriesDir, from);
  const toPath = path.join(categoriesDir, to);

  try {
    if (fs.existsSync(fromPath)) {
      // Lee el archivo JPG
      const data = fs.readFileSync(fromPath);
      // Escribe como PNG (los datos son binarios, el navegador lo maneja)
      fs.writeFileSync(toPath, data);
      console.log(`✅ ${from} → ${to}`);
    } else {
      console.log(`❌ ${from} no encontrado`);
    }
  } catch (err) {
    console.log(`❌ Error procesando ${from}: ${err.message}`);
  }
});

console.log("\n" + "=".repeat(80));
console.log("✅ Conversión completada");
console.log("=".repeat(80) + "\n");

// Verificar archivos finales
console.log("Archivos finales en " + categoriesDir + ":\n");
const files = fs.readdirSync(categoriesDir).sort();
files.forEach((f) => {
  const fullPath = path.join(categoriesDir, f);
  const stat = fs.statSync(fullPath);
  const sizeMB = (stat.size / 1024 / 1024).toFixed(2);
  const ext = path.extname(f).toLowerCase();
  console.log(`✓ ${f} (${sizeMB} MB, ${ext})`);
});

console.log("");
