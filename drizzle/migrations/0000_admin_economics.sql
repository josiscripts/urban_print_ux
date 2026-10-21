CREATE TABLE public.product_economics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
  sku text,
  vat_rate numeric NOT NULL DEFAULT 21,
  cost_materials numeric NOT NULL DEFAULT 0,
  cost_printing numeric NOT NULL DEFAULT 0,
  cost_production numeric NOT NULL DEFAULT 0,
  cost_labor numeric NOT NULL DEFAULT 0,
  cost_packaging numeric NOT NULL DEFAULT 0,
  cost_handling numeric NOT NULL DEFAULT 0,
  cost_shipping numeric NOT NULL DEFAULT 0,
  cost_other numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_economics TO authenticated;
GRANT ALL ON public.product_economics TO service_role;
ALTER TABLE public.product_economics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Economia solo admin" ON public.product_economics FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER product_economics_updated_at BEFORE UPDATE ON public.product_economics
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.product_cost_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  min_qty integer NOT NULL DEFAULT 1,
  max_qty integer,
  unit_cost numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX product_cost_tiers_product_idx ON public.product_cost_tiers(product_id, min_qty);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_cost_tiers TO authenticated;
GRANT ALL ON public.product_cost_tiers TO service_role;
ALTER TABLE public.product_cost_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tramos solo admin" ON public.product_cost_tiers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.product_cost_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  previous_total numeric NOT NULL DEFAULT 0,
  new_total numeric NOT NULL DEFAULT 0,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX product_cost_history_product_idx ON public.product_cost_history(product_id, created_at DESC);

GRANT SELECT, INSERT ON public.product_cost_history TO authenticated;
GRANT ALL ON public.product_cost_history TO service_role;
ALTER TABLE public.product_cost_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Historico solo admin" ON public.product_cost_history FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.admin_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'otros',
  amount numeric NOT NULL DEFAULT 0,
  is_percentage boolean NOT NULL DEFAULT false,
  scope text NOT NULL DEFAULT 'global',
  category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  active boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_expenses TO authenticated;
GRANT ALL ON public.admin_expenses TO service_role;
ALTER TABLE public.admin_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gastos solo admin" ON public.admin_expenses FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER admin_expenses_updated_at BEFORE UPDATE ON public.admin_expenses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();