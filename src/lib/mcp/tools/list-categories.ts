import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseAnon } from "../supabase";

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
    const supabase = supabaseAnon();
    let parentId: string | null | undefined;
    if (parent_slug) {
      const { data: parent } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", parent_slug)
        .maybeSingle();
      if (!parent) {
        return { content: [{ type: "text", text: `No existe la categoría "${parent_slug}".` }], isError: true };
      }
      parentId = parent.id;
    }
    let q = supabase
      .from("categories")
      .select("slug, name, description, parent_id, position")
      .order("position");
    if (parentId) q = q.eq("parent_id", parentId);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { categories: data ?? [] },
    };
  },
});
