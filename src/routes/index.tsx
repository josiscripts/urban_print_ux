import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  MapPin,
  MessagesSquare,
  PackageCheck,
  Palette,
  PenTool,
  Truck,
  Zap,
} from "lucide-react";
import { getCatalogo, getReviews } from "@/lib/catalog.functions";
import { CATEGORIAS, CATEGORIA_TITULOS, EMPRESA } from "@/lib/site";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import { ProductThumb } from "@/components/ProductThumb";
import { ReviewsCarousel } from "@/components/ReviewsCarousel";
import { Button } from "@/components/ui/button";
import heroImageUrl from "@/assets/tienda_portada.png";
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const VENTAJAS = [
  {
    icon: PackageCheck,
    titulo: "Entregas rápidas",
    texto: (
      <>
        Plazos ajustados, porque
        <br />
        tu tiempo importa.
      </>
    ),
  },
  {
    icon: PenTool,
    titulo: "Diseño incluido",
    texto: (
      <>
        Tu proyecto, con el mejor
        <br />
        diseño.
      </>
    ),
  },
  { icon: BadgeCheck, titulo: "Calidad garantizada", texto: <>Materiales profesionales.</> },
  { icon: MessagesSquare, titulo: "Atención personalizada", texto: <>Resolución y cercanía.</> },
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
      <section className="relative isolate min-h-[100svh] w-full overflow-hidden bg-hero-black text-ink-foreground xl:hidden">
        <div className="absolute inset-x-0 top-0 -z-20 h-[68svh] min-h-[32rem] overflow-hidden sm:h-[70svh]">
          <img
            src={heroImageUrl}
            alt="Interior del taller Urban Print con maquinaria de impresión y productos personalizados"
            className="h-full w-full object-cover object-[62%_center] sm:object-[58%_center]"
            fetchPriority="high"
          />
        </div>
        <div
          className="absolute inset-x-0 top-0 -z-10 h-[76svh] min-h-[36rem] bg-[linear-gradient(to_bottom,color-mix(in_oklab,var(--hero-black)_8%,transparent)_0%,color-mix(in_oklab,var(--hero-black)_12%,transparent)_48%,color-mix(in_oklab,var(--hero-black)_55%,transparent)_68%,color-mix(in_oklab,var(--hero-black)_92%,transparent)_82%,var(--hero-black)_94%,var(--hero-black)_100%)]"
          aria-hidden
        />
        <div className="w-full px-5 pb-10 pt-[59svh] sm:px-10 sm:pb-14 sm:pt-[60svh] md:px-14 lg:px-20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 text-[0.65rem] font-semibold tracking-[0.22em] text-ink-foreground/80 uppercase sm:text-xs">
              <span className="h-0.5 w-9 shrink-0 bg-primary" />
              <span>Tu idea. Nuestra impresión</span>
            </div>
            <h1 className="mt-4 font-sans text-[2.2rem] font-bold leading-[0.94] tracking-[0em] uppercase min-[390px]:text-[2.45rem] sm:text-[3.75rem] md:text-[4.25rem]">
              <span className="block">Impresión y</span>
              <span className="block">personalización</span>
              <span className="block text-primary">hecha en Orihuela</span>
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-ink-foreground/82 sm:text-lg">
              Impresión general, gran formato,
              <br /> textil, merchandising y mucho más.
            </p>
            <div className="mt-6 grid w-full max-w-lg gap-3">
              <Button
                asChild
                size="lg"
                className="group micro-scale h-13 w-full rounded-none font-semibold uppercase"
              >
                <Link to="/categoria/$slug" params={{ slug: "imprenta" }}>
                  Ver catálogo{" "}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="group micro-scale h-13 w-full rounded-none border-ink-foreground/65 bg-transparent font-semibold text-ink-foreground uppercase hover:bg-ink-foreground hover:text-ink"
              >
                <Link to="/contacto">
                  Pedir presupuesto{" "}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-label="Ventajas de Urban Print"
        className="border-b border-border bg-background px-4 py-5 xl:hidden"
      >
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-px overflow-hidden border border-border bg-border sm:grid-cols-4">
          {[
            { icon: Zap, title: "Entrega rápida", text: "Plazos ajustados" },
            { icon: Palette, title: "Diseño incluido", text: "Te ayudamos a crear" },
            { icon: BadgeCheck, title: "Calidad garantizada", text: "Acabado profesional" },
            { icon: Truck, title: "Envíos península y Baleares", text: "Entrega segura" },
          ].map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="flex min-h-28 min-w-0 flex-col justify-center bg-background p-4 sm:min-h-32"
            >
              <Icon className="size-6 shrink-0 text-primary" aria-hidden />
              <h2 className="mt-3 text-xs font-bold leading-tight uppercase">{title}</h2>
              <p className="mt-1 text-[0.7rem] leading-snug text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="hidden overflow-hidden bg-hero-surface text-ink-foreground xl:block">
        <div className="grid min-h-[calc(100svh-15rem)] grid-cols-1 sm:min-h-[calc(100svh-17rem)] xl:min-h-[clamp(31rem,calc(100svh-13.5rem),47rem)] xl:grid-cols-[44%_56%]">
          <div className="relative z-10 flex [grid-area:1/1] items-center px-5 py-10 sm:px-8 sm:py-12 lg:px-[clamp(2rem,7vw,5rem)] xl:[grid-area:auto] xl:py-10 xl:pr-0 xl:pl-[clamp(2rem,5vw,5rem)]">
            <div className="w-full max-w-[38rem] xl:max-w-[41rem]">
              <div className="flex items-center gap-4 text-[0.68rem] font-medium tracking-[0.28em] text-ink-foreground/75 uppercase sm:text-xs">
                <span className="h-0.5 w-10 shrink-0 bg-primary sm:w-12" />
                <span>Tu idea, nuestra impresión</span>
              </div>
              <h1 className="mt-5 font-sans text-[2.35rem] font-bold leading-[0.94] tracking-[0.01em] uppercase min-[390px]:text-[2.65rem] sm:mt-6 sm:text-[clamp(3.5rem,7vw,4rem)] xl:text-[clamp(2.45rem,5vw,5.35rem)]">
                <span className="block">Impresión y</span>
                <span className="block">personalización</span>
                <span className="block text-primary">hecha en Orihuela</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-foreground/76 sm:mt-6 sm:text-lg xl:text-[clamp(1rem,1.35vw,1.35rem)]">
                Impresión general, gran formato,
                <br className="hidden sm:block" /> textil, merchandising y mucho más.
              </p>
              <div className="mt-7 flex w-fit max-w-full flex-col gap-3 sm:mt-8 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="group micro-scale h-12 rounded-full px-7 font-semibold sm:h-13 sm:min-w-52 sm:px-8"
                >
                  <Link to="/categoria/$slug" params={{ slug: "imprenta" }}>
                    Ver catálogo{" "}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="micro-scale h-12 rounded-full border-ink-foreground/60 bg-transparent px-7 font-semibold text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground sm:h-13 sm:min-w-52 sm:px-8"
                >
                  <Link to="/contacto">Pedir presupuesto</Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="hero-image-blend relative min-h-0 [grid-area:1/1] overflow-hidden xl:[grid-area:auto]">
            <img
              src={heroImageUrl}
              alt="Interior del taller Urban Print con maquinaria de impresión y productos personalizados"
              className="h-full w-full object-cover object-[64%_center] sm:object-[61%_center] lg:object-[58%_center]"
              fetchPriority="high"
            />
          </div>
        </div>

        <div className="border-t border-ink-foreground/10 bg-hero-panel/94">
          <div className="mx-auto grid max-w-[96rem] grid-cols-2 px-4 sm:px-8 xl:grid-cols-4 xl:px-[clamp(2rem,5vw,5rem)]">
            {VENTAJAS.map(({ icon: Icon, titulo, texto }) => (
              <div
                key={titulo}
                className="flex min-h-24 flex-col justify-center gap-2 border-b border-ink-foreground/10 py-4 odd:pr-3 even:border-l even:pl-3 nth-[3]:border-b-0 nth-[4]:border-b-0 sm:min-h-26 sm:flex-row sm:items-center sm:justify-start sm:gap-4 sm:odd:pr-5 sm:even:pl-5 xl:min-h-32 xl:border-b-0 xl:border-l xl:px-7 xl:first:border-l-0 xl:first:pl-0 xl:last:pr-0"
              >
                <Icon
                  className="size-7 shrink-0 stroke-[1.5] text-primary sm:size-8 xl:size-9"
                  aria-hidden
                />
                <div className="min-w-0">
                  <h2 className="font-sans text-[0.68rem] font-bold tracking-[0.02em] uppercase sm:text-xs">
                    {titulo}
                  </h2>
                  <p className="mt-1 text-[0.68rem] leading-snug text-ink-foreground/68 sm:text-xs sm:leading-relaxed">
                    {texto}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="categorias" className="w-full scroll-mt-24 px-4 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-3xl tracking-tight uppercase">Categorías</h2>
          <span className="mt-2 block h-0.5 w-12 bg-primary" />
          <div className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-4">
            {CATEGORIAS.map((cat) => (
              <Link
                key={cat.slug}
                to="/categoria/$slug"
                params={{ slug: cat.slug }}
                className="group flex w-[82vw] max-w-80 shrink-0 snap-start flex-col border border-border bg-card transition-shadow hover:shadow-lg sm:w-auto sm:max-w-none"
              >
                <ProductThumb name={CATEGORIA_TITULOS[cat.slug] ?? cat.name} ratio="wide" />
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

      <section id="destacados" className="w-full scroll-mt-24 bg-muted/50">
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

      <section className="border-y border-border bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="font-display text-3xl tracking-tight uppercase">
            Opiniones de clientes
          </h2>
          <span className="mt-2 block h-0.5 w-12 bg-primary" />
          <ReviewsCarousel reviews={reviews} />
        </div>
      </section>

      <section id="faq" className="w-full border-y border-border bg-background">
        <div className="mx-auto max-w-3xl px-4 py-16">
          <h2 className="text-center font-display text-3xl tracking-tight uppercase">
            Preguntas Frecuentes
          </h2>
          <span className="mx-auto mt-2 block h-0.5 w-12 bg-primary" />
          <p className="mx-auto mt-4 max-w-xl text-center text-sm text-muted-foreground">
            Resolvemos las dudas más habituales sobre envío de archivos, formatos, envíos y
            presupuestos.
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
