import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_order",
  title: "Ver pedido",
  description: "Devuelve el detalle y las líneas de un pedido del usuario autenticado.",
  inputSchema: {
    order_number: z.string().trim().min(1).max(60).describe("Número del pedido."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ order_number }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "No autenticado" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data: order, error } = await supabase
      .from("orders")
      .select(
        "id, order_number, status, total, created_at, notes, shipping_name, shipping_street, shipping_city, shipping_postal_code, shipping_province",
      )
      .eq("order_number", order_number)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!order) {
      return { content: [{ type: "text", text: `No se ha encontrado el pedido "${order_number}".` }], isError: true };
    }
    const { data: items } = await supabase
      .from("order_items")
      .select("product_name, product_slug, quantity, unit_price")
      .eq("order_id", order.id);
    const payload = { ...order, items: items ?? [] };
    return {
      content: [{ type: "text", text: JSON.stringify(payload) }],
      structuredContent: { order: payload },
    };
  },
});
