CREATE OR REPLACE FUNCTION public.slugify(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT trim(both '-' from regexp_replace(
    lower(translate(value, 'áàäâéèëêíìïîóòöôúùüûñçÁÀÄÂÉÈËÊÍÌÏÎÓÒÖÔÚÙÜÛÑÇ', 'aaaaeeeeiiiioooouuuuncAAAAEEEEIIIIOOOOUUUUNC')),
    '[^a-z0-9]+', '-', 'g'));
$$;

CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  parent_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
  description text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  price numeric(10,2) NOT NULL DEFAULT 0,
  description text,
  position integer NOT NULL DEFAULT 0,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author text NOT NULL,
  rating integer NOT NULL DEFAULT 5,
  content text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  first_name text,
  last_name text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  kind text NOT NULL DEFAULT 'envio',
  full_name text NOT NULL,
  company text,
  street text NOT NULL,
  postal_code text NOT NULL,
  city text NOT NULL,
  province text NOT NULL,
  country text NOT NULL DEFAULT 'España',
  phone text,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  order_number text NOT NULL,
  status text NOT NULL DEFAULT 'pendiente_pago',
  total numeric(10,2) NOT NULL DEFAULT 0,
  shipping_name text,
  shipping_street text,
  shipping_postal_code text,
  shipping_city text,
  shipping_province text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_slug text NOT NULL,
  product_name text NOT NULL,
  unit_price numeric(10,2) NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  file_url text NOT NULL,
  expires_at timestamptz,
  remaining integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT ALL ON public.reviews TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
GRANT ALL ON public.addresses TO service_role;
GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
GRANT SELECT ON public.downloads TO authenticated;
GRANT ALL ON public.downloads TO service_role;
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT ALL ON public.contact_messages TO service_role;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Catalogo publico" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Productos publicos" ON public.products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Resenas publicas" ON public.reviews FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Perfil propio visible" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Perfil propio creable" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Perfil propio editable" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Direcciones propias" ON public.addresses FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pedidos propios visibles" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Pedidos propios creables" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Lineas de pedidos propios visibles" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));
CREATE POLICY "Lineas de pedidos propios creables" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

CREATE POLICY "Descargas propias" ON public.downloads FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Cualquiera puede escribir" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER addresses_updated_at BEFORE UPDATE ON public.addresses
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'first_name', NEW.raw_user_meta_data ->> 'last_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.categories (slug, name, parent_id, description, position) VALUES
 ('impresion', 'Impresión', NULL, 'Imprenta, gran formato e impresión textil bajo un mismo techo en Orihuela.', 1),
 ('merchandising', 'Merchandising', NULL, 'Artículos promocionales que ponen tu marca en manos de tus clientes.', 2),
 ('regalos-personalizados', 'Regalos Personalizados', NULL, 'Objetos cotidianos convertidos en regalos únicos.', 3),
 ('eventos-bodas', 'Eventos y Bodas', NULL, 'Candy bar, papelería nupcial y detalles para celebraciones.', 4),
 ('sellos', 'Sellos', NULL, 'Sellos automáticos, fechadores y cuñas de madera.', 5);

INSERT INTO public.categories (slug, name, parent_id, description, position) VALUES
 ('imprenta-general', 'Imprenta General', (SELECT id FROM public.categories WHERE slug='impresion'), 'Papelería comercial y corporativa impresa con acabados profesionales.', 1),
 ('gran-formato', 'Gran Formato', (SELECT id FROM public.categories WHERE slug='impresion'), 'Publicidad exterior e interior de gran tamaño.', 2),
 ('impresion-textil', 'Impresión Textil', (SELECT id FROM public.categories WHERE slug='impresion'), 'Serigrafía, bordado, sublimación, vinilo textil y DTF.', 3),
 ('candy-bar', 'Eventos / Candy Bar', (SELECT id FROM public.categories WHERE slug='eventos-bodas'), 'Todo para montar una mesa dulce inolvidable.', 1),
 ('bodas-invitaciones', 'Bodas e Invitaciones', (SELECT id FROM public.categories WHERE slug='eventos-bodas'), 'Invitaciones, minutas, seating plan y recuerdos.', 2);

