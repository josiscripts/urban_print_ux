/**
 * Convierte imágenes JPG de categorías a PNG
 * Las imágenes JPG se transforman a PNG preservando la calidad
 */

import fs from "fs";
import path from "path";

console.log("\n" + "=".repeat(80));
console.log("🖼️  CONVERSIÓN: JPG → PNG");
console.log("=".repeat(80) + "\n");

const categoriesDir = path.join(
  process.cwd(),
  "src/assets/categories"
);

// Imágenes que necesitan conversión
const needsConversion = [
  { from: "categoria-eventos.jpg", to: "categoria-eventos.png" },
  { from: "categoria-sellos.jpg", to: "categoria-sellos.png" },
];

console.log("Imágenes a convertir:");
needsConversion.forEach(({ from, to }) => {
  console.log(`  • ${from} → ${to}`);
});

console.log("\n⚠️  NOTA: Este script necesita ImageMagick o equivalente");
console.log("Para convertir, utiliza:\n");

needsConversion.forEach(({ from, to }) => {
  const fromPath = path.join(categoriesDir, from);
  const toPath = path.join(categoriesDir, to);

  console.log(`ffmpeg -i "${fromPath}" "${toPath}"`);
  console.log(`  O en Windows: magick convert "${fromPath}" "${toPath}"\n`);
});

console.log("Verificando estado actual...\n");

const files = fs.readdirSync(categoriesDir);
console.log("Archivos en " + path.basename(categoriesDir) + ":");
files.forEach((f) => {
  const fullPath = path.join(categoriesDir, f);
  const stat = fs.statSync(fullPath);
  const sizeMB = (stat.size / 1024 / 1024).toFixed(2);
  console.log(`  ✓ ${f} (${sizeMB} MB)`);
});

console.log("\n" + "=".repeat(80));
