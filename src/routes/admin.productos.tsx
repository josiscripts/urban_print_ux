import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AdminTitulo, EtiquetaEstado, Panel, Vacio } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  useAdminData,
  construirFilas,
  useRefrescarAdmin,
  type FilaProducto,
} from "@/lib/admin-data";
import { saveProductEconomics } from "@/lib/admin.functions";
import { CAMPOS_COSTE, calcular, num, pct, type CampoCoste } from "@/lib/admin-calc";
import { eur } from "@/lib/format";

export const Route = createFileRoute("/admin/productos")({
  head: () => ({
    meta: [
      { title: "Productos y costes — Panel Admin Urban Print" },
      { name: "description", content: "Ficha económica de cada producto real de Urban Print." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminProductos,
});

type Formulario = Record<CampoCoste, string> & { sku: string; vat_rate: string; reason: string };

function formularioDesde(fila: FilaProducto): Formulario {
  const base = {} as Formulario;
  for (const campo of CAMPOS_COSTE) {
    base[campo.key] = String(num(fila.economia?.[campo.key]));
  }
  base.sku = fila.sku;
  base.vat_rate = String(fila.economia ? num(fila.economia.vat_rate) : 21);
  base.reason = "";
  return base;
}

function AdminProductos() {
  const { data, isLoading } = useAdminData();
  const refrescar = useRefrescarAdmin();
  const guardar = useServerFn(saveProductEconomics);
  const [busqueda, setBusqueda] = useState("");
  const [seleccion, setSeleccion] = useState<FilaProducto | null>(null);
  const [form, setForm] = useState<Formulario | null>(null);
  const [guardando, setGuardando] = useState(false);

  const filas = useMemo(() => construirFilas(data, "30d"), [data]);
  const visibles = useMemo(
    () =>
      filas.filter((f) =>
        `${f.name} ${f.sku} ${f.categoria}`.toLowerCase().includes(busqueda.trim().toLowerCase()),
      ),
    [filas, busqueda],
  );

  const previsualizacion = useMemo(() => {
    if (!seleccion || !form) return null;
    const coste = CAMPOS_COSTE.reduce((total, campo) => total + num(Number(form[campo.key])), 0);
    return calcular({
      precioConIva: seleccion.precioConIva,
      ivaRate: Number(form.vat_rate) || 0,
      coste,
      gastos: seleccion.gastosAplicados.length
        ? seleccion.gastosAplicados.reduce(
            (a, g) =>
              a +
              (g.is_percentage
                ? ((seleccion.precioConIva / (1 + (Number(form.vat_rate) || 0) / 100)) *
                    num(g.amount)) /
                  100
                : num(g.amount)),
            0,
          )
        : 0,
    });
  }, [seleccion, form]);

  function abrir(fila: FilaProducto) {
    setSeleccion(fila);
    setForm(formularioDesde(fila));
  }

  async function enviar() {
    if (!seleccion || !form) return;
    setGuardando(true);
    try {
      const costes = {} as Record<CampoCoste, number>;
      for (const campo of CAMPOS_COSTE) costes[campo.key] = Number(form[campo.key]) || 0;
      await guardar({
        data: {
          product_id: seleccion.id,
          sku: form.sku.trim() || null,
          vat_rate: Number(form.vat_rate) || 0,
          ...costes,
          reason: form.reason.trim() || null,
        },
      });
      await refrescar();
      toast.success("Ficha económica guardada");
      setSeleccion(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <AdminTitulo
        titulo="Productos"
        descripcion="Productos reales del catálogo. El coste total y los márgenes se calculan automáticamente."
        acciones={
          <Input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar producto…"
            className="h-10 w-full sm:w-64"
            aria-label="Buscar producto"
          />
        }
      />

      {isLoading ? (
        <Vacio mensaje="Cargando productos…" />
      ) : visibles.length === 0 ? (
        <Vacio mensaje="Ningún producto coincide con la búsqueda." />
      ) : (
        <>
          {/* Móvil y tablet: fichas apiladas */}
          <div className="grid min-w-0 gap-3 lg:hidden">
            {visibles.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => abrir(f)}
                className="w-full min-w-0 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-display text-sm uppercase">{f.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {f.categoria}
                      {f.sku ? ` · ${f.sku}` : ""}
                    </p>
                  </div>
                  <EtiquetaEstado configurado={f.configurado} />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs [&_div]:min-w-0">
                  <div>
                    <dt className="text-muted-foreground">Precio con IVA</dt>
                    <dd className="tabular-nums">{eur(f.precioConIva)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Sin IVA</dt>
                    <dd className="tabular-nums">{eur(f.precioSinIva)}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Coste total</dt>
                    <dd className="tabular-nums">{f.configurado ? eur(f.costeTotal) : "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Margen bruto</dt>
                    <dd className="tabular-nums">{f.configurado ? pct(f.margenBruto) : "—"}</dd>
                  </div>
                </dl>
              </button>
            ))}
          </div>

          {/* Escritorio: tabla */}
          <div className="hidden overflow-x-auto rounded-lg border border-border lg:block">
            <table className="w-full min-w-[60rem] text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-[0.06em] text-muted-foreground">
                <tr>
                  <th className="px-3 py-3">Producto</th>
                  <th className="px-3 py-3">Categoría</th>
                  <th className="px-3 py-3 text-right">PVP</th>
                  <th className="px-3 py-3 text-right">Sin IVA</th>
                  <th className="px-3 py-3 text-right">Coste</th>
                  <th className="px-3 py-3 text-right">B. bruto</th>
                  <th className="px-3 py-3 text-right">M. bruto</th>
                  <th className="px-3 py-3 text-right">B. neto</th>
                  <th className="px-3 py-3 text-right">M. neto</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visibles.map((f) => (
                  <tr key={f.id} className="hover:bg-muted/40">
                    <td className="px-3 py-2">
                      <span className="block max-w-[18rem] truncate">{f.name}</span>
                      {f.sku && <span className="text-xs text-muted-foreground">{f.sku}</span>}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{f.categoria}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{eur(f.precioConIva)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{eur(f.precioSinIva)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {f.configurado ? eur(f.costeTotal) : "—"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {f.configurado ? eur(f.beneficioBruto) : "—"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {f.configurado ? pct(f.margenBruto) : "—"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {f.configurado ? eur(f.beneficioNeto) : "—"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {f.configurado ? pct(f.margenNeto) : "—"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button size="sm" variant="outline" onClick={() => abrir(f)}>
                        Editar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Sheet open={!!seleccion} onOpenChange={(open) => !open && setSeleccion(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader className="text-left">
            <SheetTitle className="font-display text-base uppercase">{seleccion?.name}</SheetTitle>
          </SheetHeader>
          {seleccion && form && (
            <form
              className="mt-4 flex flex-col gap-4 pb-8"
              onSubmit={(e) => {
                e.preventDefault();
                void enviar();
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="sku">Referencia (SKU)</Label>
                  <Input
                    id="sku"
                    value={form.sku}
                    maxLength={60}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="iva">IVA (%)</Label>
                  <Input
                    id="iva"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={form.vat_rate}
                    onChange={(e) => setForm({ ...form, vat_rate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {CAMPOS_COSTE.map((campo) => (
                  <div key={campo.key}>
                    <Label htmlFor={campo.key}>{campo.label} (€)</Label>
                    <Input
                      id={campo.key}
                      type="number"
                      step="0.01"
                      min="0"
                      value={form[campo.key]}
                      onChange={(e) => setForm({ ...form, [campo.key]: e.target.value })}
                    />
                  </div>
                ))}
              </div>

              <div>
                <Label htmlFor="motivo">Motivo del cambio (opcional)</Label>
                <Input
                  id="motivo"
                  value={form.reason}
                  maxLength={200}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                />
              </div>

              {previsualizacion && (
                <Panel titulo="Cálculo en vivo">
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <dt className="text-muted-foreground">Precio con IVA</dt>
                    <dd className="text-right tabular-nums">
                      {eur(previsualizacion.precioConIva)}
                    </dd>
                    <dt className="text-muted-foreground">IVA</dt>
                    <dd className="text-right tabular-nums">{eur(previsualizacion.iva)}</dd>
                    <dt className="text-muted-foreground">Precio sin IVA</dt>
                    <dd className="text-right tabular-nums">
                      {eur(previsualizacion.precioSinIva)}
                    </dd>
                    <dt className="text-muted-foreground">Coste total unitario</dt>
                    <dd className="text-right tabular-nums">{eur(previsualizacion.costeTotal)}</dd>
                    <dt className="text-muted-foreground">Beneficio bruto</dt>
                    <dd className="text-right tabular-nums">
                      {eur(previsualizacion.beneficioBruto)}
                    </dd>
                    <dt className="text-muted-foreground">Margen bruto</dt>
                    <dd className="text-right tabular-nums">{pct(previsualizacion.margenBruto)}</dd>
                    <dt className="text-muted-foreground">Gastos aplicables</dt>
                    <dd className="text-right tabular-nums">{eur(previsualizacion.gastos)}</dd>
                    <dt className="text-muted-foreground">Beneficio neto</dt>
                    <dd className="text-right tabular-nums">
                      {eur(previsualizacion.beneficioNeto)}
                    </dd>
                    <dt className="text-muted-foreground">Margen neto</dt>
                    <dd className="text-right tabular-nums">{pct(previsualizacion.margenNeto)}</dd>
                  </dl>
                </Panel>
              )}

              <Button type="submit" className="h-12 w-full" disabled={guardando}>
                {guardando ? "Guardando…" : "Guardar ficha económica"}
              </Button>
            </form>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
