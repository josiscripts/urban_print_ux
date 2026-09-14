import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPedidos } from "@/lib/account.functions";
import { eur, fecha } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/cuenta/pedidos")({
  component: PedidosPage,
});

function PedidosPage() {
  const fetchPedidos = useServerFn(getPedidos);
  const { data, isLoading } = useQuery({ queryKey: ["pedidos"], queryFn: () => fetchPedidos() });

  if (isLoading) return <p className="text-muted-foreground">Cargando…</p>;
  if (!data || data.length === 0)
    return (
      <section>
        <h2 className="font-display text-xl tracking-tight uppercase">Mis pedidos</h2>
        <p className="mt-4 text-muted-foreground">Todavía no has realizado ningún pedido.</p>
      </section>
    );

  return (
    <section>
      <h2 className="font-display text-xl tracking-tight uppercase">Mis pedidos</h2>
      <ul className="mt-6 space-y-4">
        {data.map((pedido) => (
          <li key={pedido.id} className="border border-border p-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:justify-between">
              <div className="min-w-0">
                <p className="font-display tracking-wide uppercase">{pedido.order_number}</p>
                <p className="text-sm text-muted-foreground">{fecha(pedido.created_at)}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-semibold">{eur(Number(pedido.total))}</p>
                <p className="text-xs text-primary uppercase">{pedido.status.replace(/_/g, " ")}</p>
              </div>
            </div>
            <ul className="mt-4 space-y-1 border-t border-border pt-3 text-sm text-muted-foreground">
              {pedido.order_items?.map((item, i) => (
                <li key={i} className="flex justify-between gap-4">
                  <span className="min-w-0 truncate">
                    {item.quantity} × {item.product_name}
                  </span>
                  <span className="shrink-0">{eur(Number(item.unit_price) * item.quantity)}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
