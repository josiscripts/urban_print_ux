import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Cpu, FileSearch, HandCoins, Headphones, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductThumb } from "@/components/ProductThumb";
import { EMPRESA } from "@/lib/site";

export const Route = createFileRoute("/empresa")({
  head: () => ({
    meta: [
      { title: "Empresa | Urban Print Orihuela" },
      {
        name: "description",
        content:
          "Servicio integral de impresión en Orihuela: asesoramiento gratuito, precios justos, maquinaria de última generación y revisión gratuita de archivos.",
      },
      { property: "og:title", content: "Empresa | Urban Print" },
      {
        property: "og:description",
        content: "Filosofía, servicio integral y maquinaria avanzada de Urban Print en Orihuela.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmpresaPage,
});

const VALORES = [
  {
    icon: Layers,
    title: "Servicio integral",
    text: "Diseño, producción y acabado bajo un mismo techo en Orihuela: un único interlocutor de principio a fin.",
  },
  {
    icon: Headphones,
    title: "Asesoramiento gratuito",
    text: "Te ayudamos a elegir materiales, formatos y acabados sin coste, antes de que confirmes ningún pedido.",
  },
  {
    icon: HandCoins,
    title: "Precios justos",
    text: "Tarifas claras y sin sorpresas, ajustadas a la tirada y al acabado que realmente necesitas.",
  },
  {
    icon: Cpu,
    title: "Maquinaria de última generación",
    text: "Equipos digitales, gran formato, sublimación, corte de vinilo y bordado para cubrir cualquier soporte.",
  },
  {
    icon: FileSearch,
    title: "Revisión gratuita de archivos",
    text: "Comprobamos resolución, sangrados, perfiles de color y tipografías antes de imprimir tu trabajo.",
  },
  {
    icon: Award,
    title: "Calidad garantizada",
    text: "Controlamos cada tirada en taller: si algo no cumple nuestro estándar, no sale por la puerta.",
  },
] as const;

function EmpresaPage() {
  return (
    <div>
      <section className="w-full border-b border-border bg-ink text-ink-foreground">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <span className="block h-1 w-16 bg-primary" />
          <h1 className="mt-6 font-display text-4xl tracking-tight uppercase md:text-5xl">
            La empresa
          </h1>
          <p className="mt-4 max-w-2xl text-ink-foreground/70">
            Urban Print es una imprenta y taller de personalización en {EMPRESA.direccion}. Damos
            servicio a comercios, empresas, asociaciones y particulares de toda la Vega Baja.
          </p>
        </div>
      </section>

      <section className="w-full px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-2xl tracking-tight uppercase">Nuestra filosofía</h2>
          <span className="mt-2 block h-0.5 w-12 bg-primary" />
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {VALORES.map(({ icon: Icon, title, text }) => (
              <article key={title} className="border border-border bg-card p-6">
                <Icon className="size-6 text-primary" aria-hidden />
                <h3 className="mt-4 font-display text-lg tracking-tight uppercase">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full px-4 pb-16">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.3fr_1fr]">
          <div className="space-y-8">
            <article>
              <h2 className="font-display text-2xl tracking-tight uppercase">Cómo trabajamos</h2>
              <span className="mt-2 block h-0.5 w-12 bg-primary" />
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Escuchamos el proyecto, proponemos materiales y formatos, preparamos el arte final y
                producimos en nuestras propias máquinas. Ese control nos permite cumplir plazos
                ajustados incluso en pedidos urgentes.
              </p>
            </article>
            <article>
              <h2 className="font-display text-2xl tracking-tight uppercase">Visítanos</h2>
              <span className="mt-2 block h-0.5 w-12 bg-primary" />
              <p className="mt-4 leading-relaxed text-muted-foreground">
                Puedes acercarte a ver muestras y materiales, llamarnos al {EMPRESA.telefono} o
                escribirnos a {EMPRESA.emails[1]}.
              </p>
              <Button asChild className="mt-6">
                <Link to="/contacto">Hablar con nosotros</Link>
              </Button>
            </article>
          </div>
          <div className="space-y-6">
            <ProductThumb name="Taller Urban Print" ratio="wide" />
            <ProductThumb name="Producción textil" ratio="wide" />
          </div>
        </div>
      </section>
    </div>
  );
}
