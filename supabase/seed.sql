-- ============================================================
--  Datos iniciales. Ejecuta DESPUÉS de schema.sql.
--  Precios en COP (de ejemplo, edítalos a tu gusto o desde el panel /admin).
-- ============================================================

-- -------- Cortes de cerdo (category 'cerdo', por kg) --------
insert into public.products (slug, name, description, price_per_kg, methods, category, unit, sort) values
('lomo',      'Lomo',      'Corte magro y tierno de la parte alta del lomo. Ideal al horno, a la sartén o en la parrilla.', 21000, '{horno,sarten,parrilla}', 'cerdo','kg', 1),
('chuletero', 'Chuletero', 'De aquí salen las chuletas con hueso. Jugoso, perfecto para la parrilla.',                    19500, '{parrilla,horno}',        'cerdo','kg', 2),
('solomillo', 'Solomillo', 'El corte más tierno del cerdo, pequeño y magro.',                                            26000, '{sarten,horno}',          'cerdo','kg', 3),
('aguja',     'Aguja',     'Cuello y parte alta de la paleta, con grasa entreverada. Para guisos y pernil.',              16500, '{guiso,horno,parrilla}',  'cerdo','kg', 4),
('costillar', 'Costillar', 'Las costillas del cerdo. Ahumadas, a la BBQ o en sancocho.',                                  18000, '{parrilla,horno,guiso}',  'cerdo','kg', 5),
('cabeza',    'Cabeza',    'Rica en colágeno. Base de caldos, tamales y preparaciones tradicionales.',                     8500, '{guiso}',                 'cerdo','kg', 6),
('papada',    'Papada',    'Corte graso y sabroso. Para chicharrón, confitados y guisos.',                               12000, '{sarten,horno}',          'cerdo','kg', 7),
('paleta',    'Paleta',    'Brazuelo delantero. Carne jugosa para desmechar o pernil pequeño.',                          15000, '{guiso,horno}',           'cerdo','kg', 8),
('manos',     'Manos',     'Patas delanteras. Para caldos, frijoles y preparaciones con colágeno.',                       9000, '{guiso}',                 'cerdo','kg', 9),
('panceta',   'Panceta',   'La barriga: capas de carne y grasa. Tocineta y chicharrón carnudo.',                         16000, '{sarten,horno,parrilla}', 'cerdo','kg', 10),
('jamon',     'Jamón',     'La pierna trasera. El pernil por excelencia.',                                              15500, '{horno,guiso,parrilla}',  'cerdo','kg', 11),
('rabo',      'Rabo',      'Cola del cerdo. Gelatinosa y con mucho sabor para sopas y guisos.',                          10000, '{guiso}',                 'cerdo','kg', 12)
on conflict (slug) do update set
  name=excluded.name, description=excluded.description, price_per_kg=excluded.price_per_kg,
  methods=excluded.methods, category=excluded.category, unit=excluded.unit, sort=excluded.sort;

-- -------- Otros productos (category 'otros') ----------------
insert into public.products (slug, name, description, price_per_kg, category, unit, unit_label, sort) values
('chorizo',        'Chorizo casero',            'Chorizo artesanal de la casa. Para asar o freír.',            3500,  'otros','unidad','unidad', 1),
('morcilla',       'Morcilla rellena',          'Morcilla criolla bien rellena, lista para la parrilla.',      3000,  'otros','unidad','unidad', 2),
('longaniza',      'Longaniza',                 'Longaniza fresca, por libra o kilo.',                         22000, 'otros','kg',    'kg',     3),
('chicharron',     'Chicharrón carnudo',        'Papada y tocino con buena carne para un chicharrón perfecto.',28000, 'otros','kg',    'kg',     4),
('tocineta',       'Tocineta ahumada',          'Tocineta ahumada en casa, cortada al gusto.',                 26000, 'otros','kg',    'kg',     5),
('costillitas-bbq','Costillitas BBQ marinadas', 'Costillas marinadas listas para el horno o la parrilla.',     24000, 'otros','kg',    'kg',     6),
('huevos',         'Huevos (cubeta x30)',       'Cubeta de 30 huevos frescos.',                                18000, 'otros','unidad','cubeta', 7),
('carbon',         'Carbón (bolsa 3 kg)',       'Carbón para el asado, bolsa de 3 kg.',                        12000, 'otros','unidad','bolsa',  8)
on conflict (slug) do update set
  name=excluded.name, description=excluded.description, price_per_kg=excluded.price_per_kg,
  category=excluded.category, unit=excluded.unit, unit_label=excluded.unit_label, sort=excluded.sort;

-- -------- Banner promocional (ejemplo; reemplázalo desde el panel) ----
insert into public.promos (title, media_url, media_type, cta_href, sort) values
('El Proveedor_LM · cerdo al mayor y al detal', '/promos/banner-proveedor.jpg', 'image', '#cortes', 0);
