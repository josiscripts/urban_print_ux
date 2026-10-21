-- Costes, tramos, historial y gastos del admin pasan a indexarse por slug
-- del producto (y slug de categoría) en lugar de UUID de la tabla products/categories.
-- El catálogo vive ahora en WooCommerce; las columnas *_id antiguas se conservan
-- para no perder datos y pueden eliminarse en una migración posterior.

-- 1) Columnas nuevas
ALTER TABLE public.product_economics ADD COLUMN IF NOT EXISTS product_slug text;
ALTER TABLE public.product_cost_tiers ADD COLUMN IF NOT EXISTS product_slug text;
ALTER TABLE public.product_cost_history ADD COLUMN IF NOT EXISTS product_slug text;
ALTER TABLE public.admin_expenses ADD COLUMN IF NOT EXISTS product_slug text;
ALTER TABLE public.admin_expenses ADD COLUMN IF NOT EXISTS category_slug text;

-- 2) Relleno desde las tablas antiguas (solo filas que aún no tienen slug)
UPDATE public.product_economics e SET product_slug = p.slug
  FROM public.products p WHERE p.id = e.product_id AND e.product_slug IS NULL;
UPDATE public.product_cost_tiers t SET product_slug = p.slug
  FROM public.products p WHERE p.id = t.product_id AND t.product_slug IS NULL;
UPDATE public.product_cost_history h SET product_slug = p.slug
  FROM public.products p WHERE p.id = h.product_id AND h.product_slug IS NULL;
UPDATE public.admin_expenses a SET product_slug = p.slug
  FROM public.products p WHERE p.id = a.product_id AND a.product_slug IS NULL;
UPDATE public.admin_expenses a SET category_slug = c.slug
  FROM public.categories c WHERE c.id = a.category_id AND a.category_slug IS NULL;

-- 3) Las filas nuevas ya no tienen UUID antiguo
ALTER TABLE public.product_economics ALTER COLUMN product_id DROP NOT NULL;
ALTER TABLE public.product_cost_tiers ALTER COLUMN product_id DROP NOT NULL;
ALTER TABLE public.product_cost_history ALTER COLUMN product_id DROP NOT NULL;

-- 4) Índices para upsert y consultas por slug
CREATE UNIQUE INDEX IF NOT EXISTS product_economics_product_slug_key
  ON public.product_economics (product_slug);
CREATE INDEX IF NOT EXISTS product_cost_tiers_product_slug_idx
  ON public.product_cost_tiers (product_slug, min_qty);
CREATE INDEX IF NOT EXISTS product_cost_history_product_slug_idx
  ON public.product_cost_history (product_slug, created_at DESC);
