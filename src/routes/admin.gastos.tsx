import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { AdminTitulo, Panel, Vacio } from "@/components/admin/AdminUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminData, useRefrescarAdmin } from "@/lib/admin-data";
import { deleteExpense, saveExpense } from "@/lib/admin.functions";
import { TIPOS_GASTO, num, type Gasto } from "@/lib/admin-calc";
import { eur } from "@/lib/format";

export const Route = createFileRoute("/admin/gastos")({
  head: () => ({
    meta: [
      { title: "Gastos adicionales — Panel Admin Urban Print" },
      {
        name: "description",
        content: "Gastos que afectan al beneficio neto: comisiones, envíos, publicidad y otros.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminGastos,
});

const VACIO = {
  id: null as string | null,
  name: "",
  kind: "comision_pago",
  amount: "",
  is_percentage: true,
  scope: "global" as "global" | "categoria" | "producto",
  category_slug: "",
  product_slug: "",
  active: true,
  notes: "",
};

function AdminGastos() {
  const { data, isLoading } = useAdminData();
  const refrescar = useRefrescarAdmin();
  const guardar = useServerFn(saveExpense);
  const borrar = useServerFn(deleteExpense);
  const [form, setForm] = useState(VACIO);

  const gastos = (data?.expenses ?? []) as unknown as Gasto[];
  const categorias = data?.categories ?? [];
  const productos = data?.products ?? [];
  const nombreCategoria = useMemo(
    () => new Map(categorias.map((c) => [c.slug, c.name])),
    [categorias],
  );
  const nombreProducto = useMemo(() => new Map(productos.map((p) => [p.slug, p.name])), [productos]);

  async function enviar() {
    if (!form.name.trim()) {
      toast.error("Indica un nombre para el gasto");
      return;
    }
    try {
      await guardar({
        data: {
          id: form.id,
          name: form.name.trim(),
          kind: form.kind,
          amount: Number(form.amount) || 0,
          is_percentage: form.is_percentage,
          scope: form.scope,
          category_slug: form.category_slug || null,
          product_slug: form.product_slug || null,
          active: form.active,
          notes: form.notes.trim() || null,
        },
      });
      await refrescar();
      setForm(VACIO);
      toast.success("Gasto guardado");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el gasto");
    }
  }

  async function eliminar(id: string) {
    await borrar({ data: { id } });
    await refrescar();
    toast.success("Gasto eliminado");
  }

  function ambito(g: Gasto) {
    if (g.scope === "global") return "Todos los productos";
    if (g.scope === "categoria")
      return `Categoría: ${nombreCategoria.get(g.category_slug ?? "") ?? "—"}`;
    return `Producto: ${nombreProducto.get(g.product_slug ?? "") ?? "—"}`;
  }

  return (
    <>
      <AdminTitulo
        titulo="Gastos"
        descripcion="Gastos adicionales que se restan del beneficio bruto para obtener el beneficio neto. Cada gasto decide a qué productos se aplica."
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Panel titulo={`Gastos registrados (${gastos.length})`}>
          {isLoading ? (
            <Vacio mensaje="Cargando gastos…" />
          ) : gastos.length === 0 ? (
            <Vacio mensaje="Todavía no hay gastos registrados." />
          ) : (
            <ul className="divide-y divide-border">
              {gastos.map((g) => (
                <li
                  key={g.id}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {g.name}
                      {!g.active && (
                        <span className="ml-2 text-xs text-muted-foreground">(inactivo)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {TIPOS_GASTO.find((t) => t.value === g.kind)?.label ?? g.kind} · {ambito(g)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span className="text-sm tabular-nums">
                      {g.is_percentage ? `${num(g.amount)} %` : eur(num(g.amount))}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setForm({
                          id: g.id,
                          name: g.name,
                          kind: g.kind,
                          amount: String(num(g.amount)),
                          is_percentage: g.is_percentage,
                          scope: g.scope as typeof VACIO.scope,
                          category_slug: g.category_slug ?? "",
                          product_slug: g.product_slug ?? "",
                          active: g.active,
                          notes: g.notes ?? "",
                        })
                      }
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Eliminar gasto"
                      onClick={() => void eliminar(g.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel titulo={form.id ? "Editar gasto" : "Nuevo gasto"}>
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              void enviar();
            }}
          >
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={form.name}
                maxLength={120}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <select
                id="tipo"
                value={form.kind}
                onChange={(e) => setForm({ ...form, kind: e.target.value })}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              >
                {TIPOS_GASTO.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="importe">Valor</Label>
                <Input
                  id="importe"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="unidad">Unidad</Label>
                <select
                  id="unidad"
                  value={form.is_percentage ? "pct" : "eur"}
                  onChange={(e) => setForm({ ...form, is_percentage: e.target.value === "pct" })}
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                >
                  <option value="pct">% sobre precio sin IVA</option>
                  <option value="eur">€ por unidad</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="ambito">Se aplica a</Label>
              <select
                id="ambito"
                value={form.scope}
                onChange={(e) => setForm({ ...form, scope: e.target.value as typeof VACIO.scope })}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              >
                <option value="global">Todos los productos</option>
                <option value="categoria">Una categoría</option>
                <option value="producto">Un producto</option>
              </select>
            </div>
            {form.scope === "categoria" && (
              <div>
                <Label htmlFor="cat">Categoría</Label>
                <select
                  id="cat"
                  value={form.category_slug}
                  onChange={(e) => setForm({ ...form, category_slug: e.target.value })}
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                >
                  <option value="">Selecciona…</option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {form.scope === "producto" && (
              <div>
                <Label htmlFor="prod">Producto</Label>
                <select
                  id="prod"
                  value={form.product_slug}
                  onChange={(e) => setForm({ ...form, product_slug: e.target.value })}
                  className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                >
                  <option value="">Selecciona…</option>
                  {productos.map((p) => (
                    <option key={p.id} value={p.slug}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              Gasto activo
            </label>
            <div>
              <Label htmlFor="notas">Notas</Label>
              <Input
                id="notas"
                value={form.notes}
                maxLength={300}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="h-11 flex-1">
                {form.id ? "Guardar cambios" : "Añadir gasto"}
              </Button>
              {form.id && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11"
                  onClick={() => setForm(VACIO)}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Panel>
      </div>
    </>
  );
}
