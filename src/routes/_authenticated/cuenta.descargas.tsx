import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDescargas } from "@/lib/account.functions";
import { fecha } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/cuenta/descargas")({
  component: DescargasPage,
});

function DescargasPage() {
  const fetchDescargas = useServerFn(getDescargas);
  const { data, isLoading } = useQuery({ queryKey: ["descargas"], queryFn: () => fetchDescargas() });

  return (
    <section>
      <h2 className="font-display text-xl tracking-tight uppercase">Descargas</h2>
      {isLoading ? (
        <p className="mt-4 text-muted-foreground">Cargando…</p>
      ) : !data || data.length === 0 ? (
        <p className="mt-4 text-muted-foreground">
          Aquí aparecerán los archivos y artes finales asociados a tus pedidos.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-border border border-border">
          {data.map((d) => (
            <li
              key={d.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-4 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-display tracking-wide uppercase">{d.name}</p>
                {d.expires_at && (
                  <p className="text-xs text-muted-foreground">Caduca el {fecha(d.expires_at)}</p>
                )}
              </div>
              <a
                href={d.file_url}
                target="_blank"
                rel="noreferrer noopener"
                className="shrink-0 text-primary underline"
              >
                Descargar
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
