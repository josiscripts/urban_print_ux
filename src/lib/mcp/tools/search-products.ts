import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";

export default defineTool({
  name: "search_products",
  title: "Buscar productos",
  description:
    "Busca productos del catálogo público de Urban Print por texto y, opcionalmente, por slug de categoría.",
  inputSchema: {
    query: z.string().trim().max(120).optional().describe("Texto a buscar en nombre o descripción."),
    category_slug: z.string().trim().max(120).optional().describe("Slug de categoría para filtrar."),
    limit: z.number().int().min(1).max(50).default(20).describe("Número máximo de resultados."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ query, category_slug, limit }) => {
    const supabase = supabaseAnon();
    let categoryId: string | undefined;
    if (category_slug) {
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", category_slug)
        .maybeSingle();
      if (!cat) {
        return { content: [{ type: "text", text: `No existe la categoría "${category_slug}".` }], isError: true };
      }
      categoryId = cat.id;
    }

    let q = supabase
      .from("products")
      .select("slug, name, price, description, featured, category_id")
      .limit(limit ?? 20);
    if (categoryId) q = q.eq("category_id", categoryId);
    if (query) q = q.or(`name.ilike.%${query}%,description.ilike.%${query}%`);

    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { products: data ?? [] },
    };
  },
});
