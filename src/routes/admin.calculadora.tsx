import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AdminTitulo, Kpi, Panel } from "@/components/admin/AdminUI";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminData, construirFilas } from "@/lib/admin-data";
import { calcular, costeSegunCantidad, pct, redondear } from "@/lib/admin-calc";
import { eur } from "@/lib/format";

export const Route = createFileRoute("/admin/calculadora")({
  head: () => ({
    meta: [
      { title: "Calculadora de rentabilidad — Panel Admin Urban Print" },
      {
        name: "description",
        content: "Simulador de beneficio y margen por pedido. No modifica los datos reales.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminCalculadora,
});

function AdminCalculadora() {
  const { data } = useAdminData();
  const filas = useMemo(() => construirFilas(data, "30d"), [data]);

  const [productoId, setProductoId] = useState("");
  const [cantidad, setCantidad] = useState("10");
  const [precio, setPrecio] = useState("");
  const [descuento, setDescuento] = useState("0");
  const [coste, setCoste] = useState("");
  const [gastos, setGastos] = useState("0");
  const [iva, setIva] = useState("21");

  const producto = filas.find((f) => f.id === productoId) ?? null;

  function aplicarProducto(id: string) {
    setProductoId(id);
    const fila = filas.find((f) => f.id === id);
    if (!fila) return;
    setPrecio(String(fila.precioConIva));
    setIva(String(fila.economia ? Number(fila.economia.vat_rate) : 21));
    const unidades = Number(cantidad) || 1;
    setCoste(String(costeSegunCantidad(fila.costeTotal, fila.tramos, unidades)));
    setGastos(
      String(
        fila.gastosAplicados.length
          ? fila.gastosAplicados.reduce((a, g) => a + (g.is_percentage ? 0 : Number(g.amount)), 0)
          : 0,
      ),
    );
  }

  const resultado = useMemo(() => {
    const unidades = Math.max(1, Number(cantidad) || 1);
    const precioUnitario = Number(precio) || 0;
    const dto = Math.min(100, Math.max(0, Number(descuento) || 0));
    const precioConDto = redondear(precioUnitario * (1 - dto / 100));
    const unitario = calcular({
      precioConIva: precioConDto,
      ivaRate: Number(iva) || 0,
      coste: Number(coste) || 0,
      gastos: Number(gastos) || 0,
    });
    return {
      unidades,
      precioConDto,
      unitario,
      ventaTotal: redondear(precioConDto * unidades),
      ventaTotalSinIva: redondear(unitario.precioSinIva * unidades),
      costeTotal: redondear(unitario.costeTotal * unidades),
      brutoTotal: redondear(unitario.beneficioBruto * unidades),
      gastosTotal: redondear(unitario.gastos * unidades),
      netoTotal: redondear(unitario.beneficioNeto * unidades),
    };
  }, [cantidad, precio, descuento, coste, gastos, iva]);

  return (
    <>
      <AdminTitulo
        titulo="Calculadora"
        descripcion="Simulador independiente: nada de lo que introduzcas aquí modifica los datos reales del producto."
      />

      <div className="grid gap-4 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <Panel titulo="Datos de la simulación">
          <div className="flex flex-col gap-3">
            <div>
              <Label htmlFor="producto">Producto (opcional)</Label>
              <select
                id="producto"
                value={productoId}
                onChange={(e) => aplicarProducto(e.target.value)}
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              >
                <option value="">Simulación libre</option>
                {filas.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
              {producto && !producto.configurado && (
                <p className="mt-1 text-xs text-primary">
                  Este producto todavía no tiene costes configurados.
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="cantidad">Cantidad</Label>
                <Input
                  id="cantidad"
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="iva">IVA (%)</Label>
                <Input
                  id="iva"
                  type="number"
                  min="0"
                  step="0.01"
                  value={iva}
                  onChange={(e) => setIva(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="precio">Precio con IVA (€)</Label>
                <Input
                  id="precio"
                  type="number"
                  min="0"
                  step="0.01"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="descuento">Descuento (%)</Label>
                <Input
                  id="descuento"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={descuento}
                  onChange={(e) => setDescuento(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="coste">Coste unitario (€)</Label>
                <Input
                  id="coste"
                  type="number"
                  min="0"
                  step="0.01"
                  value={coste}
                  onChange={(e) => setCoste(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="gastos">Gastos por unidad (€)</Label>
                <Input
                  id="gastos"
                  type="number"
                  min="0"
                  step="0.01"
                  value={gastos}
                  onChange={(e) => setGastos(e.target.value)}
                />
              </div>
            </div>
          </div>
        </Panel>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Kpi
              label="Venta total"
              valor={eur(resultado.ventaTotal)}
              secundario={`Sin IVA: ${eur(resultado.ventaTotalSinIva)}`}
            />
            <Kpi
              label="Coste total"
              valor={eur(resultado.costeTotal)}
              secundario={`${resultado.unidades} unidades`}
            />
            <Kpi
              label="Beneficio bruto"
              valor={eur(resultado.brutoTotal)}
              tono={resultado.brutoTotal >= 0 ? "positivo" : "negativo"}
            />
            <Kpi
              label="Margen bruto"
              valor={pct(resultado.unitario.margenBruto)}
              secundario="Sobre precio sin IVA"
            />
            <Kpi label="Gastos" valor={eur(resultado.gastosTotal)} />
            <Kpi
              label="Beneficio neto"
              valor={eur(resultado.netoTotal)}
              tono={resultado.netoTotal >= 0 ? "positivo" : "negativo"}
            />
            <Kpi
              label="Margen neto"
              valor={pct(resultado.unitario.margenNeto)}
              secundario="Sobre precio sin IVA"
            />
            <Kpi
              label="Precio aplicado"
              valor={eur(resultado.precioConDto)}
              secundario="Con descuento e IVA"
              tono="acento"
            />
          </div>

          <Panel titulo="Detalle por unidad">
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Precio con IVA</dt>
                <dd className="tabular-nums">{eur(resultado.unitario.precioConIva)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">IVA</dt>
                <dd className="tabular-nums">{eur(resultado.unitario.iva)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Precio sin IVA</dt>
                <dd className="tabular-nums">{eur(resultado.unitario.precioSinIva)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Coste unitario</dt>
                <dd className="tabular-nums">{eur(resultado.unitario.costeTotal)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Beneficio bruto</dt>
                <dd className="tabular-nums">{eur(resultado.unitario.beneficioBruto)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Beneficio neto</dt>
                <dd className="tabular-nums">{eur(resultado.unitario.beneficioNeto)}</dd>
              </div>
            </dl>
          </Panel>
        </div>
      </div>
    </>
  );
}
