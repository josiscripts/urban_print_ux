import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCatalogo } from "@/lib/catalog.functions";
import { requireAdmin } from "@/lib/admin-auth";

/**
 * Funciones del panel de administración.
 * Catálogo (productos, categorías, stock y precios) desde WooCommerce.
 * Costes, tramos y gastos en Supabase, indexados por slug del producto
 * (product_slug) y de la categoría (category_slug).
 * Todas exigen sesión con rol "admin" (middleware requireAdmin).
 */

const economiaSchema = z.object({
  product_slug: z.string().min(1).max(160),
  sku: z.string().max(60).nullable().optional(),
  vat_rate: z.number().min(0).max(100),
  cost_materials: z.number().min(0),
  cost_printing: z.number().min(0),
  cost_production: z.number().min(0),
  cost_labor: z.number().min(0),
  cost_packaging: z.number().min(0),
  cost_handling: z.number().min(0),
  cost_shipping: z.number().min(0),
  cost_other: z.number().min(0),
  notes: z.string().max(500).nullable().optional(),
  reason: z.string().max(200).nullable().optional(),
});

const gastoSchema = z.object({
  id: z.string().uuid().nullable().optional(),
  name: z.string().min(1).max(120),
  kind: z.string().min(1).max(40),
  amount: z.number().min(0),
  is_percentage: z.boolean(),
  scope: z.enum(["global", "categoria", "producto"]),
  category_slug: z.string().min(1).max(160).nullable().optional(),
  product_slug: z.string().min(1).max(160).nullable().optional(),
  active: z.boolean(),
  notes: z.string().max(300).nullable().optional(),
});

const tramoSchema = z.object({
  product_slug: z.string().min(1).max(160),
  min_qty: z.number().int().min(1),
  max_qty: z.number().int().min(1).nullable().optional(),
  unit_cost: z.number().min(0),
});

const CAMPOS = [
  "cost_materials",
  "cost_printing",
  "cost_production",
  "cost_labor",
  "cost_packaging",
  "cost_handling",
  "cost_shipping",
  "cost_other",
] as const;

function total(row: Record<string, unknown> | null | undefined): number {
  if (!row) return 0;
  return CAMPOS.reduce((acc, key) => acc + Number(row[key] ?? 0), 0);
}

export const getAdminData = createServerFn({ method: "GET" })
  .middleware([requireAdmin])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Catálogo en vivo desde WooCommerce; si Woo falla, la carga del admin falla.
    const catalogo = await getCatalogo();
    const slugCategoria = new Map(catalogo.categories.map((c) => [c.id, c.slug]));
    const [economics, tiers, expenses, history, items] = await Promise.all([
      supabaseAdmin.from("product_economics").select("*"),
      supabaseAdmin.from("product_cost_tiers").select("*").order("min_qty"),
      supabaseAdmin.from("admin_expenses").select("*").order("created_at"),
      supabaseAdmin
        .from("product_cost_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      supabaseAdmin
        .from("order_items")
        .select("id, product_slug, product_name, unit_price, quantity, created_at, order_id")
        .order("created_at", { ascending: false })
        .limit(2000),
    ]);

    return {
      products: catalogo.products.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: p.price,
        category_id: p.category_id,
        category_slug: slugCategoria.get(p.category_id) ?? null,
        featured: p.featured,
        stock_quantity: p.stock_quantity,
        disponible: p.disponible,
      })),
      categories: catalogo.categories.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        parent_id: c.parent_id,
        position: c.position,
      })),
      economics: economics.data ?? [],
      tiers: tiers.data ?? [],
      expenses: expenses.data ?? [],
      history: history.data ?? [],
      items: items.data ?? [],
    };
  });

export const saveProductEconomics = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data: unknown) => economiaSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { reason, ...fila } = data;

    const { data: previa } = await supabaseAdmin
      .from("product_economics")
      .select("*")
      .eq("product_slug", fila.product_slug)
      .maybeSingle();

    const { data: guardada, error } = await supabaseAdmin
      .from("product_economics")
      .upsert(
        { ...fila, sku: fila.sku ?? null, notes: fila.notes ?? null },
        { onConflict: "product_slug" },
      )
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    const anterior = total(previa);
    const nuevo = total(guardada);
    if (Math.abs(anterior - nuevo) > 0.0001) {
      await supabaseAdmin.from("product_cost_history").insert({
        product_slug: fila.product_slug,
        previous_total: anterior,
        new_total: nuevo,
        reason: reason ?? null,
      });
    }
    return guardada;
  });

export const saveExpense = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data: unknown) => gastoSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const fila = {
      name: data.name,
      kind: data.kind,
      amount: data.amount,
      is_percentage: data.is_percentage,
      scope: data.scope,
      category_slug: data.scope === "categoria" ? (data.category_slug ?? null) : null,
      product_slug: data.scope === "producto" ? (data.product_slug ?? null) : null,
      active: data.active,
      notes: data.notes ?? null,
    };
    if (data.id) {
      const { error } = await supabaseAdmin.from("admin_expenses").update(fila).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: creado, error } = await supabaseAdmin
      .from("admin_expenses")
      .insert(fila)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return creado;
  });

export const deleteExpense = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("admin_expenses").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveTier = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data: unknown) => tramoSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("product_cost_tiers").insert({
      product_slug: data.product_slug,
      min_qty: data.min_qty,
      max_qty: data.max_qty ?? null,
      unit_cost: data.unit_cost,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteTier = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("product_cost_tiers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
