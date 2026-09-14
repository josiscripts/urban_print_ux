import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getCatalogo } from "@/lib/catalog.functions";
import { ProductCard } from "@/components/ProductCard";

const catalogoQuery = queryOptions({ queryKey: ["catalogo"], queryFn: () => getCatalogo() });

export const Route = createFileRoute("/categoria/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(catalogoQuery);

    // Validación defensiva: verificar que data y categories existan
    if (!data || !data.categories || !Array.isArray(data.categories)) {
      console.error(`[Categoria.$slug] ERROR: catálogo inválido`, {
        hasData: !!data,
        hasCategories: data ? !!data.categories : false,
        isArray: data && data.categories ? Array.isArray(data.categories) : false,
      });
      throw notFound();
    }

    // Búsqueda normal
    const categoria = data.categories.find((c) => c.slug === params.slug);
    if (!categoria) {
      console.warn(`[Categoria.$slug] Categoría no encontrada: slug="${params.slug}" (total: ${data.categories.length})`);
      throw notFound();
    }
    return { nombre: categoria.name, descripcion: categoria.description };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Categoría no disponible | Urban Print" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.nombre} | Urban Print`;
    const description =
      loaderData.descripcion ?? `Productos de ${loaderData.nombre} personalizados en Urban Print, Orihuela.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: CategoriaPage,
  errorComponent: () => (
    <div className="w-full px-4 py-20">
      <p className="mx-auto max-w-7xl text-muted-foreground">
        No se ha podido cargar la categoría.
      </p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="w-full px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <h1 className="font-display text-3xl uppercase">Categoría no encontrada</h1>
        <Link to="/" className="mt-4 inline-block text-primary underline">
          Volver al inicio
        </Link>
      </div>
    </div>
  ),
});

function CategoriaPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(catalogoQuery);

  const categoria = data.categories.find((c) => c.slug === slug);
  if (!categoria) return null;

  const hijas = data.categories.filter((c) => c.parent_id === categoria.id);
  const ids = new Set([categoria.id, ...hijas.map((c) => c.id)]);
  const productos = data.products.filter((p) => ids.has(p.category_id));

  return (
    <div>
      <section className="w-full border-b border-border bg-ink text-ink-foreground">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <span className="block h-1 w-16 bg-primary" />
          <h1 className="mt-5 font-display text-4xl tracking-tight uppercase">{categoria.name}</h1>
          {categoria.description && (
            <p className="mt-3 max-w-2xl text-ink-foreground/70">{categoria.description}</p>
          )}
        </div>
      </section>

      <div className="w-full px-4 py-12">
        <div className="mx-auto max-w-7xl">
          {hijas.length > 0 && (
            <nav className="mb-10 flex flex-wrap gap-2" aria-label="Subcategorías">
              {hijas.map((h) => (
                <Link
                  key={h.id}
                  to="/categoria/$slug"
                  params={{ slug: h.slug }}
                  className="border border-border px-4 py-2 font-display text-sm tracking-wide uppercase transition-colors hover:border-primary hover:text-primary"
                >
                  {h.name}
                </Link>
              ))}
            </nav>
          )}

          {productos.length === 0 ? (
            <p className="text-muted-foreground">Próximamente nuevos productos en esta categoría.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {productos.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
