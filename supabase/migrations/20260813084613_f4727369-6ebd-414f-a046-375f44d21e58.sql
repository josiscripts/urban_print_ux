
-- 1. Renombrar/promover categorías principales
UPDATE public.categories SET slug='imprenta', name='Imprenta', parent_id=NULL, position=1,
  description='Imprenta comercial, papelería y material impreso para tu negocio.' WHERE slug='imprenta-general';
UPDATE public.categories SET parent_id=NULL, position=2,
  description='Impresión de gran formato, displays, rotulación y soportes publicitarios.' WHERE slug='gran-formato';
UPDATE public.categories SET name='Textil', parent_id=NULL, position=3,
  description='Personalización textil: camisetas, sudaderas, ropa laboral y deportiva.' WHERE slug='impresion-textil';
UPDATE public.categories SET parent_id=NULL, position=4,
  description='Productos promocionales y corporativos para tu marca.' WHERE slug='merchandising';
UPDATE public.categories SET slug='eventos', name='Eventos', parent_id=NULL, position=5,
  description='Candy Bar, comuniones, bautizos, despedidas y eventos personalizados.' WHERE slug='candy-bar';
UPDATE public.categories SET slug='bodas', name='Bodas', parent_id=NULL, position=6,
  description='Invitaciones, papelería, decoración y detalles para tu boda.' WHERE slug='bodas-invitaciones';
UPDATE public.categories SET parent_id=NULL, position=7,
  description='Sellos automáticos, fechadores, cuñas de madera y almohadillas.' WHERE slug='sellos';
UPDATE public.categories SET parent_id=NULL, position=8,
  description='Regalos y productos personalizados para cada ocasión.' WHERE slug='regalos-personalizados';

DELETE FROM public.categories WHERE slug IN ('impresion','eventos-bodas');

-- 2. Subcategorías (familias)
INSERT INTO public.categories (slug, name, description, parent_id, position)
SELECT v.slug, v.name, v.description, p.id, v.position
FROM (VALUES
  ('imprenta-papeleria','Papelería y productos impresos','Tarjetas, carteles, recetarios y agendas.','imprenta',1),
  ('imprenta-material-promocional','Material promocional','Bolsas y packs promocionales.','imprenta',2),
  ('imprenta-corporativos','Productos corporativos impresos','Prendas y artículos corporativos impresos.','imprenta',3),
  ('gf-lonas-soportes','Lonas y soportes','Lonas, banderolas, canvas y metacrilato.','gran-formato',1),
  ('gf-displays','Displays y eventos','Roll-up, X-displays, pop-up y photocall.','gran-formato',2),
  ('gf-publicidad-exterior','Publicidad exterior','Impresión de vallas publicitarias.','gran-formato',3),
  ('gf-rotulacion','Rotulación','Locales comerciales, vehículos y murales de vinilo.','gran-formato',4),
  ('gf-adhesivos','Adhesivos','Pegatinas en bobina y vinilos adhesivos.','gran-formato',5),
  ('textil-personalizacion','Personalización','Camisetas y prendas personalizadas a todo color.','impresion-textil',1),
  ('textil-tecnicas','Técnicas de impresión','Bordado, sublimación, serigrafía y vinilo textil.','impresion-textil',2),
  ('textil-profesional','Ropa profesional y deportiva','Ropa laboral y equipaciones deportivas.','impresion-textil',3),
  ('merch-oficina','Oficina','Alfombrillas, bolígrafos, agendas y calendarios.','merchandising',1),
  ('merch-bebidas','Bebidas','Botellas metálicas y termos personalizados.','merchandising',2),
  ('merch-textil','Textil promocional','Camisetas, sudaderas y polos promocionales.','merchandising',3),
  ('eventos-candy-bar','Candy Bar','Todo para tu mesa dulce personalizada.','eventos',1),
  ('eventos-celebraciones','Celebraciones','Comuniones y bautizos.','eventos',2),
  ('eventos-personalizados','Eventos personalizados','Photocall, pegatinas, seating plan y recuerdos.','eventos',3),
  ('eventos-despedidas','Despedidas','Despedidas de soltero y soltera.','eventos',4),
  ('bodas-invitaciones','Invitaciones','Invitaciones de boda personalizadas.','bodas',1),
  ('bodas-papeleria','Papelería de boda','Minutas, seating plan y tarjetas con nombre.','bodas',2),
  ('bodas-decoracion','Decoración de boda','Lonas, lienzos y láminas para tu boda.','bodas',3),
  ('sellos-fechadores','Sellos y fechadores','Sellos automáticos y fechadores.','sellos',1),
  ('sellos-madera','Sellos de madera','Cuñas de madera tradicionales.','sellos',2),
  ('sellos-otros','Otros','Almohadillas y accesorios.','sellos',3),
  ('regalos-bebes','Bebés','Baberos, bodies y pegatinas de bebé.','regalos-personalizados',1),
  ('regalos-hogar','Hogar y decoración','Cojines, lienzos, láminas y tazas mágicas.','regalos-personalizados',2),
  ('regalos-bebidas','Bebidas','Jarras, copas, tazas y botellas personalizadas.','regalos-personalizados',3),
  ('regalos-accesorios','Accesorios','Alfombrillas, pulseras, mochilas, imanes y delantales.','regalos-personalizados',4),
  ('regalos-recuerdos','Recuerdos y celebraciones','Libros de firmas, números troquelados y pañuelos.','regalos-personalizados',5)
) AS v(slug,name,description,parent_slug,position)
JOIN public.categories p ON p.slug = v.parent_slug
ON CONFLICT (slug) DO NOTHING;

