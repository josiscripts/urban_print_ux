import { useState } from "react";
import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import {
  BarChart3,
  Calculator,
  Coins,
  LayoutDashboard,
  Menu,
  Package,
  Receipt,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  // La sesión vive en el navegador: la comprobación se hace solo en cliente.
  // La protección real está en el middleware requireAdmin de las server functions.
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth", search: { next: location.href } });
    }
    const { data: rol } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!rol) throw redirect({ to: "/" });
    return { user: data.user };
  },
  head: () => ({
    meta: [
      { title: "Panel Admin — Urban Print" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

const ENLACES = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/productos", label: "Productos", icon: Package },
  { to: "/admin/costes", label: "Costes", icon: Coins },
  { to: "/admin/gastos", label: "Gastos", icon: Receipt },
  { to: "/admin/rentabilidad", label: "Rentabilidad", icon: BarChart3 },
  { to: "/admin/calculadora", label: "Calculadora", icon: Calculator },
] as const;

function Navegacion({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Navegación del panel">
      {ENLACES.map((enlace) => (
        <Link
          key={enlace.to}
          to={enlace.to}
          activeOptions={{ exact: "exact" in enlace ? enlace.exact : false }}
          onClick={onNavigate}
          activeProps={{ className: "bg-primary/12 text-primary" }}
          className="flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <enlace.icon className="size-4 shrink-0" />
          {enlace.label}
        </Link>
      ))}
      <Link
        to="/"
        onClick={onNavigate}
        className="mt-4 flex min-h-11 items-center gap-3 rounded-md border border-border px-3 text-sm font-medium transition-colors hover:bg-muted"
      >
        <Store className="size-4 shrink-0" />
        Volver a Urban Print
      </Link>
    </nav>
  );
}

function AdminLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-[110rem]">
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-card p-4 lg:flex">
          <Link to="/admin" className="mb-6 block">
            <Logo background="theme" className="w-32" />
            <span className="mt-2 block font-sans text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
              Panel Admin
            </span>
          </Link>
          <Navegacion />
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Abrir navegación del panel">
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[17rem] overflow-y-auto p-4">
                <SheetHeader className="p-0 text-left">
                  <SheetTitle className="font-display text-base uppercase">Panel Admin</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <Navegacion onNavigate={() => setOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
            <span className="font-display text-sm uppercase tracking-[0.08em]">Panel Admin</span>
          </header>

          <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex min-w-0 flex-col gap-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
