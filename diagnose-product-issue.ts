/**
 * SCRIPT DE DIAGNÓSTICO - FASE 1 a 6
 *
 * Utiliza EXACTAMENTE los mismos clientes y funciones que la app.
 * NO hace cambios, solo recopila información.
 *
 * Ejecución: node --loader ts-node/esm diagnose-product-issue.ts
 */

import { WooCommerceClient } from "./src/lib/woocommerce/client.server";
import {
  adaptarProductoWooCommerce,
  adaptarProductosWooCommerce,
} from "./src/lib/woocommerce/adapter";
import type { WooProduct } from "./src/lib/woocommerce/types";

// Los IDs específicos a comprobar
const PRODUCT_IDS_TO_CHECK = [6590, 6589, 6586, 6585, 6584];

/**
 * FASE 1: Comprobar productos individuales
 */
async function fase1_checkIndividualProducts(client: WooCommerceClient) {
  console.log("\n" + "=".repeat(80));
  console.log("FASE 1: COMPROBAR PRODUCTOS INDIVIDUALES");
  console.log("=".repeat(80));

  const results: Record<number, any> = {};

  for (const productId of PRODUCT_IDS_TO_CHECK) {
    console.log(`\n--- Producto ID: ${productId} ---`);
    try {
      const product = await client.getProductById(productId);
      console.log(`✓ Obtenido de WooCommerce`);
      console.log(`  - ID: ${product.id}`);
      console.log(`  - Name: ${product.name}`);
      console.log(`  - Slug: ${product.slug || "(VACÍO)"}`);
      console.log(`  - Status: ${product.status}`);
      console.log(`  - Catalog Visibility: ${product.catalog_visibility}`);

      // Intentar adaptarlo
      try {
        const adapted = adaptarProductoWooCommerce(product);
        console.log(`✓ Adaptado correctamente`);
        console.log(`  - id: ${adapted.id}`);
        console.log(`  - slug: ${adapted.slug}`);
        console.log(`  - name: ${adapted.name}`);
        results[productId] = { status: "success", adapted, raw: product };
      } catch (adapterError) {
        console.log(
          `✗ ERROR en adapter: ${adapterError instanceof Error ? adapterError.message : String(adapterError)}`
        );
        results[productId] = { status: "adapter_error", error: String(adapterError), raw: product };
      }
    } catch (error) {
      console.log(
        `✗ ERROR obteniendo producto: ${error instanceof Error ? error.message : String(error)}`
      );
      results[productId] = { status: "woocommerce_error", error: String(error) };
    }
  }

  return results;
}

/**
 * FASE 2 & 6: Comprobar paginación total
 */
async function fase2_checkPaginationAndTotal(client: WooCommerceClient) {
  console.log("\n" + "=".repeat(80));
  console.log("FASE 2/6: COMPROBAR PAGINACIÓN Y TOTAL DE PRODUCTOS");
  console.log("=".repeat(80));

  const allProducts: WooProduct[] = [];
  let page = 1;
  let totalPages = 0;

  while (true) {
    console.log(`\nPágina ${page}...`);
    try {
      const products = await client.getProducts({ per_page: 100, page });

      if (products.length === 0) {
        console.log(`  Página vacía, finalizando.`);
        break;
      }

      console.log(`  ✓ Recibidos ${products.length} productos`);

      // Verificar presencia de IDs críticos
      const criticos = products.filter((p) => PRODUCT_IDS_TO_CHECK.includes(p.id));
      if (criticos.length > 0) {
        console.log(`  ✓ Contiene ${criticos.length} productos críticos: ${criticos.map((p) => p.id).join(", ")}`);
      }

      allProducts.push(...products);
      totalPages++;

      if (products.length < 100) {
        console.log(`  Última página (${products.length} < 100), finalizando.`);
        break;
      }

      page++;
    } catch (error) {
      console.log(`  ✗ Error: ${error instanceof Error ? error.message : String(error)}`);
      break;
    }
  }

  console.log(`\n--- RESUMEN PAGINACIÓN ---`);
  console.log(`Total de páginas: ${totalPages}`);
  console.log(`Total de productos: ${allProducts.length}`);
  console.log(`Productos sin slug: ${allProducts.filter((p) => !p.slug).length}`);
  console.log(`Productos sin name: ${allProducts.filter((p) => !p.name).length}`);
  console.log(`Productos sin id: ${allProducts.filter((p) => !p.id).length}`);

  return { allProducts, totalPages };
}

