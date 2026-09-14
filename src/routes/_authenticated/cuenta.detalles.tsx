import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getPerfil, guardarPerfil } from "@/lib/account.functions";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/cuenta/detalles")({
  component: DetallesPage,
});

function DetallesPage() {
  const fetchPerfil = useServerFn(getPerfil);
  const saveFn = useServerFn(guardarPerfil);
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["perfil"], queryFn: () => fetchPerfil() });
  const [form, setForm] = useState({ first_name: "", last_name: "", phone: "" });

  useEffect(() => {
    if (data) {
      setForm({
        first_name: data.first_name ?? "",
        last_name: data.last_name ?? "",
        phone: data.phone ?? "",
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: () => saveFn({ data: form }),
    onSuccess: () => {
      toast.success("Datos guardados");
      queryClient.invalidateQueries({ queryKey: ["perfil"] });
    },
    onError: () => toast.error("No se han podido guardar los datos"),
  });

  if (isLoading) return <p className="text-muted-foreground">Cargando…</p>;

  return (
    <section>
      <h2 className="font-display text-xl tracking-tight uppercase">Detalles de la cuenta</h2>
      <span className="mt-2 block h-0.5 w-12 bg-primary" />
      <form
        className="mt-6 max-w-lg space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          mutation.mutate();
        }}
      >
        {(
          [
            ["first_name", "Nombre"],
            ["last_name", "Apellidos"],
            ["phone", "Teléfono"],
          ] as const
        ).map(([key, label]) => (
          <div key={key}>
            <label htmlFor={key} className="font-display text-xs tracking-widest uppercase">
              {label}
            </label>
            <input
              id={key}
              value={form[key]}
              maxLength={120}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              className="mt-2 h-11 w-full border border-input bg-background px-3 text-sm outline-none focus:border-primary"
            />
          </div>
        ))}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Guardando…" : "Guardar cambios"}
        </Button>
      </form>
    </section>
  );
}
