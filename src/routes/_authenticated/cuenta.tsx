import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/cuenta")({
  head: () => ({
    meta: [
      { title: "Área de cliente | Urban Print" },
      { name: "description", content: "Gestiona tus pedidos, direcciones y descargas en Urban Print." },
      { property: "og:title", content: "Área de cliente | Urban Print" },
      { property: "og:description", content: "Tu área privada de cliente." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CuentaLayout,
});

const SECCIONES = [
  { to: "/cuenta", label: "Escritorio", exact: true },
  { to: "/cuenta/pedidos", label: "Pedidos", exact: false },
  { to: "/cuenta/descargas", label: "Descargas", exact: false },
  { to: "/cuenta/direcciones", label: "Direcciones", exact: false },
  { to: "/cuenta/detalles", label: "Detalles de la cuenta", exact: false },
] as const;


function CuentaLayout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function salir() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="w-full px-4 py-12">
      <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
        <h1 className="truncate font-display text-3xl tracking-tight uppercase">Área de cliente</h1>
        <Button variant="outline" onClick={salir}>
          Cerrar sesión
        </Button>
      </div>
      <span className="mt-2 block h-0.5 w-12 bg-primary" />

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Secciones de la cuenta">
          <ul className="space-y-1">
            {SECCIONES.map((s) => (
              <li key={s.to}>
                <Link
                  to={s.to}
                  activeOptions={{ exact: s.exact }}
                  activeProps={{ className: "border-primary text-primary" }}
                  className="block border-l-2 border-border px-4 py-2 font-display text-sm tracking-wide uppercase"
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <Outlet />
        </div>
      </div>
      </div>
    </div>
  );
}