/**
 * FASE 3: Simular getCatalogo() exactamente
 */
async function fase3_simulateGetCatalogo(client: WooCommerceClient) {
  console.log("\n" + "=".repeat(80));
  console.log("FASE 3: SIMULAR getCatalogo() EXACTAMENTE");
  console.log("=".repeat(80));

  try {
    // Obtener todas las páginas
    const allProducts: WooProduct[] = [];
    let page = 1;
    let tieneProxima = true;

    while (tieneProxima) {
      const productos = await client.getProducts({ per_page: 100, page });
      allProducts.push(...productos);
      tieneProxima = productos.length === 100;
      page++;
    }

    console.log(`\n✓ Obtuvieron ${allProducts.length} productos brutos`);

    // Adaptar (con logging del adapter)
    console.log(`\nAdaptando productos...`);
    const adaptados = adaptarProductosWooCommerce(allProducts, true);
    console.log(`✓ ${adaptados.length} productos adaptados`);

    // Verificar IDs críticos
    console.log(`\n--- PRODUCTOS CRÍTICOS EN CATÁLOGO FINAL ---`);
    for (const id of PRODUCT_IDS_TO_CHECK) {
      const found = adaptados.find((p) => p.id === String(id));
      if (found) {
        console.log(`✓ ID ${id}: encontrado`);
        console.log(`  - slug: ${found.slug}`);
        console.log(`  - name: ${found.name}`);
      } else {
        console.log(`✗ ID ${id}: NO ENCONTRADO EN CATÁLOGO`);
      }
    }

    return { allProducts, adaptados };
  } catch (error) {
    console.log(`✗ ERROR: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * FASE 4: Verificar búsqueda por slug (como hace la ruta)
 */
async function fase4_testSlugLookup(adaptados: any[]) {
  console.log("\n" + "=".repeat(80));
  console.log("FASE 4: VERIFICAR BÚSQUEDA POR SLUG");
  console.log("=".repeat(80));

  console.log(`\nSimulando: data.products.find((p) => p.slug === params.slug)`);

  for (const id of PRODUCT_IDS_TO_CHECK) {
    const producto = adaptados.find((p) => p.id === String(id));
    if (!producto) {
      console.log(`\n✗ ID ${id}: No existe en adaptados, no se puede buscar por slug`);
      continue;
    }

    const slug = producto.slug;
    console.log(`\n--- ID ${id} ---`);
    console.log(`  Slug a buscar: "${slug}"`);

    const found = adaptados.find((p) => p.slug === slug);
    if (found) {
      console.log(`  ✓ ENCONTRADO en búsqueda exacta`);
      console.log(`    - ID: ${found.id}`);
      console.log(`    - Name: ${found.name}`);
    } else {
      console.log(`  ✗ NO ENCONTRADO - ESTO CAUSARÍA 404`);
    }
  }
}

/**
 * FASE 5: Comprobar si hay duplicados de slug
 */
async function fase5_checkSlugDuplicates(adaptados: any[]) {
  console.log("\n" + "=".repeat(80));
  console.log("FASE 5: COMPROBAR DUPLICADOS DE SLUG");
  console.log("=".repeat(80));

  const slugMap = new Map<string, any[]>();

  for (const product of adaptados) {
    const slug = product.slug;
    if (!slugMap.has(slug)) {
      slugMap.set(slug, []);
    }
    slugMap.get(slug)!.push(product);
  }

  const duplicates = Array.from(slugMap.entries()).filter(([_, products]) => products.length > 1);

  if (duplicates.length === 0) {
    console.log(`✓ No hay duplicados de slug`);
  } else {
    console.log(`✗ ENCONTRADOS ${duplicates.length} slugs duplicados:`);
    for (const [slug, products] of duplicates) {
      console.log(`\n  Slug: "${slug}"`);
      for (const p of products) {
        console.log(`    - ID: ${p.id}, Name: ${p.name}`);
      }
    }
  }

  return duplicates;
}

/**
 * FASE 6: Comprobar categorías y relaciones
 */
async function fase6_checkCategories(client: WooCommerceClient) {
  console.log("\n" + "=".repeat(80));
  console.log("FASE 6: COMPROBAR CATEGORÍAS");
  console.log("=".repeat(80));

  try {
    const categories = await client.getCategories({ per_page: 100 });
    console.log(`✓ Obtuvieron ${categories.length} categorías`);

    // Verificar que las categorías tengan campos correctos
    console.log(`\n--- VALIDACIÓN DE CATEGORÍAS ---`);
    const invalid = categories.filter((c) => !c.id || !c.slug || !c.name);
    if (invalid.length === 0) {
      console.log(`✓ Todas las categorías tienen id, slug y name`);
    } else {
      console.log(`✗ ${invalid.length} categorías inválidas`);
    }

    return categories;
  } catch (error) {
    console.log(`✗ ERROR: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * MAIN
 */
async function main() {
  console.log("\n");
  console.log("╔" + "═".repeat(78) + "╗");
  console.log("║ DIAGNÓSTICO COMPLETO - PROBLEMA 'PRODUCTO NO ENCONTRADO'".padEnd(79) + "║");
  console.log("╚" + "═".repeat(78) + "╝");

  // Validar env
  console.log(`\n--- VALIDACIÓN DE VARIABLES DE ENTORNO ---`);
  const env = {
    WOOCOMMERCE_URL: process.env.WOOCOMMERCE_URL ? "✓ configurada" : "✗ NO configurada",
    WOOCOMMERCE_CONSUMER_KEY: process.env.WOOCOMMERCE_CONSUMER_KEY ? "✓ configurada" : "✗ NO configurada",
    WOOCOMMERCE_CONSUMER_SECRET: process.env.WOOCOMMERCE_CONSUMER_SECRET ? "✓ configurada" : "✗ NO configurada",
  };

  console.log(`WOOCOMMERCE_URL: ${env.WOOCOMMERCE_URL}`);
  console.log(`WOOCOMMERCE_CONSUMER_KEY: ${env.WOOCOMMERCE_CONSUMER_KEY}`);
  console.log(`WOOCOMMERCE_CONSUMER_SECRET: ${env.WOOCOMMERCE_CONSUMER_SECRET}`);

  if (
    !process.env.WOOCOMMERCE_URL ||
    !process.env.WOOCOMMERCE_CONSUMER_KEY ||
    !process.env.WOOCOMMERCE_CONSUMER_SECRET
  ) {
    console.error(`\n✗ FATAL: Faltan variables de entorno requeridas`);
    process.exit(1);
  }

  try {
    const client = new WooCommerceClient();

    // Ejecutar fases
    const fase1Results = await fase1_checkIndividualProducts(client);
    const fase2Data = await fase2_checkPaginationAndTotal(client);
    const fase3Data = await fase3_simulateGetCatalogo(client);
    await fase4_testSlugLookup(fase3Data.adaptados);
    const fase5Duplicates = await fase5_checkSlugDuplicates(fase3Data.adaptados);
    const fase6Categories = await fase6_checkCategories(client);

    // RESUMEN FINAL
    console.log("\n" + "=".repeat(80));
    console.log("RESUMEN FINAL DE DIAGNÓSTICO");
    console.log("=".repeat(80));

    const problemProducts: number[] = [];

    for (const id of PRODUCT_IDS_TO_CHECK) {
      const fase1 = fase1Results[id];
      const existe = fase3Data.adaptados.find((p) => p.id === String(id));

      let estado = "✓ OK";
      if (!fase1 || fase1.status !== "success") {
        estado = "✗ ERROR en fase 1";
        problemProducts.push(id);
      } else if (!existe) {
        estado = "✗ No en catálogo final";
        problemProducts.push(id);
      }

      console.log(`ID ${id}: ${estado}`);
    }

    console.log(`\n--- ESTADÍSTICAS ---`);
    console.log(`Productos con problema: ${problemProducts.length}/${PRODUCT_IDS_TO_CHECK.length}`);
    console.log(`Slugs duplicados: ${fase5Duplicates.length}`);
    console.log(`Total en catálogo: ${fase3Data.adaptados.length}`);
    console.log(`Total en WooCommerce (bruto): ${fase3Data.allProducts.length}`);

    if (problemProducts.length > 0) {
      console.log(`\n⚠️  PRODUCTOS CON PROBLEMA: ${problemProducts.join(", ")}`);
    } else {
      console.log(`\n✓ TODOS LOS PRODUCTOS CRÍTICOS ESTÁN OK`);
    }

  } catch (error) {
    console.error(`\n✗ FATAL ERROR:`, error);
    process.exit(1);
  }
}

main();
