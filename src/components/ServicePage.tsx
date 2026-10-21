import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductThumb } from "@/components/ProductThumb";

export type ServicioContenido = {
  titulo: string;
  intro: string;
  bloques: { titulo: string; texto: string }[];
  ventajas: string[];
  categoria?: string;
};

export function ServicePage({ contenido }: { contenido: ServicioContenido }) {
  return (
    <div>
      <section className="w-full border-b border-border bg-ink text-ink-foreground">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <span className="block h-1 w-16 bg-primary" />
          <h1 className="mt-6 max-w-3xl font-display text-4xl tracking-tight uppercase md:text-6xl">
            {contenido.titulo}
          </h1>
          <p className="mt-4 max-w-2xl text-ink-foreground/70">{contenido.intro}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="micro-scale">
              <Link to="/contacto">Pedir presupuesto</Link>
            </Button>
            {contenido.categoria && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-ink-foreground/40 bg-transparent text-ink-foreground hover:bg-ink-foreground hover:text-ink"
              >
                <Link to="/categoria/$slug" params={{ slug: contenido.categoria }}>
                  Ver productos
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="w-full px-4 py-16">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-10">
            {contenido.bloques.map((b) => (
              <article key={b.titulo}>
                <h2 className="font-display text-2xl tracking-tight uppercase">{b.titulo}</h2>
                <span className="mt-2 block h-0.5 w-12 bg-primary" />
                <p className="mt-4 leading-relaxed text-muted-foreground">{b.texto}</p>
              </article>
            ))}
          </div>
          <aside className="space-y-6">
            <ProductThumb name={contenido.titulo} ratio="wide" />
            <div className="border border-border p-6">
              <h2 className="font-display text-lg tracking-tight uppercase">Por qué Urban Print</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {contenido.ventajas.map((v) => (
                  <li key={v} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                    <span className="text-muted-foreground">{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
