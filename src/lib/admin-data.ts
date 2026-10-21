import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAdminData } from "./admin.functions";
import {
  calcular,
  costeTotal,
  gastosAplicables,
  importeGastos,
  num,
  rangoPeriodo,
  redondear,
  tieneCostes,
  type Economia,
  type Gasto,
  type Resultado,
  type Tramo,
} from "./admin-calc";

export type AdminData = Awaited<ReturnType<typeof getAdminData>>;

export const ADMIN_QUERY_KEY = ["admin-data"] as const;

export function useAdminData() {
  const fn = useServerFn(getAdminData);
  return useQuery({ queryKey: ADMIN_QUERY_KEY, queryFn: () => fn({}) });
}

export function useRefrescarAdmin() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: ADMIN_QUERY_KEY });
}

export type FilaProducto = {
  id: string;
  slug: string;
  name: string;
  sku: string;
  categoriaId: string;
  categoria: string;
  economia: Economia | null;
  tramos: Tramo[];
  gastosAplicados: Gasto[];
  configurado: boolean;
  unidades: number;
  ventas: number;
  costeVentas: number;
  beneficioBrutoTotal: number;
  gastosTotal: number;
  beneficioNetoTotal: number;
} & Resultado;

export function construirFilas(
  data: AdminData | undefined,
  periodo: string,
  desde?: string,
  hasta?: string,
): FilaProducto[] {
  if (!data) return [];
  const { from, to } = rangoPeriodo(periodo, desde, hasta);
  const catNombre = new Map(data.categories.map((c) => [c.id, c.name]));
  const ecoPorProducto = new Map(
    (data.economics as unknown as Economia[]).map((e) => [e.product_slug, e]),
  );
  const tramosPorProducto = new Map<string, Tramo[]>();
  for (const t of data.tiers as unknown as Tramo[]) {
    tramosPorProducto.set(t.product_slug, [...(tramosPorProducto.get(t.product_slug) ?? []), t]);
  }

  const ventasPorSlug = new Map<string, { unidades: number; importe: number }>();
  for (const item of data.items) {
    const fecha = new Date(item.created_at as string);
    if (fecha < from || fecha > to) continue;
    const previo = ventasPorSlug.get(item.product_slug) ?? { unidades: 0, importe: 0 };
    ventasPorSlug.set(item.product_slug, {
      unidades: previo.unidades + num(item.quantity),
      importe: previo.importe + num(item.unit_price) * num(item.quantity),
    });
  }

  return data.products.map((p) => {
    const economia = ecoPorProducto.get(p.slug) ?? null;
    const tramos = tramosPorProducto.get(p.slug) ?? [];
    const iva = economia ? num(economia.vat_rate) : 21;
    const coste = costeTotal(economia);
    const gastos = gastosAplicables(data.expenses as unknown as Gasto[], p.slug, p.category_slug ?? "");
    const resultado = calcular({
      precioConIva: num(p.price),
      ivaRate: iva,
      coste,
      gastos: importeGastos(gastos, 0),
    });
    const gastosUnidad = importeGastos(gastos, resultado.precioSinIva);
    const calculado = calcular({
      precioConIva: num(p.price),
      ivaRate: iva,
      coste,
      gastos: gastosUnidad,
    });
    const venta = ventasPorSlug.get(p.slug) ?? { unidades: 0, importe: 0 };
    const unidades = venta.unidades;

    return {
      ...calculado,
      id: p.id,
      slug: p.slug,
      name: p.name,
      sku: economia?.sku ?? "",
      categoriaId: p.category_id,
      categoria: catNombre.get(p.category_id) ?? "Sin categoría",
      economia,
      tramos,
      gastosAplicados: gastos,
      configurado: tieneCostes(economia),
      unidades,
      ventas: redondear(venta.importe),
      costeVentas: redondear(coste * unidades),
      beneficioBrutoTotal: redondear(calculado.beneficioBruto * unidades),
      gastosTotal: redondear(calculado.gastos * unidades),
      beneficioNetoTotal: redondear(calculado.beneficioNeto * unidades),
    };
  });
}

export type Totales = {
  ventas: number;
  ventasSinIva: number;
  costes: number;
  beneficioBruto: number;
  margenBruto: number;
  gastos: number;
  beneficioNeto: number;
  margenNeto: number;
  unidades: number;
};

export function totalizar(filas: FilaProducto[]): Totales {
  const ventas = filas.reduce((a, f) => a + f.ventas, 0);
  const ventasSinIva = filas.reduce((a, f) => a + f.precioSinIva * f.unidades, 0);
  const costes = filas.reduce((a, f) => a + f.costeVentas, 0);
  const bruto = filas.reduce((a, f) => a + f.beneficioBrutoTotal, 0);
  const gastos = filas.reduce((a, f) => a + f.gastosTotal, 0);
  const neto = filas.reduce((a, f) => a + f.beneficioNetoTotal, 0);
  return {
    ventas: redondear(ventas),
    ventasSinIva: redondear(ventasSinIva),
    costes: redondear(costes),
    beneficioBruto: redondear(bruto),
    margenBruto: ventasSinIva > 0 ? redondear((bruto / ventasSinIva) * 100) : 0,
    gastos: redondear(gastos),
    beneficioNeto: redondear(neto),
    margenNeto: ventasSinIva > 0 ? redondear((neto / ventasSinIva) * 100) : 0,
    unidades: filas.reduce((a, f) => a + f.unidades, 0),
  };
}

export function agruparPorCategoria(
  filas: FilaProducto[],
): { categoria: string; totales: Totales }[] {
  const mapa = new Map<string, FilaProducto[]>();
  for (const fila of filas) {
    mapa.set(fila.categoria, [...(mapa.get(fila.categoria) ?? []), fila]);
  }
  return [...mapa.entries()]
    .map(([categoria, items]) => ({ categoria, totales: totalizar(items) }))
    .sort((a, b) => b.totales.ventas - a.totales.ventas);
}