INSERT INTO public.products (slug, name, category_id, price, position, featured)
SELECT public.slugify(v.name), v.name, (SELECT id FROM public.categories WHERE slug='imprenta-general'), v.price, v.pos, v.feat
FROM (VALUES
 ('Agenda', 12.90, 1, true),
 ('Bolsa', 4.50, 2, false),
 ('Camiseta Golden T.', 14.90, 3, false),
 ('Cartel promocional', 9.90, 4, false),
 ('Polo Star V.', 19.90, 5, false),
 ('Taza Naturhouse', 8.90, 6, false),
 ('Recetarios', 24.90, 7, false)
) AS v(name, price, pos, feat);

INSERT INTO public.products (slug, name, category_id, price, position, featured)
SELECT public.slugify(v.name), v.name, (SELECT id FROM public.categories WHERE slug='gran-formato'), v.price, v.pos, v.feat
FROM (VALUES
 ('Lonas', 29.90, 1, true),
 ('Eventos Photocall', 149.00, 2, true),
 ('Banderas con pie', 89.00, 3, false),
 ('Murales de vinilo', 39.90, 4, false),
 ('Roll-up', 69.00, 5, true),
 ('Impresión de vallas', 199.00, 6, false),
 ('Pop-Up', 349.00, 7, false),
 ('Locales comerciales', 250.00, 8, false),
 ('X-displays', 49.00, 9, false),
 ('Banderolas', 59.00, 10, false),
 ('Canvas', 34.90, 11, false),
 ('Pegatinas en bobina', 24.90, 12, false),
 ('Placa de metacrilato', 44.90, 13, false),
 ('Rotulación de vehículos', 320.00, 14, false)
) AS v(name, price, pos, feat);

INSERT INTO public.products (slug, name, category_id, price, position, featured)
SELECT public.slugify(v.name), v.name, (SELECT id FROM public.categories WHERE slug='impresion-textil'), v.price, v.pos, v.feat
FROM (VALUES
 ('Bordado', 6.90, 1, false),
 ('Pañuelos', 3.90, 2, false),
 ('Sublimación', 9.90, 3, false),
 ('Camisetas personalizadas a todo color', 12.90, 4, true),
 ('Ropa deportiva', 22.90, 5, false),
 ('Vinilo textil', 7.90, 6, false),
 ('Despedidas de soltera', 11.90, 7, false),
 ('Ropa laboral', 26.90, 8, true),
 ('Serigrafía', 8.90, 9, false)
) AS v(name, price, pos, feat);

INSERT INTO public.products (slug, name, category_id, price, position, featured)
SELECT public.slugify(v.name), v.name, (SELECT id FROM public.categories WHERE slug='merchandising'), v.price, v.pos, v.feat
FROM (VALUES
 ('Alfombrillas de ratón', 6.90, 1, false),
 ('Botella de agua metálica', 11.90, 2, true),
 ('Camiseta Fox V.', 14.90, 3, false),
 ('Pack Especial', 59.00, 4, false),
 ('Pack promocional', 45.00, 5, false),
 ('Sudadera Urban', 29.90, 6, true),
 ('Cartel individual', 4.90, 7, false),
 ('Termo para infusiones', 15.90, 8, false),
 ('Bolígrafo puntero', 1.90, 9, false),
 ('Calendario de nevera', 2.90, 10, false),
 ('Calendario sobremesa', 5.90, 11, false),
 ('Cartel de primera visita', 6.90, 12, false),
 ('Polo Star B.', 19.90, 13, false),
 ('Tarjetas de visita', 19.90, 14, true),
 ('Carteles promoción 12 unidades', 34.90, 15, false)
) AS v(name, price, pos, feat);

INSERT INTO public.products (slug, name, category_id, price, position, featured)
SELECT public.slugify(v.name), v.name, (SELECT id FROM public.categories WHERE slug='regalos-personalizados'), v.price, v.pos, v.feat
FROM (VALUES
 ('Babero personalizado', 8.90, 1, false),
 ('Cojín personalizado', 16.90, 2, false),
 ('Jarras de cerveza esmerilada', 12.90, 3, false),
 ('Lienzo huellas', 39.90, 4, false),
 ('Pañuelo boda', 9.90, 5, false),
 ('Sublima - Alfombrilla para ratón', 7.90, 6, false),
 ('Pegatina de bebé a bordo', 3.90, 7, false),
 ('Copa de vino personalizada', 10.90, 8, false),
 ('Láminas enmarcadas', 24.90, 9, false),
 ('Lienzo firmas', 42.90, 10, false),
 ('Sublima - Taza personalizada', 9.90, 11, true),
 ('Tazas mágicas', 12.90, 12, true),
 ('Body de Bebé personalizado', 13.90, 13, false),
 ('Delantal personalizado', 15.90, 14, false),
 ('Libro firmas "Personalizado"', 34.90, 15, false),
 ('Números troquelados con fotos', 29.90, 16, false),
 ('Sublima - Pulsera personalizada', 6.90, 17, false),
 ('Botella aluminio bidón varn 500 ml.', 11.90, 18, false),
 ('Imanes de nevera', 2.90, 19, false),
 ('Lienzos personalizados', 32.90, 20, false),
 ('Pañoleta para eventos', 5.90, 21, false),
 ('Sublima - Mochila personalizada', 18.90, 22, false)
) AS v(name, price, pos, feat);

