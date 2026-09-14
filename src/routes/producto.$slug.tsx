import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { getCatalogo } from "@/lib/catalog.functions";
import { ProductThumb } from "@/components/ProductThumb";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { eur, precioAnterior } from "@/lib/format";

const catalogoQuery = queryOptions({ queryKey: ["catalogo"], queryFn: () => getCatalogo() });

export const Route = createFileRoute("/producto/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(catalogoQuery);
    const producto = data.products.find((p) => p.slug === params.slug);
    if (!producto) throw notFound();
    return { nombre: producto.name, descripcion: producto.description };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Producto no disponible | Urban Print" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.nombre} | Urban Print`;
    const description =
      loaderData.descripcion ?? `${loaderData.nombre} personalizado en Urban Print, Orihuela.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: ProductoPage,
  errorComponent: () => (
    <div className="w-full px-4 py-20">
      <p className="mx-auto max-w-7xl text-muted-foreground">
        No se ha podido cargar el producto.
      </p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="w-full px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <h1 className="font-display text-3xl uppercase">Producto no encontrado</h1>
        <Link to="/" className="mt-4 inline-block text-primary underline">
          Volver al inicio
        </Link>
      </div>
    </div>
  ),
});

function ProductoPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(catalogoQuery);
  const { add } = useCart();
  const [cantidad, setCantidad] = useState(1);

  const producto = data.products.find((p) => p.slug === slug);
  if (!producto) return null;

  const categoria = data.categories.find((c) => c.id === producto.category_id);
  const relacionados = data.products
    .filter((p) => p.category_id === producto.category_id && p.id !== producto.id)
    .slice(0, 4);

  return (
    <div className="w-full px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <nav className="text-xs text-muted-foreground" aria-label="Migas de pan">
          <Link to="/" className="hover:text-primary">
            Inicio
          </Link>
          {categoria && (
            <>
              {" / "}
              <Link
                to="/categoria/$slug"
                params={{ slug: categoria.slug }}
                className="hover:text-primary"
              >
                {categoria.name}
              </Link>
            </>
          )}
          {" / "}
          <span className="text-foreground">{producto.name}</span>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-2">
          <div>
            <h1 className="font-display text-3xl tracking-tight uppercase md:text-4xl lg:hidden">
              {producto.name}
            </h1>
            <ProductThumb name={producto.name} image={producto.image} className="mt-6 lg:mt-0" />
          </div>
          <div>
            <h1 className="hidden font-display text-3xl tracking-tight uppercase md:text-4xl lg:block">
              {producto.name}
            </h1>
            <span className="mt-3 block h-0.5 w-12 bg-primary" />

            <p className="mt-5 leading-relaxed text-muted-foreground">
              {producto.description ??
                `${producto.name}: producto personalizable que puedes solicitar directamente desde la web. Nos envías tu diseño o te ayudamos a crearlo, revisamos el archivo sin coste y lo producimos en nuestro taller de Orihuela.`}
            </p>

            <aside className="mt-6 border-l-4 border-primary bg-muted/60 p-5">
              <h2 className="font-display text-sm tracking-widest uppercase">
                Información adicional
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  Cómo funciona: añade el producto al carrito indicando la cantidad y, tras el
                  pedido, envíanos el arte final o solicita que lo diseñemos nosotros.
                </li>
                <li>
                  Archivos recomendados: PDF vectorizado, TIFF, JPG o Illustrator a 300 ppp en CMYK.
                  Revisamos tu archivo de forma gratuita antes de imprimir.
                </li>
                {categoria && <li>Categoría: {categoria.name}. Acabados y medidas a medida bajo consulta.</li>}
                <li>Envíos a península y Baleares, o recogida en nuestro taller de Orihuela.</li>
              </ul>
            </aside>

            <div className="mt-6 flex flex-wrap items-baseline gap-3">
              <span className="text-base text-muted-foreground line-through">
                {eur(precioAnterior(Number(producto.price)))}
              </span>
              <p className="text-3xl font-bold text-primary">{eur(Number(producto.price))}</p>
              <span className="bg-primary px-2 py-1 font-display text-[0.65rem] tracking-widest text-primary-foreground uppercase">
                Oferta
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">IVA no incluido · Precio orientativo</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="text-sm">Cantidad</span>
              <div className="flex h-11 items-center border border-input">
                <button
                  type="button"
                  aria-label="Disminuir cantidad"
                  onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                  className="flex h-full w-10 items-center justify-center transition-colors hover:bg-muted"
                >
                  <Minus className="size-4" />
                </button>
                <input
                  id="cantidad"
                  type="number"
                  min={1}
                  max={999}
                  aria-label="Cantidad"
                  value={cantidad}
                  onChange={(e) => setCantidad(Math.max(1, Math.min(999, Number(e.target.value) || 1)))}
                  className="h-full w-14 border-x border-input bg-background text-center text-sm outline-none [appearance:textfield] focus:border-primary [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  aria-label="Aumentar cantidad"
                  onClick={() => setCantidad((c) => Math.min(999, c + 1))}
                  className="flex h-full w-10 items-center justify-center transition-colors hover:bg-muted"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <Button
                size="lg"
                onClick={() => {
                  add(
                    { slug: producto.slug, name: producto.name, price: Number(producto.price) },
                    cantidad,
                  );
                  toast.success(`${producto.name} añadido al carrito`);
                }}
              >
                Añadir al carrito
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/contacto">Consultar personalización</Link>
              </Button>
            </div>
          </div>
        </div>


        {relacionados.length > 0 && (
          <section className="mt-20">
            <h2 className="font-display text-2xl tracking-tight uppercase">También te puede interesar</h2>
            <span className="mt-2 block h-0.5 w-12 bg-primary" />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relacionados.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
