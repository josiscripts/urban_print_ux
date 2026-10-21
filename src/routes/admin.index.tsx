import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AdminTitulo,
  KpiEconomicos,
  Panel,
  Vacio,
  EtiquetaEstado,
} from "@/components/admin/AdminUI";
import { useAdminData, construirFilas, totalizar } from "@/lib/admin-data";
import { PERIODOS, pct } from "@/lib/admin-calc";
import { eur, fecha } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Dashboard económico — Panel Admin Urban Print" },
      {
        name: "description",
        content: "Resumen de ventas, costes, márgenes y rentabilidad de Urban Print.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data, isLoading } = useAdminData();
  const [periodo, setPeriodo] = useState("30d");
  const filas = useMemo(() => construirFilas(data, periodo), [data, periodo]);
  const totales = useMemo(() => totalizar(filas), [filas]);

  const conCostes = filas.filter((f) => f.configurado);
  const masRentables = [...conCostes].sort((a, b) => b.margenNeto - a.margenNeto).slice(0, 5);
  const menorMargen = [...conCostes].sort((a, b) => a.margenNeto - b.margenNeto).slice(0, 5);
  const sinCostes = filas.filter((f) => !f.configurado);
  const historial = (data?.history ?? []).slice(0, 8);
  const nombrePorId = new Map(filas.map((f) => [f.id, f.name]));

  return (
    <>
      <AdminTitulo
        titulo="Dashboard"
        descripcion="Resumen económico calculado con los productos y pedidos reales de Urban Print."
        acciones={
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            aria-label="Periodo"
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
          >
            {PERIODOS.filter((p) => p.value !== "personalizado").map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        }
      />

      {isLoading ? (
        <Vacio mensaje="Cargando datos…" />
      ) : (
        <>
          <KpiEconomicos {...totales} />

          {totales.unidades === 0 && (
            <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              Todavía no hay pedidos en este periodo, por eso las ventas aparecen a cero. Los
              márgenes por unidad sí se calculan en cuanto introduces los costes de cada producto.
            </p>
          )}

          <div className="grid gap-4 xl:grid-cols-2">
            <Panel titulo="Productos más rentables">
              {masRentables.length === 0 ? (
                <Vacio mensaje="Introduce costes para ver el ranking." />
              ) : (
                <ul className="divide-y divide-border">
                  {masRentables.map((f) => (
                    <li key={f.id} className="flex items-center justify-between gap-3 py-2">
                      <span className="min-w-0 truncate text-sm">{f.name}</span>
                      <span className="shrink-0 text-sm tabular-nums text-emerald-600 dark:text-emerald-400">
                        {pct(f.margenNeto)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel titulo="Productos con menor margen">
              {menorMargen.length === 0 ? (
                <Vacio mensaje="Introduce costes para ver el ranking." />
              ) : (
                <ul className="divide-y divide-border">
                  {menorMargen.map((f) => (
                    <li key={f.id} className="flex items-center justify-between gap-3 py-2">
                      <span className="min-w-0 truncate text-sm">{f.name}</span>
                      <span className="shrink-0 text-sm tabular-nums text-primary">
                        {pct(f.margenNeto)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel
              titulo={`Sin costes configurados (${sinCostes.length})`}
              accion={
                <Link
                  to="/admin/productos"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Configurar →
                </Link>
              }
            >
              {sinCostes.length === 0 ? (
                <Vacio mensaje="Todos los productos tienen costes." />
              ) : (
                <ul className="divide-y divide-border">
                  {sinCostes.slice(0, 6).map((f) => (
                    <li key={f.id} className="flex items-center justify-between gap-3 py-2">
                      <span className="min-w-0 truncate text-sm">{f.name}</span>
                      <EtiquetaEstado configurado={false} />
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel titulo="Evolución de costes">
              {historial.length === 0 ? (
                <Vacio mensaje="Aún no hay cambios de coste registrados." />
              ) : (
                <ul className="divide-y divide-border">
                  {historial.map((h) => (
                    <li key={h.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                      <span className="min-w-0 truncate">
                        {nombrePorId.get(h.product_id) ?? "Producto"}
                      </span>
                      <span className="shrink-0 tabular-nums text-muted-foreground">
                        {eur(Number(h.previous_total))} → {eur(Number(h.new_total))} ·{" "}
                        {fecha(h.created_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </>
      )}
    </>
  );
}
