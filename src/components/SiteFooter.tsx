import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Clock, Facebook, Instagram, Mail, MapPin, Minus, Phone, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NaturHouseLink } from "@/components/NaturHouseLink";
import { CATEGORIAS, EMPRESA, REDES } from "@/lib/site";

const SERVICIOS_FOOTER = [
  { name: "Impresión", to: "/imprenta" as const },
  { name: "Gran Formato", to: "/gran-formato" as const },
  { name: "Textil", to: "/impresion-textil" as const },
  { name: "Merchandising", to: "/merchandising" as const },
  { name: "Regalos personalizados", to: "/regalos-personalizados" as const },
];

const EMPRESA_FOOTER = [
  { name: "La empresa", to: "/empresa" as const },
  { name: "Contacto", to: "/contacto" as const },
  { name: "Área de cliente", to: "/cuenta" as const },
  { name: "Trabaja con nosotros", to: "/contacto" as const },
];

function ContactColumn() {
  return (
    <ul className="grid gap-3 text-sm text-ink-foreground/68 sm:grid-cols-2 md:grid-cols-1">
      <li className="flex min-w-0 gap-3">
        <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <span>{EMPRESA.direccion}</span>
      </li>
      <li className="flex gap-3">
        <Phone className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <a
          href={`tel:${EMPRESA.telefonoLink}`}
          className="transition-colors hover:text-ink-foreground"
        >
          {EMPRESA.telefono}
        </a>
      </li>
      <li className="flex min-w-0 gap-3">
        <Mail className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <span className="min-w-0 space-y-1">
          {EMPRESA.emails.map((email) => (
            <a
              key={email}
              href={`mailto:${email}`}
              className="block break-all transition-colors hover:text-ink-foreground"
            >
              {email}
            </a>
          ))}
        </span>
      </li>
      <li className="flex gap-3">
        <Clock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
        <span>Lunes a viernes: 9:00–14:00 y 16:30–20:00</span>
      </li>
    </ul>
  );
}

const AYUDA_FOOTER = [
  { name: "Preguntas frecuentes", to: "/" as const, hash: "faq" },
  { name: "Envíos y entregas", to: "/condiciones-de-venta" as const },
  { name: "Devoluciones", to: "/condiciones-de-venta" as const },
  { name: "Métodos de pago", to: "/condiciones-de-venta" as const },
  { name: "Soporte", to: "/contacto" as const },
];

const footerLinkClass =
  "inline-flex min-h-8 items-center text-sm text-ink-foreground/68 transition-colors hover:text-ink-foreground focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 font-display text-sm uppercase">
      <span className="size-1.5 bg-primary" aria-hidden />
      {children}
    </h2>
  );
}

function ShopLinks() {
  return (
    <ul className="space-y-0.5">
      {CATEGORIAS.map((category) => (
        <li key={category.slug}>
          <Link to="/categoria/$slug" params={{ slug: category.slug }} className={footerLinkClass}>
            {category.name}
          </Link>
        </li>
      ))}
      <li className="mt-3 border-t border-ink-foreground/12 pt-3">
        <NaturHouseLink className="w-full sm:max-w-64" />
      </li>
    </ul>
  );
}

