import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { esZonaExcluida, MENSAJE_ZONA_EXCLUIDA } from "@/lib/shipping";

const addressSchema = z.object({
  id: z.string().uuid().optional(),
  kind: z.enum(["envio", "facturacion"]),
  full_name: z.string().trim().min(2).max(120),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  street: z.string().trim().min(3).max(200),
  postal_code: z.string().trim().min(3).max(12),
  city: z.string().trim().min(2).max(80),
  province: z.string().trim().min(2).max(80),
  country: z.string().trim().min(2).max(60).default("España"),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  is_default: z.boolean().default(false),
});

const profileSchema = z.object({
  first_name: z.string().trim().max(80),
  last_name: z.string().trim().max(120),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
});

export const getPerfil = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("profiles")
      .select("id, first_name, last_name, phone")
      .eq("id", context.userId)
      .maybeSingle();
    return data ?? { id: context.userId, first_name: "", last_name: "", phone: "" };
  });

export const guardarPerfil = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => profileSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .upsert({ id: context.userId, ...data, phone: data.phone || null });
    if (error) throw new Error("No se pudieron guardar los datos.");
    return { ok: true };
  });

export const getDirecciones = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("addresses")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at");
    return data ?? [];
  });

export const guardarDireccion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => addressSchema.parse(input))
  .handler(async ({ data, context }) => {
    const row = {
      user_id: context.userId,
      kind: data.kind,
      full_name: data.full_name,
      company: data.company || null,
      street: data.street,
      postal_code: data.postal_code,
      city: data.city,
      province: data.province,
      country: data.country,
      phone: data.phone || null,
      is_default: data.is_default,
    };
    if (data.is_default) {
      await context.supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", context.userId)
        .eq("kind", data.kind);
    }
    const { error } = data.id
      ? await context.supabase
          .from("addresses")
          .update(row)
          .eq("id", data.id)
          .eq("user_id", context.userId)
      : await context.supabase.from("addresses").insert(row);
    if (error) throw new Error("No se pudo guardar la dirección.");
    return { ok: true };
  });

export const borrarDireccion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await context.supabase
      .from("addresses")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    return { ok: true };
  });

export const getPedidos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("orders")
      .select("id, order_number, status, total, created_at, order_items(product_name, quantity, unit_price)")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    return data ?? [];
  });

export const getDescargas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("downloads")
      .select("id, name, file_url, expires_at, remaining")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    return data ?? [];
  });

export const crearPedido = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        items: z
          .array(
            z.object({
              slug: z.string().min(1).max(120),
              name: z.string().min(1).max(200),
              price: z.number().min(0).max(100000),
              quantity: z.number().int().min(1).max(999),
            }),
          )
          .min(1)
          .max(50),
        shipping: z.object({
          name: z.string().trim().min(2).max(120),
          street: z.string().trim().min(3).max(200),
          postal_code: z.string().trim().min(3).max(12),
          city: z.string().trim().min(2).max(80),
          province: z.string().trim().min(2).max(80),
        }),
        notes: z.string().trim().max(1000).optional().or(z.literal("")),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    if (esZonaExcluida(data.shipping)) throw new Error(MENSAJE_ZONA_EXCLUIDA);

    const slugs = [...new Set(data.items.map((i) => i.slug))];
    const { data: products, error: productsError } = await context.supabase
      .from("products")
      .select("slug, name, price")
      .in("slug", slugs);
    if (productsError) throw new Error("No se pudo validar el catálogo.");
    const bySlug = new Map((products ?? []).map((p) => [p.slug, p]));
    if (bySlug.size !== slugs.length) throw new Error("Algún producto del carrito no existe.");

    const lines = data.items.map((i) => {
      const product = bySlug.get(i.slug)!;
      return {
        product_slug: product.slug,
        product_name: product.name,
        unit_price: Number(product.price),
        quantity: i.quantity,
      };
    });
    const total = lines.reduce((acc, l) => acc + l.unit_price * l.quantity, 0);
    const orderNumber = `UP-${Date.now().toString().slice(-8)}`;
    const { data: order, error } = await context.supabase
      .from("orders")
      .insert({
        user_id: context.userId,
        order_number: orderNumber,
        status: "pendiente_pago",
        total,
        shipping_name: data.shipping.name,
        shipping_street: data.shipping.street,
        shipping_postal_code: data.shipping.postal_code,
        shipping_city: data.shipping.city,
        shipping_province: data.shipping.province,
        notes: data.notes || null,
      })
      .select("id, order_number")
      .single();
    if (error || !order) throw new Error("No se pudo registrar el pedido.");
    const { error: itemsError } = await context.supabase
      .from("order_items")
      .insert(lines.map((l) => ({ order_id: order.id, ...l })));
    if (itemsError) throw new Error("No se pudieron registrar las líneas del pedido.");
    return { orderNumber: order.order_number, total };
  });
