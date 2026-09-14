import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useCart } from "@/lib/cart";
import { eur } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { crearPedido } from "@/lib/account.functions";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, CreditCard } from "lucide-react";
import { esZonaExcluida, MENSAJE_ZONA_EXCLUIDA } from "@/lib/shipping";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Finalizar pedido | Urban Print" },
      { name: "description", content: "Completa tus datos de envío y confirma tu pedido." },
      { property: "og:title", content: "Finalizar pedido | Urban Print" },
      { property: "og:description", content: "Confirma tu pedido en Urban Print." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Indica el nombre completo").max(120),
  street: z.string().trim().min(3, "Indica la dirección").max(200),
  postal_code: z.string().trim().min(3, "Código postal no válido").max(12),
  city: z.string().trim().min(2, "Indica la localidad").max(80),
  province: z.string().trim().min(2, "Indica la provincia").max(80),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

function CheckoutPage() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [sesion, setSesion] = useState<boolean | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [zona, setZona] = useState({ postal_code: "", city: "", province: "" });
  const zonaBloqueada = esZonaExcluida(zona);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSesion(Boolean(data.user)));
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(form));
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    if (esZonaExcluida(parsed.data)) {
      toast.error(MENSAJE_ZONA_EXCLUIDA);
      return;
    }
    setEnviando(true);
    try {
      const { notes, ...shipping } = parsed.data;
      const res = await crearPedido({
        data: {
          items: items.map((i) => ({
            slug: i.slug,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
          shipping,
          notes: notes ?? "",
        },
      });
      clear();
      toast.success(`Pedido ${res.orderNumber} registrado`);
      navigate({ to: "/cuenta/pedidos" });
    } catch {
      toast.error("No se ha podido registrar el pedido. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }


  if (items.length === 0) {
    return (
      <div className="w-full px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-display text-3xl uppercase">Finalizar pedido</h1>
          <p className="mt-4 text-muted-foreground">No hay productos en el carrito.</p>
          <Button asChild className="mt-6">
            <Link to="/categoria/$slug" params={{ slug: "imprenta" }}>
              Ver catálogo
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <h1 className="font-display text-3xl tracking-tight uppercase">Finalizar pedido</h1>
      <span className="mt-2 block h-0.5 w-12 bg-primary" />

      {sesion === false && (
        <div className="mt-8 border border-primary/40 bg-primary/5 p-5">
          <p className="text-sm">
            Necesitas una cuenta para completar el pedido y seguir su estado.{" "}
            <Link to="/auth" className="font-semibold text-primary underline">
              Iniciar sesión o registrarse
            </Link>
          </p>
        </div>
      )}

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <Campo id="name" label="Nombre y apellidos" error={errors['name']} />
          <Campo id="street" label="Dirección" error={errors['street']} />
          <div className="grid gap-5 sm:grid-cols-3">
            <Campo
              id="postal_code"
              label="Código postal"
              error={errors['postal_code']}
              onChange={(v) => setZona((z) => ({ ...z, postal_code: v }))}
            />
            <Campo
              id="city"
              label="Localidad"
              error={errors['city']}
              onChange={(v) => setZona((z) => ({ ...z, city: v }))}
            />
            <Campo
              id="province"
              label="Provincia"
              error={errors['province']}
              onChange={(v) => setZona((z) => ({ ...z, province: v }))}
            />
          </div>

          {zonaBloqueada && (
            <div
              role="alert"
              className="flex gap-3 border border-primary bg-primary/5 p-4 text-sm"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <p>
                <strong className="font-semibold">{MENSAJE_ZONA_EXCLUIDA}</strong> Indica una
                dirección de la península o Baleares para continuar con el pedido.
              </p>
            </div>
          )}

          <fieldset className="border border-border p-5">
            <legend className="px-2 font-display text-xs tracking-widest uppercase">
              Método de pago
            </legend>
            <label className="flex items-start gap-3">
              <input
                type="radio"
                name="payment_method"
                value="tarjeta"
                defaultChecked
                className="mt-1 accent-[var(--color-primary)]"
              />
              <span className="text-sm">
                <span className="flex items-center gap-2 font-semibold">
                  <CreditCard className="size-4 text-primary" aria-hidden />
                  Tarjeta de crédito o débito
                </span>
                <span className="mt-1 block text-muted-foreground">
                  Visa, Mastercard y American Express. Pago seguro con cifrado SSL. Es el único
                  método de pago disponible.
                </span>
              </span>
            </label>
          </fieldset>

          <div>
            <label htmlFor="notes" className="font-display text-xs tracking-widest uppercase">
              Notas del pedido
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              maxLength={1000}
              className="mt-2 w-full border border-input bg-background p-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <Button type="submit" size="lg" disabled={enviando || sesion === false || zonaBloqueada}>
            {enviando ? "Enviando…" : "Confirmar pedido"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Solo aceptamos pago con tarjeta de crédito o débito. El cobro se realiza tras la
            validación del arte final; te contactaremos para confirmarlo.
          </p>
          <p className="text-xs text-muted-foreground">{MENSAJE_ZONA_EXCLUIDA}</p>

        </form>

        <aside className="h-fit border border-border p-6">
          <h2 className="font-display text-lg tracking-wide uppercase">Tu pedido</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.slug} className="flex justify-between gap-4">
                <span className="min-w-0 truncate text-muted-foreground">
                  {i.quantity} × {i.name}
                </span>
                <span className="shrink-0">{eur(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-border pt-4 font-display text-lg uppercase">
            <span>Total</span>
            <span>{eur(total)}</span>
          </div>
        </aside>
      </div>
      </div>
    </div>
  );
}

function Campo({
  id,
  label,
  error,
  onChange,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  onChange?: ((value: string) => void) | undefined;
}) {
  return (
    <div>
      <label htmlFor={id} className="font-display text-xs tracking-widest uppercase">
        {label}
      </label>
      <input
        id={id}
        name={id}
        className="mt-2 h-11 w-full border border-input bg-background px-3 text-sm outline-none focus:border-primary"
        aria-invalid={Boolean(error)}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      />
      {error && <p className="mt-1 text-xs text-primary">{error}</p>}
    </div>
  );
}
