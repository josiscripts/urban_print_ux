import { createMiddleware } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Exige sesión válida y rol "admin" en public.user_roles.
 * La consulta usa el cliente del propio usuario: la política RLS
 * "Roles propios visibles" solo le deja ver sus filas.
 */
export const requireAdmin = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();

    if (error || !data) {
      throw new Error("Forbidden: Admin role required");
    }

    return next();
  });
