import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminTitulo, KpiEconomicos, Panel, Vacio } from "@/components/admin/AdminUI";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useAdminData,
  agruparPorCategoria,
  construirFilas,
  totalizar,
  type FilaProducto,
} from "@/lib/admin-data";
import { PERIODOS, pct } from "@/lib/admin-calc";
import { eur } from "@/lib/format";

export const Route = createFileRoute("/admin/rentabilidad")({
  head: () => ({
    meta: [
      { title: "Rentabilidad — Panel Admin Urban Print" },
      {
        name: "description",
        content: "Rentabilidad por producto, categoría y periodo con ranking ordenable.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminRentabilidad,
});

const ORDENES = [
  { value: "beneficio", label: "Mayor beneficio" },
  { value: "margen", label: "Mayor margen" },
  { value: "ventas", label: "Mayor volumen de ventas" },
  { value: "margen_bajo", label: "Menor margen" },
  { value: "coste", label: "Mayor coste" },
] as const;

function ordenar(filas: FilaProducto[], orden: string): FilaProducto[] {
  const copia = [...filas];
  switch (orden) {
    case "margen":
      return copia.sort((a, b) => b.margenNeto - a.margenNeto);
    case "ventas":
      return copia.sort((a, b) => b.ventas - a.ventas);
    case "margen_bajo":
      return copia.sort((a, b) => a.margenNeto - b.margenNeto);
    case "coste":
      return copia.sort((a, b) => b.costeTotal - a.costeTotal);
    default:
      return copia.sort((a, b) => b.beneficioNetoTotal - a.beneficioNetoTotal);
  }
}

function AdminRentabilidad() {
  const { data, isLoading } = useAdminData();
  const [periodo, setPeriodo] = useState("30d");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [orden, setOrden] = useState<string>("beneficio");

  const filas = useMemo(
    () => construirFilas(data, periodo, desde, hasta),
    [data, periodo, desde, hasta],
  );
  const totales = useMemo(() => totalizar(filas), [filas]);
  const porCategoria = useMemo(() => agruparPorCategoria(filas), [filas]);
  const ranking = useMemo(() => ordenar(filas, orden), [filas, orden]);

  return (
    <>
      <AdminTitulo
        titulo="Rentabilidad"
        descripcion="Análisis por producto, por categoría y por periodo. Los márgenes se calculan siempre sobre el precio sin IVA."
        acciones={
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            aria-label="Periodo"
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
          >
            {PERIODOS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        }
      />

      {periodo === "personalizado" && (
        <div className="grid gap-3 sm:grid-cols-2 sm:max-w-md">
          <div>
            <Label htmlFor="desde">Desde</Label>
            <Input
              id="desde"
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="hasta">Hasta</Label>
            <Input
              id="hasta"
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
            />
          </div>
        </div>
      )}

      {isLoading ? (
        <Vacio mensaje="Cargando rentabilidad…" />
      ) : (
        <>
          <KpiEconomicos {...totales} />

          <Panel titulo="Por categoría">
            <ul className="grid w-full min-w-0 gap-3 lg:hidden">
              {porCategoria.map((c) => (
                <li
                  key={c.categoria}
                  className="w-full min-w-0 overflow-hidden rounded-md border border-border p-3"
                >
                  <p className="truncate text-sm font-medium">{c.categoria}</p>
                  <dl className="mt-2 grid grid-cols-2 gap-2 text-xs [&_div]:min-w-0">
                    <div>
                      <dt className="text-muted-foreground">Ventas</dt>
                      <dd className="break-words tabular-nums">{eur(c.totales.ventas)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Costes</dt>
                      <dd className="break-words tabular-nums">{eur(c.totales.costes)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">B. bruto</dt>
                      <dd className="break-words tabular-nums">{eur(c.totales.beneficioBruto)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">M. bruto</dt>
                      <dd className="break-words tabular-nums">{pct(c.totales.margenBruto)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">B. neto</dt>
                      <dd className="break-words tabular-nums">{eur(c.totales.beneficioNeto)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">M. neto</dt>
                      <dd className="break-words tabular-nums">{pct(c.totales.margenNeto)}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
            <div className="hidden w-full max-w-full overflow-x-auto lg:block">
              <table className="w-full min-w-[42rem] text-sm">
                <thead className="text-left text-xs uppercase tracking-[0.06em] text-muted-foreground">
                  <tr>
                    <th className="py-2">Categoría</th>
                    <th className="py-2 text-right">Ventas</th>
                    <th className="py-2 text-right">Costes</th>
                    <th className="py-2 text-right">B. bruto</th>
                    <th className="py-2 text-right">M. bruto</th>
                    <th className="py-2 text-right">Gastos</th>
                    <th className="py-2 text-right">B. neto</th>
                    <th className="py-2 text-right">M. neto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {porCategoria.map((c) => (
                    <tr key={c.categoria}>
                      <td className="py-2">{c.categoria}</td>
                      <td className="py-2 text-right tabular-nums">{eur(c.totales.ventas)}</td>
                      <td className="py-2 text-right tabular-nums">{eur(c.totales.costes)}</td>
                      <td className="py-2 text-right tabular-nums">
                        {eur(c.totales.beneficioBruto)}
                      </td>
                      <td className="py-2 text-right tabular-nums">{pct(c.totales.margenBruto)}</td>
                      <td className="py-2 text-right tabular-nums">{eur(c.totales.gastos)}</td>
                      <td className="py-2 text-right tabular-nums">
                        {eur(c.totales.beneficioNeto)}
                      </td>
                      <td className="py-2 text-right tabular-nums">{pct(c.totales.margenNeto)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel
            titulo="Ranking de productos"
            accion={
              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
                aria-label="Ordenar por"
                className="h-9 rounded-md border border-border bg-background px-2 text-xs"
              >
                {ORDENES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            }
          >
            {/* Móvil: fichas */}
            <ul className="grid w-full min-w-0 gap-3 lg:hidden">
              {ranking.slice(0, 40).map((f) => (
                <li
                  key={f.id}
                  className="w-full min-w-0 overflow-hidden rounded-md border border-border p-3"
                >
                  <p className="truncate text-sm font-medium">{f.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{f.categoria}</p>
                  <dl className="mt-2 grid grid-cols-2 gap-2 text-xs [&_div]:min-w-0">
                    <div>
                      <dt className="text-muted-foreground">Ventas</dt>
                      <dd className="break-words tabular-nums">{eur(f.ventas)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">Coste unidad</dt>
                      <dd className="break-words tabular-nums">
                        {f.configurado ? eur(f.costeTotal) : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">B. bruto</dt>
                      <dd className="break-words tabular-nums">
                        {f.configurado ? eur(f.beneficioBruto) : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted-foreground">M. neto</dt>
                      <dd className="break-words tabular-nums">
                        {f.configurado ? pct(f.margenNeto) : "—"}
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>

            {/* Escritorio: tabla */}
            <div className="hidden w-full max-w-full overflow-x-auto lg:block">
              <table className="w-full min-w-[56rem] text-sm">
                <thead className="text-left text-xs uppercase tracking-[0.06em] text-muted-foreground">
                  <tr>
                    <th className="py-2">Producto</th>
                    <th className="py-2 text-right">Uds.</th>
                    <th className="py-2 text-right">Ventas</th>
                    <th className="py-2 text-right">Costes</th>
                    <th className="py-2 text-right">B. bruto</th>
                    <th className="py-2 text-right">M. bruto</th>
                    <th className="py-2 text-right">Gastos</th>
                    <th className="py-2 text-right">B. neto</th>
                    <th className="py-2 text-right">M. neto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {ranking.slice(0, 60).map((f) => (
                    <tr key={f.id} className="hover:bg-muted/40">
                      <td className="py-2">
                        <span className="block max-w-[18rem] truncate">{f.name}</span>
                      </td>
                      <td className="py-2 text-right tabular-nums">{f.unidades}</td>
                      <td className="py-2 text-right tabular-nums">{eur(f.ventas)}</td>
                      <td className="py-2 text-right tabular-nums">
                        {f.configurado ? eur(f.costeVentas) : "—"}
                      </td>
                      <td className="py-2 text-right tabular-nums">
                        {f.configurado ? eur(f.beneficioBrutoTotal) : "—"}
                      </td>
                      <td className="py-2 text-right tabular-nums">
                        {f.configurado ? pct(f.margenBruto) : "—"}
                      </td>
                      <td className="py-2 text-right tabular-nums">{eur(f.gastosTotal)}</td>
                      <td className="py-2 text-right tabular-nums">
                        {f.configurado ? eur(f.beneficioNetoTotal) : "—"}
                      </td>
                      <td className="py-2 text-right tabular-nums">
                        {f.configurado ? pct(f.margenNeto) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      )}
    </>
  );
}
