import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ChevronDown,
  Facebook,
  Heart,
  Instagram,
  LayoutDashboard,
  Menu,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";

import { getCatalogo, type Categoria, type Producto } from "@/lib/catalog.functions";
import { CATEGORIAS, REDES, type NavItem } from "@/lib/site";
import { useCart } from "@/lib/cart";
import { useFavorites } from "@/lib/favorites";
import { eur } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { NaturHouseLink } from "@/components/NaturHouseLink";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

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
  const { items: favorites } = useFavorites();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [openMenu, setOpenMenu] = useState(false);
  const [openCat, setOpenCat] = useState<string | null>(null);
  const [openMobileItem, setOpenMobileItem] = useState<string | null>(null);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [compactSearchOpen, setCompactSearchOpen] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navRef = useRef<HTMLElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const compactSearchRef = useRef<HTMLInputElement>(null);

  const { data } = useQuery({
    queryKey: ["catalogo"],
    queryFn: () => getCatalogo(),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    setOpenMenu(false);
    setOpenCat(null);
    setOpenMobileItem(null);
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

  const menu = useMemo(() => (data ? buildMenu(data.categories, data.products) : []), [data]);

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

  const focusCompactSearch = () => {
    setOpenMenu(false);
    setCompactSearchOpen(true);
    window.setTimeout(() => compactSearchRef.current?.focus(), 0);
  };

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
    <header className="fixed inset-x-0 top-0 z-50 w-full text-ink-foreground transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 glass-navbar xl:sticky xl:border-ink-foreground/10 xl:bg-hero-surface/95 xl:shadow-none xl:backdrop-blur-md">
      <div className="mx-auto grid min-h-16 max-w-[96rem] grid-cols-[minmax(0,1fr)_auto] items-center gap-1.5 px-3 min-[390px]:gap-2 min-[390px]:px-4 sm:min-h-18 sm:gap-3 sm:px-6 xl:hidden">
        <Link to="/" className="flex min-w-0 items-center" aria-label="Urban Print — Inicio">
          <Logo
            background="dark"
            className="h-auto w-[7.25rem] min-[390px]:w-32 sm:w-auto sm:h-7"
          />
        </Link>
        <div className="flex shrink-0 items-center">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Buscar"
            title="Buscar"
            onClick={focusCompactSearch}
            className="micro-scale size-10 text-ink-foreground hover:bg-ink-foreground/10 hover:text-primary"
          >
            <Search className="size-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Favoritos"
            title="Favoritos"
            aria-expanded={favoritesOpen}
            onClick={() => setFavoritesOpen((open) => !open)}
            className="micro-scale relative size-10 text-ink-foreground hover:bg-ink-foreground/10 hover:text-primary"
          >
            <Heart
              className={`size-5 ${favorites.length > 0 ? "fill-primary text-primary" : ""}`}
            />
            {favorites.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {favorites.length}
              </span>
            )}
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Carrito"
            className="micro-scale relative size-10 text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground"
          >
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
            className="size-10 text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground"
            aria-label="Abrir menú"
            onClick={() => setOpenMenu(true)}
          >
            <Menu className="size-5" />
          </Button>
        </div>
        <div
          className={`${compactSearchOpen || query ? "block" : "hidden"} relative col-span-2 min-w-0 pb-3 sm:absolute sm:top-[calc(100%+0.5rem)] sm:right-6 sm:z-50 sm:w-[min(24rem,calc(100vw-3rem))] sm:pb-0`}
        >
          <Search
            className="pointer-events-none absolute top-[1.125rem] left-3 size-4 -translate-y-1/2 text-ink-muted sm:top-1/2"
            aria-hidden
          />
          <input
            ref={compactSearchRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar productos o categorías..."
            aria-label="Buscar productos o categorías"
            className="h-9 w-full rounded-full border border-ink-foreground/10 bg-ink-foreground/10 pr-3 pl-9 text-xs text-ink-foreground outline-none placeholder:text-ink-muted focus:border-primary sm:bg-hero-panel sm:shadow-xl"
          />
          {hayResultados && (
            <ul className="absolute top-[calc(100%-0.25rem)] right-0 left-0 z-50 max-h-72 overflow-auto border border-border bg-popover text-popover-foreground shadow-xl sm:top-[calc(100%+0.5rem)]">
              {listaResultados(() => {
                setQuery("");
                setCompactSearchOpen(false);
              })}
            </ul>
          )}
        </div>
        {favoritesOpen && (
          <div className="absolute top-full right-3 z-50 mt-2 w-[min(18rem,calc(100vw-1.5rem))] border border-border bg-popover p-4 text-popover-foreground shadow-xl min-[390px]:right-4 sm:right-24 xl:hidden">
            <p className="font-display text-sm uppercase">Favoritos</p>
            {favorites.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Todavía no has guardado productos.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {favorites.map((item) => (
                  <li key={item.slug}>
                    <Link
                      to="/producto/$slug"
                      params={{ slug: item.slug }}
                      onClick={() => setFavoritesOpen(false)}
                      className="block text-sm hover:text-primary"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <nav
        ref={navRef}
        aria-label="Navegación principal"
        className="relative hidden min-h-20 w-full xl:block"
        onMouseLeave={() => setOpenCat(null)}
      >
        <div className="mx-auto grid min-h-20 max-w-[120rem] grid-cols-[10.5rem_minmax(0,1fr)_22rem] items-center gap-5 px-6 2xl:grid-cols-[12rem_minmax(0,1fr)_26rem] 2xl:gap-8 2xl:px-10">
          <Link to="/" className="flex shrink-0 items-center" aria-label="Urban Print — Inicio">
            <Logo background="dark" className="h-7 2xl:h-8" />
          </Link>
          <ul className="flex min-w-0 items-stretch justify-center gap-0 2xl:gap-1">
            <li onMouseEnter={() => setOpenCat(null)}>
              <Link
                to="/"
                className="relative flex h-20 items-center px-1.5 font-sans text-[10px] font-semibold tracking-[0.06em] uppercase transition-colors hover:text-primary 2xl:px-2.5 2xl:text-[11px] after:absolute after:right-2 after:bottom-5 after:left-2 after:h-0.5 after:scale-x-0 after:bg-primary after:transition-transform"
                activeProps={{ className: "text-primary after:scale-x-100" }}
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
                    className={`flex h-20 items-center gap-0.5 px-1.5 font-sans text-[10px] font-semibold tracking-[0.04em] uppercase transition-colors hover:text-primary 2xl:px-2.5 2xl:text-[11px] ${
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
          </ul>

          <div className="relative grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
            <div className="relative z-10 flex h-10 min-w-0 justify-end">
              <div
                className={`relative h-10 overflow-visible transition-[width] duration-300 ease-out ${desktopSearchOpen ? "w-96" : "w-10"}`}
              >
                {desktopSearchOpen ? (
                  <>
                    <label htmlFor="buscador" className="sr-only">
                      Buscar productos y categorías
                    </label>
                    <Search
                      className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted"
                      aria-hidden
                    />
                    <input
                      id="buscador"
                      ref={searchRef}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Buscar productos..."
                      maxLength={80}
                      className="h-10 w-full rounded-full border border-ink-foreground/10 bg-ink-foreground/10 pr-9 pl-9 text-xs text-ink-foreground outline-none placeholder:text-ink-muted focus:border-primary"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Cerrar búsqueda"
                      title="Cerrar búsqueda"
                      onClick={() => {
                        setQuery("");
                        setDesktopSearchOpen(false);
                      }}
                      className="absolute top-1/2 right-0 size-10 -translate-y-1/2 text-ink-muted hover:bg-transparent hover:text-primary"
                    >
                      <X className="size-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Abrir búsqueda"
                    title="Buscar"
                    onClick={() => {
                      setDesktopSearchOpen(true);
                      window.setTimeout(() => searchRef.current?.focus(), 0);
                    }}
                    className="micro-scale text-ink-foreground hover:bg-ink-foreground/10 hover:text-primary"
                  >
                    <Search className="size-5" />
                  </Button>
                )}
                {desktopSearchOpen && hayResultados && (
                  <ul className="absolute top-[calc(100%+0.5rem)] right-0 left-0 z-50 max-h-96 overflow-auto border border-border bg-popover text-popover-foreground shadow-xl">
                    {listaResultados(() => {
                      setQuery("");
                      setDesktopSearchOpen(false);
                    })}
                  </ul>
                )}
              </div>
            </div>

            <div className="relative flex shrink-0 items-center gap-0.5">
              <Button
                asChild
                variant="ghost"
                size="icon"
                aria-label="Panel de control"
                className="micro-scale hidden text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground lg:inline-flex"
              >
                <Link to="/admin">
                  <LayoutDashboard className="size-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="icon"
                aria-label="Área de cliente"
                className="micro-scale text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground"
              >
                <Link to="/cuenta">
                  <User className="size-5" />
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Favoritos"
                title="Favoritos"
                onClick={() => setFavoritesOpen((open) => !open)}
                className="micro-scale relative text-ink-foreground hover:bg-ink-foreground/10 hover:text-primary"
              >
                <Heart
                  className={`size-5 ${favorites.length > 0 ? "fill-primary text-primary" : ""}`}
                />
                {favorites.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {favorites.length}
                  </span>
                )}
              </Button>
              <Button
                asChild
                variant="ghost"
                size="icon"
                aria-label="Carrito"
                className="micro-scale relative text-ink-foreground hover:bg-ink-foreground/10 hover:text-ink-foreground"
              >
                <Link to="/carrito">
                  <ShoppingCart className="size-5" />
                  {count > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {count}
                    </span>
                  )}
                </Link>
              </Button>
              <NaturHouseLink compact className="ml-1" />
              {favoritesOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 border border-border bg-popover p-4 text-popover-foreground shadow-xl">
                  <p className="font-display text-sm uppercase">Favoritos</p>
                  {favorites.length === 0 ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Todavía no has guardado productos.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-2">
                      {favorites.map((item) => (
                        <li key={item.slug}>
                          <Link
                            to="/producto/$slug"
                            params={{ slug: item.slug }}
                            onClick={() => setFavoritesOpen(false)}
                            className="block text-sm hover:text-primary"
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

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

      <Sheet open={openMenu} onOpenChange={setOpenMenu}>
        <SheetContent
          side="right"
          className="w-[min(26rem,92vw)] max-w-none overflow-y-auto border-ink-foreground/10 bg-hero-surface p-0 text-ink-foreground sm:max-w-md xl:hidden"
        >
          <SheetHeader className="border-b border-ink-foreground/10 px-5 py-5 text-left">
            <SheetTitle className="pr-10 text-ink-foreground">
              <Logo background="dark" className="h-auto w-full max-w-56 sm:max-w-64" />
            </SheetTitle>
          </SheetHeader>
          <div className="flex min-h-[calc(100dvh-5rem)] flex-col overflow-x-hidden px-5 py-5">
            <nav aria-label="Navegación móvil">
              <ul className="divide-y divide-ink-foreground/10 border-y border-ink-foreground/10">
                <li>
                  <Link
                    to="/"
                    onClick={() => setOpenMenu(false)}
                    className="micro-scale block min-h-14 py-4 font-display text-base uppercase transition-colors hover:text-primary"
                    activeProps={{ className: "text-primary" }}
                    activeOptions={{ exact: true }}
                  >
                    Inicio
                  </Link>
                </li>
                {CATEGORIAS.map((item) => {
                  const entry = menu.find((menuItem) => menuItem.item.slug === item.slug);
                  const abierto = openMobileItem === item.slug;
                  return (
                    <li key={item.slug}>
                      <Button
                        type="button"
                        variant="ghost"
                        aria-expanded={abierto}
                        aria-controls={`menu-movil-${item.slug}`}
                        onClick={() => setOpenMobileItem(abierto ? null : item.slug)}
                        className="micro-scale flex min-h-14 w-full justify-between rounded-none px-0 py-4 font-display text-base uppercase hover:bg-transparent hover:text-primary"
                      >
                        {item.name}
                        <ChevronDown
                          className={`size-4 transition-transform duration-300 ${abierto ? "rotate-180 text-primary" : ""}`}
                        />
                      </Button>
                      {abierto && (
                        <div id={`menu-movil-${item.slug}`} className="pb-5">
                          <Link
                            to="/categoria/$slug"
                            params={{ slug: item.slug }}
                            onClick={() => setOpenMenu(false)}
                            className="mb-4 inline-flex min-h-10 items-center font-sans text-xs font-semibold text-primary uppercase"
                          >
                            Ver todo {item.name} →
                          </Link>
                          <div className="space-y-4 border-l border-ink-foreground/10 pl-4">
                            {(entry?.columnas ?? []).map((columna) => (
                              <div key={columna.titulo}>
                                {columna.slug ? (
                                  <Link
                                    to="/categoria/$slug"
                                    params={{ slug: columna.slug }}
                                    onClick={() => setOpenMenu(false)}
                                    className="block py-1 font-display text-xs text-ink-muted uppercase transition-colors hover:text-primary"
                                  >
                                    {columna.titulo}
                                  </Link>
                                ) : (
                                  <p className="py-1 font-display text-xs text-ink-muted uppercase">
                                    {columna.titulo}
                                  </p>
                                )}
                                <ul className="mt-1 space-y-0.5">
                                  {columna.productos.map((producto) => (
                                    <li key={producto.id}>
                                      <Link
                                        to="/producto/$slug"
                                        params={{ slug: producto.slug }}
                                        onClick={() => setOpenMenu(false)}
                                        className="block min-h-9 py-2 text-sm leading-5 transition-colors hover:text-primary"
                                      >
                                        {producto.name}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="mt-6 border-t border-ink-foreground/15 pt-5">
              <NaturHouseLink onClick={() => setOpenMenu(false)} />

              <div className="mt-2 divide-y divide-ink-foreground/10">
                <div>
                  <Button
                    type="button"
                    variant="ghost"
                    aria-expanded={openMobileItem === "empresa"}
                    aria-controls="menu-movil-empresa"
                    onClick={() =>
                      setOpenMobileItem(openMobileItem === "empresa" ? null : "empresa")
                    }
                    className="micro-scale flex min-h-14 w-full justify-between rounded-none px-0 py-4 font-display text-base uppercase hover:bg-transparent hover:text-primary"
                  >
                    Empresa
                    <ChevronDown
                      className={`size-4 transition-transform duration-300 ${openMobileItem === "empresa" ? "rotate-180 text-primary" : ""}`}
                    />
                  </Button>
                  {openMobileItem === "empresa" && (
                    <ul
                      id="menu-movil-empresa"
                      className="border-l border-ink-foreground/10 pb-3 pl-4"
                    >
                      <li>
                        <Link
                          to="/empresa"
                          onClick={() => setOpenMenu(false)}
                          className="block min-h-11 py-3 text-sm transition-colors hover:text-primary"
                        >
                          La empresa
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/contacto"
                          onClick={() => setOpenMenu(false)}
                          className="block min-h-11 py-3 text-sm transition-colors hover:text-primary"
                        >
                          Trabaja con nosotros
                        </Link>
                      </li>
                    </ul>
                  )}
                </div>
                <Link
                  to="/diseno-grafico"
                  onClick={() => setOpenMenu(false)}
                  className="micro-scale flex min-h-14 items-center py-4 font-display text-base uppercase transition-colors hover:text-primary"
                >
                  Diseño gráfico
                </Link>
                <Link
                  to="/cuenta"
                  onClick={() => setOpenMenu(false)}
                  className="micro-scale flex min-h-14 items-center py-4 font-display text-base uppercase transition-colors hover:text-primary"
                >
                  Área de cliente
                </Link>
                <Link
                  to="/admin"
                  onClick={() => setOpenMenu(false)}
                  className="micro-scale flex min-h-14 items-center gap-2 py-4 font-display text-base uppercase transition-colors hover:text-primary"
                >
                  <LayoutDashboard className="size-4" />
                  Panel Admin
                </Link>
              </div>
            </div>

            <div className="mt-6 border-t border-ink-foreground/15 pt-6">
              <p className="font-display text-xl uppercase">¿Tienes un proyecto?</p>
              <p className="mt-1 text-sm text-ink-muted">Cuéntanos qué necesitas.</p>
              <Button
                asChild
                size="lg"
                className="micro-scale mt-5 h-12 w-full rounded-none font-display text-sm uppercase"
              >
                <Link to="/contacto" onClick={() => setOpenMenu(false)}>
                  Pedir presupuesto →
                </Link>
              </Button>
              <div className="mt-5 flex items-center gap-5 border-t border-ink-foreground/10 pt-5">
                <a
                  href={REDES.instagram}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="micro-scale inline-flex min-h-10 items-center gap-2 text-xs uppercase transition-colors hover:text-primary"
                >
                  <Instagram className="size-4" />
                  Instagram
                </a>
                <a
                  href={REDES.facebook}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="micro-scale inline-flex min-h-10 items-center gap-2 text-xs uppercase transition-colors hover:text-primary"
                >
                  <Facebook className="size-4" />
                  Facebook
                </a>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
