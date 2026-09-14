import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Globe } from "lucide-react";
import { EMPRESA, TITULAR } from "@/lib/site";

export function LegalPage({
  title,
  intro,
  updated,
  children,
}: {
  title: string;
  intro: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="w-full">
      <section className="w-full bg-ink text-ink-foreground">
        <div className="mx-auto w-full max-w-7xl px-4 py-14">
          <p className="font-display text-xs tracking-[0.3em] uppercase text-primary">
            Información legal
          </p>
          <h1 className="mt-3 font-display text-3xl tracking-wide uppercase md:text-5xl">{title}</h1>
          <span className="mt-4 block h-1 w-16 bg-primary" />
          <p className="mt-5 max-w-3xl text-sm text-ink-foreground/75 md:text-base">{intro}</p>
          <p className="mt-4 text-xs text-ink-foreground/50">Última actualización: {updated}</p>
        </div>
      </section>

      <section className="w-full">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="max-w-3xl text-[15px] leading-relaxed text-foreground/85">
            {children}
          </article>

          <aside className="h-fit border border-border bg-muted/40 p-6 lg:sticky lg:top-28">
            <h2 className="font-display text-sm tracking-widest uppercase">Titular del sitio web</h2>
            <span className="mt-2 block h-0.5 w-10 bg-primary" />
            <dl className="mt-4 space-y-3 text-sm text-foreground/80">
              <div>
                <dt className="text-xs tracking-wider uppercase text-muted-foreground">Titular</dt>
                <dd className="font-medium">{TITULAR.nombre}</dd>
              </div>
              <div>
                <dt className="text-xs tracking-wider uppercase text-muted-foreground">NIF</dt>
                <dd className="font-medium">{TITULAR.nif}</dd>
              </div>
              <div className="flex gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <span>{TITULAR.direccion}</span>
              </div>
              <div className="flex gap-2">
                <Phone className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <a href={`tel:${EMPRESA.telefonoLink}`} className="hover:text-primary">
                  {TITULAR.telefono}
                </a>
              </div>
              <div className="flex gap-2">
                <Mail className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <a href={`mailto:${TITULAR.email}`} className="break-all hover:text-primary">
                  {TITULAR.email}
                </a>
              </div>
              <div className="flex gap-2">
                <Globe className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <a
                  href="https://www.urbanprint.es"
                  className="hover:text-primary"
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  {TITULAR.web}
                </a>
              </div>
            </dl>

            <h2 className="mt-8 font-display text-sm tracking-widest uppercase">Otros documentos</h2>
            <span className="mt-2 block h-0.5 w-10 bg-primary" />
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/aviso-legal" className="hover:text-primary">
                  Aviso legal y condiciones de uso
                </Link>
              </li>
              <li>
                <Link to="/condiciones-de-venta" className="hover:text-primary">
                  Condiciones generales de venta
                </Link>
              </li>
              <li>
                <Link to="/politica-de-privacidad" className="hover:text-primary">
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="hover:text-primary">
                  Contacto
                </Link>
              </li>
            </ul>
          </aside>
        </div>
      </section>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10 first:mt-0">
      <h2 className="font-display text-xl tracking-wide uppercase text-foreground md:text-2xl">
        {title}
      </h2>
      <span className="mt-2 mb-4 block h-0.5 w-12 bg-primary" />
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function LegalSubtitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="pt-2 font-display text-base tracking-wide uppercase text-foreground">
      {children}
    </h3>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="space-y-2 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-2 size-1.5 shrink-0 bg-primary" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
