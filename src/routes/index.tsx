import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Award, Clock, Palette, Truck } from "lucide-react";
import { getCatalogo, getReviews } from "@/lib/catalog.functions";
import { CATEGORIAS, CATEGORIA_TITULOS, EMPRESA } from "@/lib/site";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import { ProductThumb } from "@/components/ProductThumb";
import { ReviewsCarousel } from "@/components/ReviewsCarousel";
import { Button } from "@/components/ui/button";

// Imagen del hero
import heroImage from "@/assets/hero/hero-urbanprint.png";

// Imágenes de categorías
import imgImprenta from "@/assets/categories/categoria-imprenta.png";
import imgGranFormato from "@/assets/categories/categoria-gran-formato.png";
import imgTextil from "@/assets/categories/categoria-textil.png";
import imgMerchandising from "@/assets/categories/categoria-merchandising.png";
import imgEventos from "@/assets/categories/categoria-eventos.png";
import imgBodas from "@/assets/categories/categoria-bodas.png";
import imgSellos from "@/assets/categories/categoria-sellos.png";
import imgRegalos from "@/assets/categories/categoria-regalos-personalizados.png";

// Mapeo de slugs de categorías a imágenes
const categoriaImagen: Record<string, string | null> = {
  imprenta: imgImprenta,
  "gran-formato": imgGranFormato,
  "impresion-textil": imgTextil,
  merchandising: imgMerchandising,
  eventos: imgEventos,
  bodas: imgBodas,
  sellos: imgSellos,
  "regalos-personalizados": imgRegalos,
};
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const catalogoQuery = queryOptions({ queryKey: ["catalogo"], queryFn: () => getCatalogo() });
const reviewsQuery = queryOptions({ queryKey: ["reviews"], queryFn: () => getReviews() });

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(catalogoQuery),
      context.queryClient.ensureQueryData(reviewsQuery),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Urban Print | Imprenta y personalización en Orihuela" },
      {
        name: "description",
        content:
          "Imprenta, gran formato, impresión textil, merchandising, sellos y regalos personalizados en Orihuela (Alicante). Presupuesto sin compromiso.",
      },
      { property: "og:title", content: "Urban Print | Imprenta en Orihuela" },
      {
        property: "og:description",
        content: "Impresión, textil, merchandising y personalización con producción propia.",
      },
    ],
  }),
  component: Home,
});

const VENTAJAS = [
  { icon: Clock, titulo: "Entregas rápidas", texto: "Producción propia y plazos ajustados." },
  { icon: Palette, titulo: "Diseño incluido", texto: "Te ayudamos con el arte final." },
  { icon: Award, titulo: "Calidad garantizada", texto: "Materiales y tintas profesionales." },
  { icon: Truck, titulo: "Envíos península y Baleares", texto: "Recogida en tienda o entrega a domicilio." },
];

const FAQS = [
  {
    question: "¿Cómo debo enviar los archivos para la impresión?",
    answer:
      "Puedes adjuntarlos directamente al realizar tu pedido o enviarlos a nuestros correos de contacto (urbanprint.orihuela@gmail.com / info@urbanprint.es). Nuestro equipo revisa siempre los archivos de forma gratuita antes de imprimir.",
  },
  {
    question: "¿Cuáles son los formatos de archivo aceptados?",
    answer:
      "Recomendamos enviar los archivos en PDF vectorizado, TIFF, JPG o Illustrator a alta resolución (300 ppp) y en modo de color CMYK.",
  },
  {
    question: "¿Hacéis envíos a toda España o es solo para recogida en tienda?",
    answer:
      "Realizamos envíos rápidos a península y Baleares, además de ofrecer la opción de recogida directa en nuestro taller físico en Orihuela. Actualmente no realizamos envíos a Canarias, Ceuta ni Melilla.",
  },
  {
    question: "¿Puedo solicitar un presupuesto a medida para grandes tiradas?",
    answer:
      "Sí. Si necesitas un proyecto gráfico especial, un volumen elevado o un formato personalizado, puedes contactarnos directamente y te prepararemos un presupuesto adaptado sin compromiso.",
  },
];

