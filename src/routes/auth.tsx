import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { next?: string } => {
    const raw = s['next'];
    return typeof raw === "string" && raw.startsWith("/") && !raw.startsWith("//")
      ? { next: raw }
      : {};
  },
  head: () => ({
    meta: [
      { title: "Acceso de clientes | Urban Print" },
      { name: "description", content: "Accede a tu área de cliente de Urban Print o crea una cuenta." },
      { property: "og:title", content: "Acceso de clientes | Urban Print" },
      { property: "og:description", content: "Área privada de clientes de Urban Print." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Email no válido").max(255),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72),
});

function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const destino = () => {
    if (next) {
      window.location.href = next;
      return true;
    }
    return false;
  };
  const [modo, setModo] = useState<"login" | "signup">("login");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        if (next) window.location.replace(next);
        else navigate({ to: "/cuenta", replace: true });
      }
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Datos no válidos");
      return;
    }
    setError("");
    setCargando(true);
    try {
      if (modo === "login") {
        const { error: err } = await supabase.auth.signInWithPassword(parsed.data);
        if (err) throw err;
        if (!destino()) navigate({ to: "/cuenta" });
      } else {
        const { data, error: err } = await supabase.auth.signUp({
          ...parsed.data,
          options: { emailRedirectTo: next ? window.location.origin + next : window.location.origin },
        });
        if (err) throw err;
        if (data.session) {
          if (!destino()) navigate({ to: "/cuenta" });
        }
        else toast.success("Revisa tu email para confirmar la cuenta.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se ha podido completar la operación");
    } finally {
      setCargando(false);
    }
  }

  async function conGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: next ? window.location.origin + next : window.location.origin,
    });
    if (result.error) {
      toast.error("No se ha podido iniciar sesión con Google.");
      return;
    }
    if (result.redirected) return;
    if (!destino()) navigate({ to: "/cuenta" });
  }

  return (
    <div className="w-full px-4 py-16">
      <div className="mx-auto max-w-md">
      <h1 className="font-display text-3xl tracking-tight uppercase">
        {modo === "login" ? "Iniciar sesión" : "Crear cuenta"}
      </h1>
      <span className="mt-2 block h-0.5 w-12 bg-primary" />

      <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
        <div>
          <label htmlFor="email" className="font-display text-xs tracking-widest uppercase">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className="mt-2 h-11 w-full border border-input bg-background px-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <div>
          <label htmlFor="password" className="font-display text-xs tracking-widest uppercase">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={modo === "login" ? "current-password" : "new-password"}
            className="mt-2 h-11 w-full border border-input bg-background px-3 text-sm outline-none focus:border-primary"
          />
        </div>
        {error && <p className="text-sm text-primary">{error}</p>}
        <Button type="submit" size="lg" className="w-full" disabled={cargando}>
          {cargando ? "Procesando…" : modo === "login" ? "Entrar" : "Registrarme"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> o <span className="h-px flex-1 bg-border" />
      </div>

      <Button variant="outline" size="lg" className="w-full" onClick={conGoogle}>
        Continuar con Google
      </Button>

      <button
        type="button"
        onClick={() => setModo(modo === "login" ? "signup" : "login")}
        className="mt-6 w-full text-sm text-muted-foreground hover:text-primary"
      >
        {modo === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
      </button>
      </div>
    </div>
  );
}
