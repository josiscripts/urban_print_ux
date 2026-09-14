import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  Facebook,
  Instagram,
  Mail,
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";

import { getCatalogo, type Categoria, type Producto } from "@/lib/catalog.functions";
import { CATEGORIAS, EMPRESA, REDES, SERVICIOS, type NavItem } from "@/lib/site";
import { useCart } from "@/lib/cart";
import { eur } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

type Columna = { titulo: string; slug?: string | undefined; productos: Producto[] };
type MenuCategoria = { item: NavItem; columnas: Columna[] };

function buildMenu(categories: Categoria[], products: Producto[]): MenuCategoria[] {
  const catBySlug = new Map(categories.map((c) => [c.slug, c]));
  const bySlugProducto = new Map(products.map((p) => [p.slug, p]));
  const byCategoria = new Map<string, Producto[]>();
  for (const p of products) {
    const list = byCategoria.get(p.category_id) ?? [];
    list.push(p);
    byCategoria.set(p.category_id, list);
  }

  return CATEGORIAS.map((item) => {
    const columnas: Columna[] = item.grupos.map((grupo) => {
      const cat = grupo.categoria ? catBySlug.get(grupo.categoria) : undefined;
      const propios = cat ? (byCategoria.get(cat.id) ?? []) : [];
      const extras = (grupo.extras ?? [])
        .map((slug) => bySlugProducto.get(slug))
        .filter((p): p is Producto => Boolean(p));
      const vistos = new Set(propios.map((p) => p.id));
      return {
        titulo: grupo.titulo,
        slug: cat?.slug,
        productos: [...propios, ...extras.filter((p) => !vistos.has(p.id))],
      };
    });
    return { item, columnas: columnas.filter((c) => c.productos.length > 0) };
  });
}

