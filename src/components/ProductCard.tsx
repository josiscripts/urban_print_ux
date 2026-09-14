import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProductThumb } from "@/components/ProductThumb";
import { useCart } from "@/lib/cart";
import { eur, precioAnterior } from "@/lib/format";
import type { Producto } from "@/lib/catalog.functions";

export function ProductCard({ product, oferta = false }: { product: Producto; oferta?: boolean }) {
  const { add } = useCart();
  const price = Number(product.price);

  return (
    <article className="group relative flex flex-col border border-border bg-card transition-shadow hover:shadow-lg">
      {oferta && (
        <span className="absolute top-3 left-3 z-10 bg-primary px-2 py-1 font-display text-[0.65rem] tracking-widest text-primary-foreground uppercase">
          Oferta
        </span>
      )}
      <Link to="/producto/$slug" params={{ slug: product.slug }} className="block">
        <ProductThumb name={product.name} image={product.image} />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="font-display text-base leading-tight">
          <Link
            to="/producto/$slug"
            params={{ slug: product.slug }}
            className="transition-colors hover:text-primary"
          >
            {product.name}
          </Link>
        </h3>
        {product.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
        )}
        <div className="mt-auto flex flex-wrap items-baseline gap-2">
          {oferta && (
            <span className="text-sm text-muted-foreground line-through">
              {eur(precioAnterior(price))}
            </span>
          )}
          <span className={oferta ? "text-xl font-bold text-primary" : "text-lg font-semibold"}>
            {eur(price)}
          </span>
        </div>
        <Button
          onClick={() => {
            add({ slug: product.slug, name: product.name, price });
            toast.success(`${product.name} añadido al carrito`);
          }}
        >
          Añadir al carrito
        </Button>
      </div>
    </article>
  );
}
