/**
 * Cálculos económicos del panel de administración.
 * Todos los márgenes se calculan sobre el precio SIN IVA.
 */

export type Economia = {
  id: string;
  product_slug: string;
  sku: string | null;
  vat_rate: number;
  cost_materials: number;
  cost_printing: number;
  cost_production: number;
  cost_labor: number;
  cost_packaging: number;
  cost_handling: number;
  cost_shipping: number;
  cost_other: number;
  notes: string | null;
  updated_at: string;
};

export type Gasto = {
  id: string;
  name: string;
  kind: string;
  amount: number;
  is_percentage: boolean;
  scope: string;
  category_slug: string | null;
  product_slug: string | null;
  active: boolean;
  notes: string | null;
};

export type Tramo = {
  id: string;
  product_slug: string;
  min_qty: number;
  max_qty: number | null;
  unit_cost: number;
};

export const IVA_POR_DEFECTO = 21;

export const CAMPOS_COSTE = [
  { key: "cost_materials", label: "Materiales" },
  { key: "cost_printing", label: "Impresión" },
  { key: "cost_production", label: "Producción" },
  { key: "cost_labor", label: "Mano de obra" },
  { key: "cost_packaging", label: "Embalaje" },
  { key: "cost_handling", label: "Manipulación" },
  { key: "cost_shipping", label: "Envío asumido" },
  { key: "cost_other", label: "Otros costes directos" },
] as const;

export type CampoCoste = (typeof CAMPOS_COSTE)[number]["key"];

export const TIPOS_GASTO = [
  { value: "comision_pago", label: "Comisión de pago" },
  { value: "comision_externa", label: "Comisión externa" },
  { value: "envio", label: "Envío asumido" },
  { value: "descuento", label: "Descuento" },
  { value: "publicidad", label: "Publicidad" },
  { value: "otros", label: "Otros gastos" },
] as const;

export function num(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export function redondear(value: number): number {
  return Math.round(value * 100) / 100;
}

/** El precio público se almacena con IVA incluido. */
export function precioSinIva(precioConIva: number, iva: number): number {
  return redondear(precioConIva / (1 + num(iva) / 100));
}

export function importeIva(precioConIva: number, iva: number): number {
  return redondear(precioConIva - precioSinIva(precioConIva, iva));
}

export function costeTotal(eco: Partial<Economia> | null | undefined): number {
  if (!eco) return 0;
  return redondear(CAMPOS_COSTE.reduce((total, campo) => total + num(eco[campo.key]), 0));
}

export function tieneCostes(eco: Partial<Economia> | null | undefined): boolean {
  if (!eco) return false;
  return CAMPOS_COSTE.some((campo) => num(eco[campo.key]) > 0);
}

/** Coste unitario según tramos de cantidad; si no hay tramos usa el coste base. */
export function costeSegunCantidad(base: number, tramos: Tramo[], cantidad: number): number {
  const aplicable = tramos
    .filter((t) => cantidad >= t.min_qty && (t.max_qty === null || cantidad <= t.max_qty))
    .sort((a, b) => b.min_qty - a.min_qty)[0];
  return aplicable ? num(aplicable.unit_cost) : base;
}

export function gastosAplicables(gastos: Gasto[], productSlug: string, categorySlug: string): Gasto[] {
  return gastos.filter((g) => {
    if (!g.active) return false;
    if (g.scope === "global") return true;
    if (g.scope === "categoria") return g.category_slug === categorySlug;
    if (g.scope === "producto") return g.product_slug === productSlug;
    return false;
  });
}

export function importeGastos(gastos: Gasto[], baseSinIva: number): number {
  return redondear(
    gastos.reduce(
      (total, g) => total + (g.is_percentage ? (baseSinIva * num(g.amount)) / 100 : num(g.amount)),
      0,
    ),
  );
}

export type Resultado = {
  precioConIva: number;
  precioSinIva: number;
  iva: number;
  costeTotal: number;
  beneficioBruto: number;
  margenBruto: number;
  gastos: number;
  beneficioNeto: number;
  margenNeto: number;
};

export function calcular(params: {
  precioConIva: number;
  ivaRate: number;
  coste: number;
  gastos: number;
}): Resultado {
  const sinIva = precioSinIva(params.precioConIva, params.ivaRate);
  const bruto = redondear(sinIva - params.coste);
  const neto = redondear(bruto - params.gastos);
  return {
    precioConIva: redondear(params.precioConIva),
    precioSinIva: sinIva,
    iva: redondear(params.precioConIva - sinIva),
    costeTotal: redondear(params.coste),
    beneficioBruto: bruto,
    margenBruto: sinIva > 0 ? redondear((bruto / sinIva) * 100) : 0,
    gastos: redondear(params.gastos),
    beneficioNeto: neto,
    margenNeto: sinIva > 0 ? redondear((neto / sinIva) * 100) : 0,
  };
}

export function pct(value: number): string {
  return `${new Intl.NumberFormat("es-ES", { maximumFractionDigits: 2 }).format(value)} %`;
}

export const PERIODOS = [
  { value: "hoy", label: "Hoy" },
  { value: "7d", label: "Últimos 7 días" },
  { value: "30d", label: "Últimos 30 días" },
  { value: "mes", label: "Este mes" },
  { value: "mes_anterior", label: "Mes anterior" },
  { value: "anio", label: "Este año" },
  { value: "personalizado", label: "Rango personalizado" },
] as const;

export function rangoPeriodo(
  periodo: string,
  desde?: string,
  hasta?: string,
): { from: Date; to: Date } {
  const now = new Date();
  const inicioDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  switch (periodo) {
    case "hoy":
      return { from: inicioDia(now), to: now };
    case "7d":
      return { from: new Date(now.getTime() - 7 * 864e5), to: now };
    case "mes":
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now };
    case "mes_anterior":
      return {
        from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        to: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59),
      };
    case "anio":
      return { from: new Date(now.getFullYear(), 0, 1), to: now };
    case "personalizado":
      return {
        from: desde ? new Date(desde) : new Date(now.getTime() - 30 * 864e5),
        to: hasta ? new Date(`${hasta}T23:59:59`) : now,
      };
    default:
      return { from: new Date(now.getTime() - 30 * 864e5), to: now };
  }
}
