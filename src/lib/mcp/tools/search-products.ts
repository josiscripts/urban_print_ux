import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getCatalogo } from "@/lib/catalog.functions";

export default defineTool({
  name: "search_products",
  title: "Buscar productos",
  description:
    "Busca productos del catálogo público de Urban Print por texto y, opcionalmente, por slug de categoría.",
  inputSchema: {
    query: z
      .string()
      .trim()
      .max(120)
      .optional()
      .describe("Texto a buscar en nombre o descripción."),
    category_slug: z
      .string()
      .trim()
      .max(120)
      .optional()
      .describe("Slug de categoría para filtrar."),
    limit: z.number().int().min(1).max(50).default(20).describe("Número máximo de resultados."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, category_slug, limit }) => {
    const { categories, products } = await getCatalogo();
    let categoryIds: Set<string> | undefined;
    if (category_slug) {
      const cat = categories.find((c) => c.slug === category_slug);
      if (!cat) {
        return {
          content: [{ type: "text", text: `No existe la categoría "${category_slug}".` }],
          isError: true,
        };
      }
      categoryIds = new Set([cat.id, ...categories.filter((c) => c.parent_id === cat.id).map((c) => c.id)]);
    }

    const needle = query?.toLowerCase();
    const data = products
      .filter((p) => !categoryIds || categoryIds.has(p.category_id))
      .filter(
        (p) =>
          !needle ||
          p.name.toLowerCase().includes(needle) ||
          (p.description ?? "").toLowerCase().includes(needle),
      )
      .slice(0, limit ?? 20)
      .map((p) => ({
        slug: p.slug,
        name: p.name,
        price: p.price,
        description: p.description,
        featured: p.featured,
        category_id: p.category_id,
        disponible: p.disponible,
        stock_quantity: p.stock_quantity,
      }));

    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { products: data },
    };
  },
});
