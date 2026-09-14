import { Link } from "@tanstack/react-router";
import { Clock, Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { CATEGORIAS, EMPRESA, REDES, SERVICIOS } from "@/lib/site";
import { Logo } from "@/components/Logo";

const allCategorySlugs = new Set<string>();
CATEGORIAS.forEach((c) => {
  allCategorySlugs.add(c.slug);
  c.grupos.forEach((g) => {
    if (g.categoria) allCategorySlugs.add(g.categoria);
  });
});


const SERVICIOS_FOOTER = SERVICIOS.filter((s) => {
  const slug = s.to.replace("/", "");
  return !allCategorySlugs.has(slug);
});

export function SiteFooter() {
  return (
    <footer className="w-full bg-ink text-ink-foreground">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
        <div className="sm:col-span-2 md:col-span-4 lg:col-span-1">
          <Logo background="dark" className="h-8" />

          <p className="mt-4 max-w-xs text-sm text-ink-foreground/70">
            Imprenta, gran formato, textil y personalización en Orihuela. Producción propia y
            asesoramiento en cada proyecto.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <a
              href={REDES.facebook}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Facebook de Urban Print"
              className="micro-scale grid size-9 place-items-center border border-ink-foreground/20 text-ink-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Facebook className="size-[18px]" />
            </a>
            <a
              href={REDES.instagram}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Instagram de Urban Print"
              className="micro-scale grid size-9 place-items-center border border-ink-foreground/20 text-ink-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Instagram className="size-[18px]" />
            </a>
          </div>
        </div>

        <div>
          <h2 className="font-display text-sm tracking-widest uppercase">Tienda</h2>
          <span className="mt-2 block h-0.5 w-10 bg-primary" />
          <ul className="mt-4 space-y-2 text-sm text-ink-foreground/70">
            {CATEGORIAS.map((c) => (
              <li key={c.slug}>
                <Link
                  to="/categoria/$slug"
                  params={{ slug: c.slug }}
                  className="transition-colors hover:text-primary"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm tracking-widest uppercase">Servicios</h2>
          <span className="mt-2 block h-0.5 w-10 bg-primary" />
          <ul className="mt-4 space-y-2 text-sm text-ink-foreground/70">
            {SERVICIOS_FOOTER.map((s) => (
              <li key={s.to}>
                <Link to={s.to} className="transition-colors hover:text-primary">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm tracking-widest uppercase">Empresa</h2>
          <span className="mt-2 block h-0.5 w-10 bg-primary" />
          <ul className="mt-4 space-y-2 text-sm text-ink-foreground/70">
            <li>
              <Link to="/empresa" className="transition-colors hover:text-primary">
                Empresa
              </Link>
            </li>
            <li>
              <Link to="/contacto" className="transition-colors hover:text-primary">
                Contacto
              </Link>
            </li>
          </ul>
          <h3 className="mt-6 font-display text-xs tracking-widest text-ink-foreground/50 uppercase">
            Ayuda
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-foreground/70">
            <li>
              <Link to="/" hash="faq" className="transition-colors hover:text-primary">
                Preguntas frecuentes
              </Link>
            </li>
            <li>
              <Link to="/condiciones-de-venta" className="transition-colors hover:text-primary">
                Envíos
              </Link>
            </li>
            <li>
              <Link to="/condiciones-de-venta" className="transition-colors hover:text-primary">
                Formas de pago
              </Link>
            </li>
            <li>
              <Link to="/condiciones-de-venta" className="transition-colors hover:text-primary">
                Política de devoluciones
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-sm tracking-widest uppercase">Contacto</h2>
          <span className="mt-2 block h-0.5 w-10 bg-primary" />
          <ul className="mt-4 space-y-3 text-sm text-ink-foreground/70">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <span>{EMPRESA.direccion}</span>
            </li>
            <li className="flex gap-2">
              <Phone className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <a href={`tel:${EMPRESA.telefonoLink}`} className="hover:text-primary">
                {EMPRESA.telefono}
              </a>
            </li>
            {EMPRESA.emails.map((email) => (
              <li key={email} className="flex gap-2">
                <Mail className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                <a href={`mailto:${email}`} className="break-all hover:text-primary">
                  {email}
                </a>
              </li>
            ))}
            <li className="flex gap-2">
              <Clock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <span>Lunes a viernes: 9:00 – 14:00 y 16:30 – 20:00</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="w-full border-t border-ink-foreground/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-ink-foreground/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Urban Print. Todos los derechos reservados.</p>
          <div className="flex flex-wrap gap-4">
            <Link to="/aviso-legal" className="hover:text-primary">
              Aviso legal
            </Link>
            <Link to="/politica-de-privacidad" className="hover:text-primary">
              Política de privacidad
            </Link>
            <Link to="/condiciones-de-venta" className="hover:text-primary">
              Condiciones de venta
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