export function SiteHeader() {
  const { count } = useCart();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [openMenu, setOpenMenu] = useState(false);
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [mobileCat, setMobileCat] = useState<string | null>(null);
  const [mobileSub, setMobileSub] = useState<string | null>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  const { data } = useQuery({
    queryKey: ["catalogo"],
    queryFn: () => getCatalogo(),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    setOpenMenu(false);
    setOpenCat(null);
    setQuery("");
  }, [pathname]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenCat(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenCat(null);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const menu = useMemo(
    () => (data ? buildMenu(data.categories, data.products) : []),
    [data],
  );

  const productResults = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (term.length < 2 || !data) return [];
    return data.products.filter((p) => p.name.toLowerCase().includes(term)).slice(0, 8);
  }, [query, data]);

  const categoryResults = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (term.length < 2 || !data) return [];
    return data.categories.filter((c) => c.name.toLowerCase().includes(term)).slice(0, 4);
  }, [query, data]);

  const hayResultados = productResults.length > 0 || categoryResults.length > 0;


  const listaResultados = (onPick: () => void) => (
    <>
      {categoryResults.map((c) => (
        <li key={`c-${c.id}`}>
          <button
            type="button"
            onClick={() => {
              onPick();
              navigate({ to: "/categoria/$slug", params: { slug: c.slug } });
            }}
            className="flex w-full items-center justify-between gap-4 px-4 py-2.5 text-left text-sm hover:bg-accent"
          >
            <span className="min-w-0 truncate">{c.name}</span>
            <span className="shrink-0 font-display text-[10px] tracking-widest text-muted-foreground uppercase">
              Categoría
            </span>
          </button>
        </li>
      ))}
      {productResults.map((p) => (
        <li key={p.id}>
          <button
            type="button"
            onClick={() => {
              onPick();
              navigate({ to: "/producto/$slug", params: { slug: p.slug } });
            }}
            className="flex w-full items-center justify-between gap-4 px-4 py-2.5 text-left text-sm hover:bg-accent"
          >
            <span className="min-w-0 truncate">{p.name}</span>
            <span className="shrink-0 font-semibold text-primary">{eur(Number(p.price))}</span>
          </button>
        </li>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-background">
      <div className="w-full border-b border-border bg-background">
        <div className="mx-auto grid max-w-7xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-4 py-4">
          <Link to="/" className="flex shrink-0 items-center" aria-label="Urban Print — Inicio">
            <Logo background="theme" className="h-7" />
          </Link>

          <div className="relative hidden min-w-0 md:block">
            <label htmlFor="buscador" className="sr-only">
              Buscar productos y categorías
            </label>
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              id="buscador"
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar productos o categorías…"
              maxLength={80}
              className="h-11 w-full border border-input bg-background pr-3 pl-9 text-sm outline-none focus:border-primary"
            />
            {hayResultados && (
              <ul className="absolute top-full right-0 left-0 z-50 max-h-96 overflow-auto border border-border bg-popover shadow-xl">
                {listaResultados(() => setQuery(""))}
              </ul>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Button asChild variant="ghost" size="icon" aria-label="Contacto" title="Contacto" className="micro-scale">
              <Link to="/contacto">
                <Mail className="size-5" />
              </Link>
            </Button>
            <a
              href={REDES.facebook}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Facebook de Urban Print"
              className="hidden size-9 place-items-center text-foreground transition-colors hover:text-primary sm:grid lg:hidden"
            >
              <Facebook className="size-[18px]" />
            </a>
            <a
              href={REDES.instagram}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Instagram de Urban Print"
              className="hidden size-9 place-items-center text-foreground transition-colors hover:text-primary sm:grid lg:hidden"
            >
              <Instagram className="size-[18px]" />
            </a>

            <Button asChild variant="ghost" size="icon" aria-label="Área de cliente" className="micro-scale">
              <Link to="/cuenta">
                <User className="size-5" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="Carrito" className="micro-scale relative">
              <Link to="/carrito">
                <ShoppingCart className="size-5" />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {count}
                  </span>
                )}
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Abrir menú"
              onClick={() => setOpenMenu((v) => !v)}
            >
              {openMenu ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>
          </div>
        </div>
      </div>

      <nav
        ref={navRef}
        aria-label="Catálogo"
        className="relative hidden w-full border-b border-border bg-ink text-ink-foreground lg:block"
        onMouseLeave={() => setOpenCat(null)}
      >
        <ul className="mx-auto flex max-w-7xl items-stretch px-4">
          <li onMouseEnter={() => setOpenCat(null)}>
            <Link
              to="/"
              className="flex h-12 items-center px-3 font-display text-[13px] tracking-wide uppercase transition-colors hover:text-primary xl:px-4 xl:text-sm"
              activeProps={{ className: "text-primary" }}
              activeOptions={{ exact: true }}
            >
              Inicio
            </Link>
          </li>
          {CATEGORIAS.map((cat) => {
            const abierto = openCat === cat.slug;
            return (
              <li key={cat.slug} className="static" onMouseEnter={() => setOpenCat(cat.slug)}>
                <Link
                  to="/categoria/$slug"
                  params={{ slug: cat.slug }}
                  aria-expanded={abierto}
                  onClick={(e) => {
                    if (!abierto) {
                      e.preventDefault();
                      setOpenCat(cat.slug);
                    }
                  }}
                  className={`flex h-12 items-center gap-1 px-3 font-display text-[13px] tracking-wide uppercase transition-colors hover:text-primary xl:px-4 xl:text-sm ${
                    abierto ? "text-primary" : ""
                  }`}
                  activeProps={{ className: "text-primary" }}
                >
                  {cat.name}
                  <ChevronDown className="size-3.5 opacity-70" aria-hidden />
                </Link>
              </li>
            );
          })}
          <li className="ml-auto flex items-center gap-1">
            <a
              href={REDES.facebook}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Facebook de Urban Print"
              className="grid size-9 place-items-center text-ink-foreground transition-colors hover:text-primary"
            >
              <Facebook className="size-[18px]" />
            </a>
            <a
              href={REDES.instagram}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="Instagram de Urban Print"
              className="mr-2 grid size-9 place-items-center text-ink-foreground transition-colors hover:text-primary"
            >
              <Instagram className="size-[18px]" />
            </a>


            <span className="group relative my-2 inline-block">
              <a
                href={EMPRESA.enlaceExterno.url}
                target="_blank"
                rel="noreferrer noopener"
                className="relative z-50 inline-flex items-center bg-primary px-4 py-2 font-display text-sm tracking-wide text-primary-foreground uppercase transition-colors duration-300 ease-out group-hover:bg-[#4A7C59]"
              >
                {EMPRESA.enlaceExterno.name}
              </a>
              <svg
                className="pointer-events-none absolute -top-2 -left-2.5 z-40 size-5 rotate-[-25deg] text-[#9DC183] opacity-0 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-110 group-hover:rotate-[-10deg]"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M12 2C14 5 18 9 19 14C20 18 16 21 12 22C8 21 4 18 5 14C6 9 10 5 12 2ZM12 22L11 24L13 24Z" />
              </svg>
              <svg
                className="pointer-events-none absolute -top-2 -right-2.5 z-40 size-5 rotate-[25deg] text-[#9DC183] opacity-0 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-110 group-hover:rotate-[10deg]"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M12 2C14 5 18 9 19 14C20 18 16 21 12 22C8 21 4 18 5 14C6 9 10 5 12 2ZM12 22L11 24L13 24Z" />
              </svg>
              <svg
                className="pointer-events-none absolute -bottom-2 -left-2.5 z-40 size-5 rotate-[15deg] text-[#9DC183] opacity-0 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-110"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M12 2C14 5 18 9 19 14C20 18 16 21 12 22C8 21 4 18 5 14C6 9 10 5 12 2ZM12 22L11 24L13 24Z" />
              </svg>
              <svg
                className="pointer-events-none absolute -right-2.5 -bottom-2 z-40 size-5 rotate-[-15deg] text-[#9DC183] opacity-0 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-110"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden
              >
                <path d="M12 2C14 5 18 9 19 14C20 18 16 21 12 22C8 21 4 18 5 14C6 9 10 5 12 2ZM12 22L11 24L13 24Z" />
              </svg>
            </span>
          </li>
        </ul>

        {openCat &&
          (() => {
            const entry = menu.find((m) => m.item.slug === openCat);
            if (!entry || entry.columnas.length === 0) return null;
            return (
              <div className="absolute inset-x-0 top-full z-50 px-4">
                <div className="mx-auto max-w-7xl">
                  <div className="max-h-[70vh] overflow-y-auto rounded-b-lg border border-t-0 border-border bg-popover p-8 text-popover-foreground shadow-2xl">
                    <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {entry.columnas.map((col) => (
                        <div key={col.titulo} className="min-w-0">
                          {col.slug ? (
                            <Link
                              to="/categoria/$slug"
                              params={{ slug: col.slug }}
                              className="mb-3 block border-b border-primary/30 pb-2 font-display text-sm tracking-wide text-primary uppercase transition-colors hover:text-foreground"
                            >
                              {col.titulo}
                            </Link>
                          ) : (
                            <p className="mb-3 border-b border-primary/30 pb-2 font-display text-sm tracking-wide text-primary uppercase">
                              {col.titulo}
                            </p>
                          )}
                          <ul className="space-y-1.5">
                            {col.productos.map((p) => (
                              <li key={p.id}>
                                <Link
                                  to="/producto/$slug"
                                  params={{ slug: p.slug }}
                                  className="block text-sm leading-snug text-foreground transition-colors hover:text-primary"
                                >
                                  {p.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <div className="mt-8 border-t border-border pt-4">
                      <Link
                        to="/categoria/$slug"
                        params={{ slug: entry.item.slug }}
                        className="font-display text-xs tracking-widest text-primary uppercase hover:underline"
                      >
                        Ver todo {entry.item.name} →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
      </nav>

      {openMenu && (
        <div className="w-full border-b border-border bg-background lg:hidden">
          <div className="mx-auto max-w-7xl space-y-6 overflow-x-hidden px-4 py-6">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                ref={mobileSearchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar productos o categorías…"
                aria-label="Buscar productos y categorías"
                className="h-11 w-full border border-input bg-background pr-3 pl-9 text-sm outline-none focus:border-primary"
              />
            </div>
            {hayResultados && (
              <ul className="border border-border">{listaResultados(() => setOpenMenu(false))}</ul>
            )}

            <div>
              <p className="mb-2 font-display text-xs tracking-widest text-muted-foreground uppercase">
                Catálogo
              </p>
              <ul className="divide-y divide-border border-y border-border">
                <li>
                  <Link to="/" className="block py-3 font-display text-sm uppercase">
                    Inicio
                  </Link>
                </li>
                {menu.map(({ item, columnas }) => {
                  const abierta = mobileCat === item.slug;
                  return (
                    <li key={item.slug}>
                      <button
                        type="button"
                        aria-expanded={abierta}
                        onClick={() => {
                          setMobileCat(abierta ? null : item.slug);
                          setMobileSub(null);
                        }}
                        className="flex w-full items-center justify-between py-3 font-display text-sm uppercase"
                      >
                        {item.name}
                        <ChevronDown
                          className={`size-4 transition-transform ${abierta ? "rotate-180 text-primary" : ""}`}
                          aria-hidden
                        />
                      </button>
                      {abierta && (
                        <div className="pb-3">
                          {columnas.map((col) => {
                            const subAbierta = mobileSub === col.titulo;
                            return (
                              <div key={col.titulo} className="mb-1">
                                <button
                                  type="button"
                                  aria-expanded={subAbierta}
                                  onClick={() => setMobileSub(subAbierta ? null : col.titulo)}
                                  className="flex w-full items-center justify-between py-2 pl-3 text-left text-sm font-semibold text-primary"
                                >
                                  {col.titulo}
                                  <ChevronDown
                                    className={`size-4 shrink-0 transition-transform ${subAbierta ? "rotate-180" : ""}`}
                                    aria-hidden
                                  />
                                </button>
                                {subAbierta && (
                                  <ul className="space-y-1 pb-2 pl-6">
                                    {col.productos.map((p) => (
                                      <li key={p.id}>
                                        <Link
                                          to="/producto/$slug"
                                          params={{ slug: p.slug }}
                                          className="block py-1 text-sm text-muted-foreground hover:text-primary"
                                        >
                                          {p.name}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            );
                          })}
                          <Link
                            to="/categoria/$slug"
                            params={{ slug: item.slug }}
                            className="mt-2 inline-block pl-3 font-display text-xs tracking-widest text-primary uppercase"
                          >
                            Ver todo {item.name} →
                          </Link>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <p className="mb-2 font-display text-xs tracking-widest text-muted-foreground uppercase">
                Servicios
              </p>
              <ul className="space-y-1">
                {SERVICIOS.map((s) => (
                  <li key={s.to}>
                    <Link to={s.to} className="block py-1 text-sm">
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-2 font-display text-xs tracking-widest text-muted-foreground uppercase">
                Empresa
              </p>
              <ul className="space-y-1">
                <li>
                  <Link to="/empresa" className="block py-1 text-sm">
                    La empresa
                  </Link>
                </li>
                <li>
                  <Link to="/contacto" className="block py-1 text-sm">
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link to="/cuenta" className="block py-1 text-sm">
                    Área de cliente
                  </Link>
                </li>
                <li>
                  <a
                    href={EMPRESA.enlaceExterno.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-2 inline-block bg-primary px-4 py-2 font-display text-sm text-primary-foreground uppercase"
                  >
                    {EMPRESA.enlaceExterno.name}
                  </a>
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-2 border-t border-border pt-4">
              <a
                href={REDES.facebook}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Facebook de Urban Print"
                className="grid size-9 place-items-center text-foreground hover:text-primary"
              >
                <Facebook className="size-5" />
              </a>
              <a
                href={REDES.instagram}
                target="_blank"
                rel="noreferrer noopener"
                aria-label="Instagram de Urban Print"
                className="grid size-9 place-items-center text-foreground hover:text-primary"
              >
                <Instagram className="size-5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
