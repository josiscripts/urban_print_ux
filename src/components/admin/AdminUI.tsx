import type { ReactNode } from "react";
import { eur } from "@/lib/format";
import { pct } from "@/lib/admin-calc";
import { cn } from "@/lib/utils";

export function AdminTitulo({
  titulo,
  descripcion,
  acciones,
}: {
  titulo: string;
  descripcion?: string;
  acciones?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl uppercase tracking-tight sm:text-3xl">{titulo}</h1>
        {descripcion && (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{descripcion}</p>
        )}
      </div>
      {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
    </div>
  );
}

export function Kpi({
  label,
  valor,
  secundario,
  tono = "neutro",
}: {
  label: string;
  valor: string;
  secundario?: string;
  tono?: "neutro" | "positivo" | "negativo" | "acento";
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          "mt-2 font-display text-xl tabular-nums sm:text-2xl",
          tono === "positivo" && "text-emerald-600 dark:text-emerald-400",
          tono === "negativo" && "text-primary",
          tono === "acento" && "text-primary",
        )}
      >
        {valor}
      </p>
      {secundario && <p className="mt-1 text-xs text-muted-foreground">{secundario}</p>}
    </div>
  );
}

export function KpiEconomicos({
  ventas,
  costes,
  beneficioBruto,
  margenBruto,
  gastos,
  beneficioNeto,
  margenNeto,
}: {
  ventas: number;
  costes: number;
  beneficioBruto: number;
  margenBruto: number;
  gastos: number;
  beneficioNeto: number;
  margenNeto: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Kpi label="Ventas" valor={eur(ventas)} secundario="Importe facturado en el periodo" />
      <Kpi label="Costes" valor={eur(costes)} secundario="Coste directo de lo vendido" />
      <Kpi
        label="Beneficio bruto"
        valor={eur(beneficioBruto)}
        tono={beneficioBruto >= 0 ? "positivo" : "negativo"}
      />
      <Kpi label="Margen bruto" valor={pct(margenBruto)} secundario="Sobre precio sin IVA" />
      <Kpi label="Gastos" valor={eur(gastos)} secundario="Gastos adicionales aplicados" />
      <Kpi
        label="Beneficio neto"
        valor={eur(beneficioNeto)}
        tono={beneficioNeto >= 0 ? "positivo" : "negativo"}
      />
      <Kpi label="Margen neto" valor={pct(margenNeto)} secundario="Sobre precio sin IVA" />
      <Kpi
        label="Bruto vs neto"
        valor={`${pct(margenBruto)} / ${pct(margenNeto)}`}
        secundario="Comparativa"
        tono="acento"
      />
    </div>
  );
}

export function Panel({
  titulo,
  children,
  accion,
}: {
  titulo: string;
  children: ReactNode;
  accion?: ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-lg border border-border bg-card">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 className="font-display text-sm uppercase tracking-[0.06em]">{titulo}</h2>
        {accion}
      </header>
      <div className="min-w-0 p-4">{children}</div>
    </section>
  );
}

export function Vacio({ mensaje }: { mensaje: string }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{mensaje}</p>;
}

export function EtiquetaEstado({ configurado }: { configurado: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex max-w-[9rem] items-center rounded-full px-2 py-0.5 text-center text-[11px] font-semibold",
        configurado
          ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400"
          : "bg-primary/12 text-primary",
      )}
    >
      {configurado ? "Costes configurados" : "Pendiente de configurar"}
    </span>
  );
}