function Home() {
  const { data } = useSuspenseQuery(catalogoQuery);
  const { data: reviews } = useSuspenseQuery(reviewsQuery);

  const destacados = data.products.filter((p) => p.featured).slice(0, 8);
  const novedades = data.products.slice(0, 8);

  return (
    <div>
      <section className="border-b border-border bg-ink text-ink-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 lg:grid-cols-2">
          <div>
            <span className="block h-1 w-16 bg-primary" />
            <h1 className="mt-6 font-display text-4xl leading-[0.95] tracking-tight uppercase md:text-6xl">
              Impresión y personalización
              <span className="block text-primary">hecha en Orihuela</span>
            </h1>
            <p className="mt-5 max-w-xl text-ink-foreground/70">
              Imprenta general, gran formato, textil, merchandising, sellos y detalles para bodas y
              eventos. Todo con producción propia y asesoramiento directo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="micro-scale">
                <Link to="/categoria/$slug" params={{ slug: "imprenta" }}>
                  Ver catálogo <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="micro-scale border-ink-foreground/40 bg-transparent text-ink-foreground hover:bg-ink-foreground hover:text-ink"
              >
                <Link to="/contacto">Pedir presupuesto</Link>
              </Button>

            </div>
          </div>
          <ProductThumb name="Urban Print · Taller de impresión" image={heroImage} ratio="wide" />
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {VENTAJAS.map(({ icon: Icon, titulo, texto }) => (
            <div key={titulo} className="flex gap-3">
              <Icon className="size-6 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0">
                <h2 className="font-display text-sm tracking-wide uppercase">{titulo}</h2>
                <p className="text-sm text-muted-foreground">{texto}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl tracking-tight uppercase">Categorías</h2>
          <span className="mt-2 block h-0.5 w-12 bg-primary" />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIAS.map((cat) => (
              <Link
                key={cat.slug}
                to="/categoria/$slug"
                params={{ slug: cat.slug }}
                className="group flex flex-col border border-border transition-shadow hover:shadow-lg"
              >
                <ProductThumb
                  name={CATEGORIA_TITULOS[cat.slug] ?? cat.name}
                  image={categoriaImagen[cat.slug]}
                  ratio="wide"
                />
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <span className="font-display tracking-wide uppercase">
                    {CATEGORIA_TITULOS[cat.slug] ?? cat.name}
                  </span>
                  <p className="text-sm text-muted-foreground">{cat.descripcion}</p>
                  <span className="mt-auto flex items-center gap-1.5 pt-2 font-display text-xs tracking-widest text-primary uppercase">
                    Ver productos
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      <section className="w-full bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="font-display text-3xl tracking-tight uppercase">Productos destacados</h2>
          <span className="mt-2 block h-0.5 w-12 bg-primary" />
          <FeaturedCarousel products={destacados.length > 0 ? destacados : novedades} />

          <div className="mt-10 flex justify-center">
            <Button asChild size="lg" variant="outline">
              <Link to="/categoria/$slug" params={{ slug: "imprenta" }}>
                Ver todos los productos <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>


      {reviews.length > 0 && (
        <section className="border-y border-border bg-muted/50">
          <div className="mx-auto max-w-7xl px-4 py-16">
            <h2 className="font-display text-3xl tracking-tight uppercase">Opiniones de clientes</h2>
            <span className="mt-2 block h-0.5 w-12 bg-primary" />
            <ReviewsCarousel reviews={reviews} />
          </div>
        </section>
      )}

      <section id="faq" className="w-full border-y border-border bg-background">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <h2 className="text-center font-display text-3xl tracking-tight uppercase">
            Preguntas Frecuentes
          </h2>
          <span className="mx-auto mt-2 block h-0.5 w-12 bg-primary" />
          <p className="mx-auto mt-4 max-w-xl text-center text-sm text-muted-foreground">
            Resolvemos las dudas más habituales sobre envío de archivos, formatos, envíos y presupuestos.
          </p>
          <Accordion type="single" collapsible className="mt-8">
            {FAQS.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-border">
                <AccordionTrigger className="font-display text-base tracking-wide text-foreground hover:text-primary hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="w-full bg-ink px-4 py-16 text-ink-foreground">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl tracking-tight uppercase">
            ¿Tienes un proyecto en mente?
          </h2>
          <p className="mt-3 max-w-2xl text-ink-foreground/70">
            Visítanos en {EMPRESA.direccion} o escríbenos y te preparamos un presupuesto a medida.
          </p>
          <Button asChild size="lg" className="mt-6">
            <Link to="/contacto">Contactar</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
