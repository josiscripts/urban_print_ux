import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { AdminTitulo, Panel, Vacio } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminData, construirFilas, useRefrescarAdmin } from "@/lib/admin-data";
import { deleteTier, saveTier } from "@/lib/admin.functions";
import { CAMPOS_COSTE, costeSegunCantidad, num } from "@/lib/admin-calc";
import { eur, fecha } from "@/lib/format";

export const Route = createFileRoute("/admin/costes")({
  head: () => ({
    meta: [
      { title: "Costes y tramos — Panel Admin Urban Print" },
      {
        name: "description",
        content: "Desglose de costes, tramos por cantidad e histórico de cambios.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminCostes,
});

function AdminCostes() {
  const { data, isLoading } = useAdminData();
  const refrescar = useRefrescarAdmin();
  const crearTramo = useServerFn(saveTier);
  const borrarTramo = useServerFn(deleteTier);

  const filas = useMemo(() => construirFilas(data, "30d"), [data]);
  const [productoId, setProductoId] = useState("");
  const seleccion = filas.find((f) => f.id === productoId) ?? filas[0] ?? null;
  const [tramo, setTramo] = useState({ min: "1", max: "", coste: "" });
  const [cantidad, setCantidad] = useState("1");

  const historial = (data?.history ?? []).filter((h) => h.product_id === seleccion?.id);

  async function anadirTramo() {
    if (!seleccion) return;
    try {
      await crearTramo({
        data: {
          product_id: seleccion.id,
          min_qty: Number(tramo.min) || 1,
          max_qty: tramo.max.trim() ? Number(tramo.max) : null,
          unit_cost: Number(tramo.coste) || 0,
        },
      });
      await refrescar();
      setTramo({ min: "1", max: "", coste: "" });
      toast.success("Tramo añadido");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo añadir el tramo");
    }
  }

  async function eliminarTramo(id: string) {
    await borrarTramo({ data: { id } });
    await refrescar();
    toast.success("Tramo eliminado");
  }

  const costeAplicado = seleccion
    ? costeSegunCantidad(seleccion.costeTotal, seleccion.tramos, Number(cantidad) || 1)
    : 0;

  return (
    <>
      <AdminTitulo
        titulo="Costes"
        descripcion="Desglose por producto, tramos opcionales por cantidad e histórico de cambios de coste."
        acciones={
          <select
            value={seleccion?.id ?? ""}
            onChange={(e) => setProductoId(e.target.value)}
            aria-label="Producto"
            className="h-10 w-full max-w-xs rounded-md border border-border bg-background px-3 text-sm"
          >
            {filas.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        }
      />

      {isLoading || !seleccion ? (
        <Vacio mensaje={isLoading ? "Cargando costes…" : "No hay productos disponibles."} />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          <Panel titulo="Desglose de coste unitario">
            <dl className="divide-y divide-border text-sm">
              {CAMPOS_COSTE.map((campo) => (
                <div key={campo.key} className="flex items-center justify-between py-2">
                  <dt className="text-muted-foreground">{campo.label}</dt>
                  <dd className="tabular-nums">{eur(num(seleccion.economia?.[campo.key]))}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between py-2 font-semibold">
                <dt>Coste total unitario</dt>
                <dd className="tabular-nums">{eur(seleccion.costeTotal)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">
              Los costes se editan desde la ficha del producto; aquí el total siempre es la suma de
              sus componentes.
            </p>
          </Panel>

          <Panel titulo="Tramos por cantidad (opcional)">
            {seleccion.tramos.length === 0 ? (
              <Vacio mensaje="Este producto usa un coste único." />
            ) : (
              <ul className="divide-y divide-border text-sm">
                {seleccion.tramos.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-2 py-2">
                    <span>
                      {t.min_qty}–{t.max_qty ?? "∞"} uds.
                    </span>
                    <span className="flex items-center gap-2 tabular-nums">
                      {eur(num(t.unit_cost))}
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Eliminar tramo"
                        onClick={() => void eliminarTramo(t.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <form
              className="mt-4 grid gap-3 sm:grid-cols-4"
              onSubmit={(e) => {
                e.preventDefault();
                void anadirTramo();
              }}
            >
              <div>
                <Label htmlFor="min">Desde</Label>
                <Input
                  id="min"
                  type="number"
                  min="1"
                  value={tramo.min}
                  onChange={(e) => setTramo({ ...tramo, min: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="max">Hasta</Label>
                <Input
                  id="max"
                  type="number"
                  min="1"
                  placeholder="∞"
                  value={tramo.max}
                  onChange={(e) => setTramo({ ...tramo, max: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="coste">Coste (€)</Label>
                <Input
                  id="coste"
                  type="number"
                  min="0"
                  step="0.01"
                  value={tramo.coste}
                  onChange={(e) => setTramo({ ...tramo, coste: e.target.value })}
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="h-10 w-full">
                  Añadir
                </Button>
              </div>
            </form>

            <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-border pt-4">
              <div>
                <Label htmlFor="cantidad">Comprobar cantidad</Label>
                <Input
                  id="cantidad"
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  className="w-32"
                />
              </div>
              <p className="text-sm">
                Coste aplicado: <strong className="tabular-nums">{eur(costeAplicado)}</strong>
              </p>
            </div>
          </Panel>

          <Panel titulo="Histórico de costes">
            {historial.length === 0 ? (
              <Vacio mensaje="Sin cambios registrados para este producto." />
            ) : (
              <ul className="divide-y divide-border text-sm">
                {historial.map((h) => (
                  <li key={h.id} className="py-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="tabular-nums">
                        {eur(Number(h.previous_total))} → {eur(Number(h.new_total))}
                      </span>
                      <span className="text-xs text-muted-foreground">{fecha(h.created_at)}</span>
                    </div>
                    {h.reason && <p className="mt-1 text-xs text-muted-foreground">{h.reason}</p>}
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      )}
    </>
  );
}
