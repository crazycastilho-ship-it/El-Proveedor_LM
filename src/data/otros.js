// ============================================================================
//  OTROS PRODUCTOS de la carnicería (además del cerdo)
// ============================================================================
// Respaldo local. Si conectas Supabase, se cargan desde la tabla products con
// category = 'otros' y estos quedan solo como respaldo.
//
//   unit: 'kg'      -> se pide por peso (libras/kilos), price es POR KILO
//   unit: 'unidad'  -> se pide por cantidad, price es POR UNIDAD
//   unitLabel: cómo se llama la unidad (unidad, paquete, bandeja, cubeta, bolsa…)

export const OTROS = [
  {
    slug: 'chorizo',
    name: 'Chorizo casero',
    price: 3500,
    unit: 'unidad',
    unitLabel: 'unidad',
    description: 'Chorizo artesanal de la casa. Ideal para asar o freír.',
  },
  {
    slug: 'morcilla',
    name: 'Morcilla rellena',
    price: 3000,
    unit: 'unidad',
    unitLabel: 'unidad',
    description: 'Morcilla criolla bien rellena, lista para la parrilla.',
  },
  {
    slug: 'longaniza',
    name: 'Longaniza',
    price: 22000,
    unit: 'kg',
    unitLabel: 'kg',
    description: 'Longaniza fresca, por libra o kilo.',
  },
  {
    slug: 'chicharron',
    name: 'Chicharrón carnudo',
    price: 28000,
    unit: 'kg',
    unitLabel: 'kg',
    description: 'Papada y tocino con buena carne para un chicharrón perfecto.',
  },
  {
    slug: 'tocineta',
    name: 'Tocineta ahumada',
    price: 26000,
    unit: 'kg',
    unitLabel: 'kg',
    description: 'Tocineta ahumada en casa, cortada al gusto.',
  },
  {
    slug: 'costillitas-bbq',
    name: 'Costillitas BBQ marinadas',
    price: 24000,
    unit: 'kg',
    unitLabel: 'kg',
    description: 'Costillas marinadas listas para el horno o la parrilla.',
  },
  {
    slug: 'huevos',
    name: 'Huevos (cubeta x30)',
    price: 18000,
    unit: 'unidad',
    unitLabel: 'cubeta',
    description: 'Cubeta de 30 huevos frescos.',
  },
  {
    slug: 'carbon',
    name: 'Carbón (bolsa 3 kg)',
    price: 12000,
    unit: 'unidad',
    unitLabel: 'bolsa',
    description: 'Carbón para el asado, bolsa de 3 kg.',
  },
]
