import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getCatalogo } from "@/lib/catalog.functions";

export default defineTool({
  name: "get_product",
  title: "Ver producto",
  description: "Devuelve el detalle de un producto público de Urban Print a partir de su slug.",
  inputSchema: { slug: z.string().trim().min(1).max(160).describe("Slug del producto.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }) => {
    // Catálogo y precios desde WooCommerce; si Woo falla, el error se devuelve tal cual.
    const { products } = await getCatalogo();
    const data = products.find((p) => p.slug === slug);
    if (!data)
      return {
        content: [{ type: "text", text: `No se ha encontrado el producto "${slug}".` }],
        isError: true,
      };
    const producto = {
      slug: data.slug,
      name: data.name,
      price: data.price,
      description: data.description,
      featured: data.featured,
      category_id: data.category_id,
      disponible: data.disponible,
      stock_quantity: data.stock_quantity,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(producto) }],
      structuredContent: { product: producto },
    };
  },
});