-- 3. Reasignar productos a su familia principal
UPDATE public.products pr SET category_id = c.id
FROM (VALUES
  ('tarjetas-de-visita','imprenta-papeleria'),('cartel-promocional','imprenta-papeleria'),
  ('cartel-individual','imprenta-papeleria'),('cartel-de-primera-visita','imprenta-papeleria'),
  ('carteles-promocion-12-unidades','imprenta-papeleria'),('recetarios','imprenta-papeleria'),
  ('agenda','imprenta-papeleria'),
  ('bolsa','imprenta-material-promocional'),('pack-especial','imprenta-material-promocional'),
  ('pack-promocional','imprenta-material-promocional'),
  ('camiseta-golden-t','imprenta-corporativos'),('polo-star-v','imprenta-corporativos'),
  ('taza-naturhouse','imprenta-corporativos'),
  ('lonas','gf-lonas-soportes'),('banderolas','gf-lonas-soportes'),('banderas-con-pie','gf-lonas-soportes'),
  ('canvas','gf-lonas-soportes'),('placa-de-metacrilato','gf-lonas-soportes'),
  ('roll-up','gf-displays'),('x-displays','gf-displays'),('pop-up','gf-displays'),('eventos-photocall','gf-displays'),
  ('impresion-de-vallas','gf-publicidad-exterior'),
  ('locales-comerciales','gf-rotulacion'),('rotulacion-de-vehiculos','gf-rotulacion'),('murales-de-vinilo','gf-rotulacion'),
  ('pegatinas-en-bobina','gf-adhesivos'),
  ('camisetas-personalizadas-a-todo-color','textil-personalizacion'),('panuelos','textil-personalizacion'),
  ('bordado','textil-tecnicas'),('sublimacion','textil-tecnicas'),('serigrafia','textil-tecnicas'),('vinilo-textil','textil-tecnicas'),
  ('ropa-laboral','textil-profesional'),('ropa-deportiva','textil-profesional'),
  ('alfombrillas-de-raton','merch-oficina'),('boligrafo-puntero','merch-oficina'),
  ('calendario-de-nevera','merch-oficina'),('calendario-sobremesa','merch-oficina'),
  ('botella-de-agua-metalica','merch-bebidas'),('termo-para-infusiones','merch-bebidas'),
  ('camiseta-fox-v','merch-textil'),('sudadera-urban','merch-textil'),('polo-star-b','merch-textil'),
  ('candy-bar-mesa-dulce','eventos-candy-bar'),('bandera-candy-bar','eventos-candy-bar'),
  ('pack-candy-bar','eventos-candy-bar'),('pegatinas-para-detalles-de-candy-bar','eventos-candy-bar'),
  ('pegatinas-botellas-de-agua-candy-bar','eventos-candy-bar'),('poster-personalizado-para-candy-bar','eventos-candy-bar'),
  ('tarjetas-con-nombre-candy-bar','eventos-candy-bar'),('copas-de-cristal','eventos-candy-bar'),
  ('etiquetas-de-regalo','eventos-candy-bar'),
  ('lona-de-comunion-chico','eventos-celebraciones'),('lona-de-comunion-chica','eventos-celebraciones'),
  ('minutas-para-bautizo-con-diseno-personalizado','eventos-celebraciones'),
  ('eventos-photocall-candy-bar','eventos-personalizados'),('pegatinas-eventos','eventos-personalizados'),
  ('panoleta-para-eventos','eventos-personalizados'),('seating-plan-para-eventos-personalizado','eventos-personalizados'),
  ('postales','eventos-personalizados'),('recuerdo-evento-marcapaginas','eventos-personalizados'),
  ('despedidas-de-soltera','eventos-despedidas'),
  ('invitaciones-de-boda-personalizadas','bodas-invitaciones'),
  ('minutas-personalizadas','bodas-papeleria'),('minutas-para-boda-con-diseno-personalizado','bodas-papeleria'),
  ('seating-plan-modelo-caballete','bodas-papeleria'),
  ('lona-de-boda','bodas-decoracion'),
  ('p-53-dater','sellos-fechadores'),('printer-line-fechador','sellos-fechadores'),('4926-p-60','sellos-fechadores'),
  ('4927-p-55','sellos-fechadores'),('4928','sellos-fechadores'),('p-50','sellos-fechadores'),('r-24','sellos-fechadores'),
  ('cuna-madera','sellos-madera'),('almohabenos','sellos-otros'),
  ('babero-personalizado','regalos-bebes'),('pegatina-de-bebe-a-bordo','regalos-bebes'),('body-de-bebe-personalizado','regalos-bebes'),
  ('cojin-personalizado','regalos-hogar'),('lienzos-personalizados','regalos-hogar'),('laminas-enmarcadas','regalos-hogar'),
  ('lienzo-huellas','regalos-hogar'),('lienzo-firmas','regalos-hogar'),('tazas-magicas','regalos-hogar'),
  ('jarras-de-cerveza-esmerilada','regalos-bebidas'),('copa-de-vino-personalizada','regalos-bebidas'),
  ('sublima-taza-personalizada','regalos-bebidas'),('botella-aluminio-bidon-varn-500-ml','regalos-bebidas'),
  ('sublima-alfombrilla-para-raton','regalos-accesorios'),('sublima-pulsera-personalizada','regalos-accesorios'),
  ('sublima-mochila-personalizada','regalos-accesorios'),('imanes-de-nevera','regalos-accesorios'),
  ('delantal-personalizado','regalos-accesorios'),
  ('libro-firmas-personalizado','regalos-recuerdos'),('numeros-troquelados-con-fotos','regalos-recuerdos'),
  ('panuelo-boda','regalos-recuerdos')
) AS m(product_slug, cat_slug)
JOIN public.categories c ON c.slug = m.cat_slug
WHERE pr.slug = m.product_slug;
