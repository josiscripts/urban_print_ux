import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { borrarDireccion, getDirecciones, guardarDireccion } from "@/lib/account.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/cuenta/direcciones")({
  component: DireccionesPage,
});

const schema = z.object({
  kind: z.enum(["envio", "facturacion"]),
  full_name: z.string().trim().min(2, "Indica el nombre").max(120),
  company: z.string().trim().max(120),
  street: z.string().trim().min(3, "Indica la dirección").max(200),
  postal_code: z.string().trim().min(3, "CP no válido").max(12),
  city: z.string().trim().min(2, "Indica la localidad").max(80),
  province: z.string().trim().min(2, "Indica la provincia").max(80),
  country: z.string().trim().min(2).max(60),
  phone: z.string().trim().max(30),
});

function DireccionesPage() {
  const fetchDirecciones = useServerFn(getDirecciones);
  const saveFn = useServerFn(guardarDireccion);
  const deleteFn = useServerFn(borrarDireccion);
  const queryClient = useQueryClient();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["direcciones"],
    queryFn: () => fetchDirecciones(),
  });

  const save = useMutation({
    mutationFn: (values: z.infer<typeof schema>) =>
      saveFn({ data: { ...values, is_default: false } }),
    onSuccess: () => {
      toast.success("Dirección guardada");
      queryClient.invalidateQueries({ queryKey: ["direcciones"] });
    },
    onError: () => toast.error("No se ha podido guardar la dirección"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["direcciones"] }),
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const parsed = schema.safeParse(Object.fromEntries(new FormData(form)));
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    save.mutate(parsed.data, { onSuccess: () => form.reset() });
  }

  return (
    <section>
      <h2 className="font-display text-xl tracking-tight uppercase">Direcciones</h2>

      {isLoading ? (
        <p className="mt-4 text-muted-foreground">Cargando…</p>
      ) : data && data.length > 0 ? (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {data.map((d) => (
            <li key={d.id} className="border border-border p-5 text-sm">
              <p className="font-display tracking-wide uppercase">{d.full_name}</p>
              <p className="text-xs text-primary uppercase">{d.kind}</p>
              <p className="mt-2 text-muted-foreground">
                {d.street}
                <br />
                {d.postal_code} {d.city} ({d.province})
                <br />
                {d.country}
              </p>
              <button
                type="button"
                onClick={() => remove.mutate(d.id)}
                className="mt-3 text-xs text-muted-foreground hover:text-primary"
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-muted-foreground">Aún no has guardado direcciones.</p>
      )}

      <h3 className="mt-10 font-display text-lg tracking-tight uppercase">Añadir dirección</h3>
      <form onSubmit={onSubmit} className="mt-4 max-w-xl space-y-5" noValidate>
        <div>
          <label htmlFor="kind" className="font-display text-xs tracking-widest uppercase">
            Tipo
          </label>
          <select
            id="kind"
            name="kind"
            defaultValue="envio"
            className="mt-2 h-11 w-full border border-input bg-background px-3 text-sm outline-none focus:border-primary"
          >
            <option value="envio">Envío</option>
            <option value="facturacion">Facturación</option>
          </select>
        </div>
        <Campo id="full_name" label="Nombre completo" error={errors['full_name']} />
        <Campo id="company" label="Empresa (opcional)" error={errors['company']} />
        <Campo id="street" label="Dirección" error={errors['street']} />
        <div className="grid gap-5 sm:grid-cols-3">
          <Campo id="postal_code" label="Código postal" error={errors['postal_code']} />
          <Campo id="city" label="Localidad" error={errors['city']} />
          <Campo id="province" label="Provincia" error={errors['province']} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Campo id="country" label="País" defaultValue="España" error={errors['country']} />
          <Campo id="phone" label="Teléfono (opcional)" error={errors['phone']} />
        </div>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? "Guardando…" : "Guardar dirección"}
        </Button>
      </form>
    </section>
  );
}

function Campo({
  id,
  label,
  error,
  defaultValue = "",
}: {
  id: string;
  label: string;
  error?: string | undefined;
  defaultValue?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="font-display text-xs tracking-widest uppercase">
        {label}
      </label>
      <input
        id={id}
        name={id}
        defaultValue={defaultValue}
        className="mt-2 h-11 w-full border border-input bg-background px-3 text-sm outline-none focus:border-primary"
        aria-invalid={Boolean(error)}
      />
      {error && <p className="mt-1 text-xs text-primary">{error}</p>}
    </div>
  );
}
