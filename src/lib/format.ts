export function eur(value: number): string {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value);
}

export function fecha(value: string): string {
  return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(new Date(value));
}

/**
 * Precio "antes" mostrado tachado en las promociones: un ligero incremento
 * sobre el precio real, redondeado a terminación ,90.
 */
export function precioAnterior(price: number): number {
  const bruto = price * 1.12;
  const anterior = Math.floor(bruto) + 0.9;
  return anterior <= price ? Math.round((price + 1) * 100) / 100 : Math.round(anterior * 100) / 100;
}


export const ESTADOS: Record<string, string> = {
  pendiente_pago: "Pendiente de pago",
  en_produccion: "En producción",
  enviado: "Enviado",
  completado: "Completado",
  cancelado: "Cancelado",
};
