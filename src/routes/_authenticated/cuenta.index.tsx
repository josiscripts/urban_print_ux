import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download, MapPin, Package, UserCog } from "lucide-react";
import { getDescargas, getDirecciones, getPedidos, getPerfil } from "@/lib/account.functions";
import { eur } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/cuenta/")({
  component: EscritorioPage,
});

function EscritorioPage() {
  const fetchPerfil = useServerFn(getPerfil);
  const fetchPedidos = useServerFn(getPedidos);
  const fetchDirecciones = useServerFn(getDirecciones);
  const fetchDescargas = useServerFn(getDescargas);

  const perfil = useQuery({ queryKey: ["perfil"], queryFn: () => fetchPerfil() });
  const pedidos = useQuery({ queryKey: ["pedidos"], queryFn: () => fetchPedidos() });
  const direcciones = useQuery({ queryKey: ["direcciones"], queryFn: () => fetchDirecciones() });
  const descargas = useQuery({ queryKey: ["descargas"], queryFn: () => fetchDescargas() });

  const nombre = [perfil.data?.first_name, perfil.data?.last_name].filter(Boolean).join(" ");
  const ultimos = (pedidos.data ?? []).slice(0, 3);

  const tarjetas = [
    {
      to: "/cuenta/pedidos" as const,
      icon: Package,
      label: "Pedidos",
      valor: pedidos.data?.length ?? 0,
    },
    {
      to: "/cuenta/direcciones" as const,
      icon: MapPin,
      label: "Direcciones",
      valor: direcciones.data?.length ?? 0,
    },
    {
      to: "/cuenta/descargas" as const,
      icon: Download,
      label: "Descargas",
      valor: descargas.data?.length ?? 0,
    },
    {
      to: "/cuenta/detalles" as const,
      icon: UserCog,
      label: "Detalles de la cuenta",
      valor: null,
    },
  ];

  return (
    <section>
      <h2 className="font-display text-xl tracking-tight uppercase">Escritorio</h2>
      <span className="mt-2 block h-0.5 w-12 bg-primary" />
      <p className="mt-4 text-muted-foreground">
        Hola{nombre ? ` ${nombre}` : ""}, desde aquí puedes revisar tus pedidos, gestionar tus
        direcciones de envío y facturación, descargar tus archivos y editar los datos de tu cuenta.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tarjetas.map(({ to, icon: Icon, label, valor }) => (
          <Link
            key={to}
            to={to}
            className="border border-border bg-card p-5 transition-colors hover:border-primary"
          >
            <Icon className="size-5 text-primary" aria-hidden />
            <p className="mt-4 font-display text-sm tracking-widest text-muted-foreground uppercase">
              {label}
            </p>
            {valor !== null && (
              <p className="mt-1 font-display text-2xl tracking-tight">{valor}</p>
            )}
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <h3 className="font-display text-lg tracking-tight uppercase">Últimos pedidos</h3>
        {ultimos.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Todavía no has realizado ningún pedido.{" "}
            <Link to="/" className="text-primary underline">
              Explorar el catálogo
            </Link>
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-border border border-border">
            {ultimos.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <span className="font-display text-sm tracking-wide uppercase">
                  #{p.order_number}
                </span>
                <span className="text-sm text-muted-foreground">
                  {new Date(p.created_at).toLocaleDateString("es-ES")}
                </span>
                <span className="text-sm text-muted-foreground">{p.status}</span>
                <span className="font-semibold text-primary">{eur(Number(p.total))}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
