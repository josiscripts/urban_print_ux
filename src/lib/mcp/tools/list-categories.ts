import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { getCatalogo } from "@/lib/catalog.functions";

export default defineTool({
  name: "list_categories",
  title: "Listar categorías",
  description: "Lista las categorías y subcategorías del catálogo público de Urban Print.",
  inputSchema: {
    parent_slug: z
      .string()
      .trim()
      .max(120)
      .optional()
      .describe("Slug de la categoría padre para listar solo sus subcategorías."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ parent_slug }) => {
    const { categories } = await getCatalogo();
    let parentId: string | null | undefined;
    if (parent_slug) {
      const parent = categories.find((c) => c.slug === parent_slug);
      if (!parent) {
        return {
          content: [{ type: "text", text: `No existe la categoría "${parent_slug}".` }],
          isError: true,
        };
      }
      parentId = parent.id;
    }
    const data = categories
      .filter((c) => (parentId ? c.parent_id === parentId : true))
      .sort((a, b) => a.position - b.position)
      .map((c) => ({
        slug: c.slug,
        name: c.name,
        description: c.description,
        parent_id: c.parent_id,
        position: c.position,
      }));
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { categories: data },
    };
  },
});
