import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Funciones del panel de administración.
 * De momento sin protección de acceso (pendiente de configurar).
 */

const economiaSchema = z.object({
  product_id: z.string().uuid(),
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
  category_id: z.string().uuid().nullable().optional(),
  product_id: z.string().uuid().nullable().optional(),
  active: z.boolean(),
  notes: z.string().max(300).nullable().optional(),
});

const tramoSchema = z.object({
  product_id: z.string().uuid(),
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

export const getAdminData = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [products, categories, economics, tiers, expenses, history, items] = await Promise.all([
    supabaseAdmin
      .from("products")
      .select("id, slug, name, price, category_id, featured")
      .order("position"),
    supabaseAdmin
      .from("categories")
      .select("id, slug, name, parent_id, position")
      .order("position"),
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
    products: products.data ?? [],
    categories: categories.data ?? [],
    economics: economics.data ?? [],
    tiers: tiers.data ?? [],
    expenses: expenses.data ?? [],
    history: history.data ?? [],
    items: items.data ?? [],
  };
});

export const saveProductEconomics = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => economiaSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { reason, ...fila } = data;

    const { data: previa } = await supabaseAdmin
      .from("product_economics")
      .select("*")
      .eq("product_id", fila.product_id)
      .maybeSingle();

    const { data: guardada, error } = await supabaseAdmin
      .from("product_economics")
      .upsert(
        { ...fila, sku: fila.sku ?? null, notes: fila.notes ?? null },
        { onConflict: "product_id" },
      )
      .select("*")
      .single();
    if (error) throw new Error(error.message);

    const anterior = total(previa);
    const nuevo = total(guardada);
    if (Math.abs(anterior - nuevo) > 0.0001) {
      await supabaseAdmin.from("product_cost_history").insert({
        product_id: fila.product_id,
        previous_total: anterior,
        new_total: nuevo,
        reason: reason ?? null,
      });
    }
    return guardada;
  });

export const saveExpense = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => gastoSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const fila = {
      name: data.name,
      kind: data.kind,
      amount: data.amount,
      is_percentage: data.is_percentage,
      scope: data.scope,
      category_id: data.scope === "categoria" ? (data.category_id ?? null) : null,
      product_id: data.scope === "producto" ? (data.product_id ?? null) : null,
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
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("admin_expenses").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveTier = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => tramoSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("product_cost_tiers").insert({
      product_id: data.product_id,
      min_qty: data.min_qty,
      max_qty: data.max_qty ?? null,
      unit_cost: data.unit_cost,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteTier = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("product_cost_tiers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
