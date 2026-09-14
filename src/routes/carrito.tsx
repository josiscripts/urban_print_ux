import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart";
import { eur } from "@/lib/format";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/carrito")({
  head: () => ({
    meta: [
      { title: "Carrito | Urban Print" },
      { name: "description", content: "Revisa los productos de tu pedido antes de finalizar la compra." },
      { property: "og:title", content: "Carrito | Urban Print" },
      { property: "og:description", content: "Revisa tu pedido en Urban Print." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CarritoPage,
});

function CarritoPage() {
  const { items, remove, setQuantity, total, clear } = useCart();

  return (
    <div className="w-full px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <h1 className="font-display text-3xl tracking-tight uppercase">Carrito</h1>
        <span className="mt-2 block h-0.5 w-12 bg-primary" />

        {items.length === 0 ? (
          <div className="mt-10">
            <p className="text-muted-foreground">Tu carrito está vacío.</p>
            <Button asChild className="mt-6">
              <Link to="/categoria/$slug" params={{ slug: "imprenta" }}>
                Ver catálogo
              </Link>
            </Button>
          </div>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
            <ul className="divide-y divide-border border border-border">
              {items.map((item) => (
                <li
                  key={item.slug}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-4 sm:flex sm:justify-between"
                >
                  <div className="min-w-0">
                    <Link
                      to="/producto/$slug"
                      params={{ slug: item.slug }}
                      className="font-display tracking-wide uppercase hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">{eur(item.price)} / ud.</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <div className="flex items-center border border-border">
                      <button
                        type="button"
                        aria-label="Restar unidad"
                        onClick={() => setQuantity(item.slug, item.quantity - 1)}
                        className="grid size-9 place-items-center hover:bg-accent"
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="w-10 text-center text-sm">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label="Sumar unidad"
                        onClick={() => setQuantity(item.slug, item.quantity + 1)}
                        className="grid size-9 place-items-center hover:bg-accent"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                    <span className="w-20 text-right font-semibold">
                      {eur(item.price * item.quantity)}
                    </span>
                    <button
                      type="button"
                      aria-label={`Eliminar ${item.name}`}
                      onClick={() => remove(item.slug)}
                      className="grid size-9 place-items-center text-muted-foreground hover:text-primary"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <aside className="h-fit border border-border p-6">
              <h2 className="font-display text-lg tracking-wide uppercase">Resumen</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>{eur(total)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Envío</dt>
                  <dd>A calcular</dd>
                </div>
              </dl>
              <div className="mt-4 flex justify-between border-t border-border pt-4 font-display text-lg uppercase">
                <span>Total</span>
                <span>{eur(total)}</span>
              </div>
              <Button asChild size="lg" className="mt-6 w-full">
                <Link to="/checkout">Finalizar pedido</Link>
              </Button>
              <button
                type="button"
                onClick={clear}
                className="mt-3 w-full text-xs text-muted-foreground hover:text-primary"
              >
                Vaciar carrito
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