INSERT INTO public.products (slug, name, category_id, price, position, featured)
SELECT v.slug, v.name, (SELECT id FROM public.categories WHERE slug='candy-bar'), v.price, v.pos, v.feat
FROM (VALUES
 ('candy-bar-mesa-dulce', 'Candy Bar', 89.00, 1, true),
 ('bandera-candy-bar', 'Bandera Candy Bar', 14.90, 2, false),
 ('pack-candy-bar', 'Pack Candy Bar', 49.00, 3, true),
 ('pegatinas-para-detalles-de-candy-bar', 'Pegatinas para detalles de Candy Bar', 9.90, 4, false),
 ('pegatinas-botellas-de-agua-candy-bar', 'Pegatinas botellas de agua Candy Bar', 9.90, 5, false),
 ('poster-personalizado-para-candy-bar', 'Póster personalizado para candy bar', 16.90, 6, false),
 ('tarjetas-con-nombre-candy-bar', 'Tarjetas con nombre – Candy bar', 12.90, 7, false),
 ('copas-de-cristal', 'Copas de cristal', 10.90, 8, false),
 ('etiquetas-de-regalo', 'Etiquetas de regalo', 6.90, 9, false),
 ('eventos-photocall-candy-bar', 'Eventos Photocall', 149.00, 10, false),
 ('lona-de-boda', 'Lona de boda', 59.00, 11, false),
 ('pegatinas-eventos', 'Pegatinas eventos', 8.90, 12, false)
) AS v(slug, name, price, pos, feat);

INSERT INTO public.products (slug, name, category_id, price, position, featured)
SELECT public.slugify(v.name), v.name, (SELECT id FROM public.categories WHERE slug='bodas-invitaciones'), v.price, v.pos, v.feat
FROM (VALUES
 ('Invitaciones de boda personalizadas', 1.90, 1, true),
 ('Minutas para boda con diseño personalizado', 1.20, 2, false),
 ('Lona de comunión (chico)', 49.00, 3, false),
 ('Lona de comunión (chica)', 49.00, 4, false),
 ('Minutas personalizadas', 1.20, 5, false),
 ('Minutas para bautizo con diseño personalizado', 1.20, 6, false),
 ('Seating plan modelo caballete', 69.00, 7, true),
 ('Seating plan para eventos personalizado', 54.00, 8, false),
 ('Postales', 0.90, 9, false),
 ('Recuerdo evento – marcapáginas', 1.50, 10, false)
) AS v(name, price, pos, feat);

INSERT INTO public.products (slug, name, category_id, price, position, featured)
SELECT public.slugify(v.name), v.name, (SELECT id FROM public.categories WHERE slug='sellos'), v.price, v.pos, v.feat
FROM (VALUES
 ('P 53 – dater', 34.90, 1, false),
 ('Printer Line – Fechador', 32.90, 2, false),
 ('Cuña Madera', 18.90, 3, false),
 ('4926/P-60', 44.90, 4, false),
 ('4927/P-55', 39.90, 5, false),
 ('4928', 29.90, 6, false),
 ('P-50', 26.90, 7, false),
 ('R-24', 24.90, 8, false),
 ('Almohábenos', 6.90, 9, true)
) AS v(name, price, pos, feat);

INSERT INTO public.reviews (author, rating, content, position) VALUES
 ('Ekaterina Maksimkina', 5, 'Trato excelente y resultados impecables. Me asesoraron con el diseño y la entrega fue rapidísima.', 1),
 ('Paloma Lorente', 5, 'Encargué las invitaciones de mi boda y quedaron preciosas. Cuidan cada detalle del acabado.', 2),
 ('Rocío Roca Mora', 5, 'Profesionales de verdad. Revisaron mis archivos sin coste y corrigieron todo antes de imprimir.', 3);