import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type OAuthApi = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthDetails | null; error: Error | null }>;
  approveAuthorization: (id: string) => Promise<{ data: AuthResult | null; error: Error | null }>;
  denyAuthorization: (id: string) => Promise<{ data: AuthResult | null; error: Error | null }>;
};
type AuthDetails = {
  client?: { name?: string } | null;
  redirect_url?: string;
  redirect_to?: string;
};
type AuthResult = { redirect_url?: string; redirect_to?: string };

function oauthApi(): OAuthApi {
  return (supabase.auth as unknown as { oauth: OAuthApi }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s['authorization_id'] === "string" ? s['authorization_id'] : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Falta authorization_id");
    const { data } = await supabase.auth.getSession();
    const next = location.pathname + location.searchStr;
    if (!data.session) throw redirect({ to: "/auth", search: { next } });
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
    if (error) throw error;
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="font-display text-xl uppercase">No se ha podido cargar la autorización</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {String((error as Error)?.message ?? error)}
      </p>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nombre = details?.client?.name ?? "la aplicación";

  async function decide(approve: boolean) {
    setBusy(true);
    const api = oauthApi();
    const { data, error: err } = approve
      ? await api.approveAuthorization(authorization_id)
      : await api.denyAuthorization(authorization_id);
    if (err) {
      setBusy(false);
      setError(err.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("El servidor de autorización no ha devuelto una redirección.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="w-full px-4 py-20">
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-2xl uppercase tracking-tight">
          Conectar {nombre} a tu cuenta
        </h1>
        <span className="mt-2 block h-0.5 w-12 bg-primary" />
        <p className="mt-6 text-sm text-muted-foreground">
          Permitirás que {nombre} acceda a Urban Print en tu nombre: consultar el catálogo y tus
          pedidos.
        </p>
        {error && (
          <p role="alert" className="mt-4 text-sm text-primary">
            {error}
          </p>
        )}
        <div className="mt-8 flex gap-3">
          <Button size="lg" disabled={busy} onClick={() => decide(true)} className="flex-1">
            Autorizar
          </Button>
          <Button
            size="lg"
            variant="outline"
            disabled={busy}
            onClick={() => decide(false)}
            className="flex-1"
          >
            Denegar
          </Button>
        </div>
      </div>
    </main>
  );
}