function ServiceLinks() {
  return (
    <ul className="space-y-0.5">
      {SERVICIOS_FOOTER.map((service) => (
        <li key={service.name}>
          <Link to={service.to} className={footerLinkClass}>
            {service.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function CompanyLinks() {
  return (
    <ul className="space-y-0.5">
      {EMPRESA_FOOTER.map((item) => (
        <li key={item.name}>
          <Link to={item.to} className={footerLinkClass}>
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}

function HelpLinks() {
  return (
    <ul className="space-y-0.5">
      {AYUDA_FOOTER.map((item) => (
        <li key={item.name}>
          {item.hash ? (
            <Link to={item.to} hash={item.hash} className={footerLinkClass}>
              {item.name}
            </Link>
          ) : (
            <Link to={item.to} className={footerLinkClass}>
              {item.name}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}

function SocialLinks() {
  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={REDES.instagram}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex min-h-11 items-center gap-2 border border-ink-foreground/18 px-3 text-sm text-ink-foreground/75 transition-colors hover:border-primary hover:text-ink-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Instagram className="size-4 text-primary" aria-hidden /> Instagram
      </a>
      <a
        href={REDES.facebook}
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex min-h-11 items-center gap-2 border border-ink-foreground/18 px-3 text-sm text-ink-foreground/75 transition-colors hover:border-primary hover:text-ink-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <Facebook className="size-4 text-primary" aria-hidden /> Facebook
      </a>
    </div>
  );
}

function FooterAccordion({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const contentId = `footer-${title.toLowerCase()}`;

  return (
    <div className="border-b border-ink-foreground/12">
      <Button
        type="button"
        variant="ghost"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls={contentId}
        className="h-14 w-full justify-between rounded-none px-0 font-display text-sm text-ink-foreground uppercase hover:bg-transparent hover:text-primary"
      >
        <span className="flex items-center gap-2">
          <span className="size-1.5 bg-primary" aria-hidden />
          {title}
        </span>
        {open ? <Minus aria-hidden /> : <Plus aria-hidden />}
      </Button>
      <div
        id={contentId}
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
      >
        <div className="overflow-hidden">
          <div className="pb-5 pl-3">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="w-full bg-ink text-ink-foreground">
      <div className="mx-auto w-full max-w-[96rem] px-4 sm:px-6">
        <nav aria-label="Navegación del pie" className="py-10 md:py-12">
          <div className="md:hidden">
            <FooterAccordion title="Síguenos">
              <SocialLinks />
            </FooterAccordion>
            <FooterAccordion title="Tienda">
              <ShopLinks />
            </FooterAccordion>
            <FooterAccordion title="Servicios">
              <ServiceLinks />
            </FooterAccordion>
            <FooterAccordion title="Empresa">
              <CompanyLinks />
            </FooterAccordion>
            <FooterAccordion title="Ayuda">
              <HelpLinks />
            </FooterAccordion>
            <FooterAccordion title="Contacto">
              <ContactColumn />
            </FooterAccordion>
          </div>

          <div className="hidden gap-x-8 gap-y-10 md:grid md:grid-cols-2 xl:grid-cols-6 xl:gap-x-10">
            <section>
              <SectionTitle>Síguenos</SectionTitle>
              <div className="mt-4">
                <SocialLinks />
              </div>
            </section>
            <section>
              <SectionTitle>Tienda</SectionTitle>
              <div className="mt-4">
                <ShopLinks />
              </div>
            </section>
            <section>
              <SectionTitle>Servicios</SectionTitle>
              <div className="mt-4">
                <ServiceLinks />
              </div>
            </section>
            <section>
              <SectionTitle>Empresa</SectionTitle>
              <div className="mt-4">
                <CompanyLinks />
              </div>
            </section>
            <section>
              <SectionTitle>Ayuda</SectionTitle>
              <div className="mt-4">
                <HelpLinks />
              </div>
            </section>
            <section>
              <SectionTitle>Contacto</SectionTitle>
              <div className="mt-4">
                <ContactColumn />
              </div>
            </section>
          </div>
        </nav>
      </div>

      <div className="border-t border-ink-foreground/15">
        <div className="mx-auto flex w-full max-w-[96rem] flex-col gap-5 px-4 py-6 sm:px-6">
          <nav
            aria-label="Información legal"
            className="flex flex-wrap gap-x-2 gap-y-2 text-sm text-ink-foreground/62 sm:gap-x-4 md:justify-center"
          >
            <Link to="/aviso-legal" className="transition-colors hover:text-ink-foreground">
              Aviso legal
            </Link>
            <span aria-hidden>·</span>
            <Link
              to="/politica-de-privacidad"
              className="transition-colors hover:text-ink-foreground"
            >
              Privacidad
            </Link>
            <span aria-hidden>·</span>
            <Link
              to="/condiciones-de-venta"
              className="transition-colors hover:text-ink-foreground"
            >
              Condiciones de venta
            </Link>
          </nav>
          <div className="flex flex-col gap-2 border-t border-ink-foreground/10 pt-5 text-xs text-ink-foreground/55 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Urban Print. Todos los derechos reservados.</p>
            <p>Urban Print · Orihuela, Alicante</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
