// ============================================================================
//  CORTES DEL CERDO
// ============================================================================
// Datos de respaldo (si conectas Supabase, el precio/nombre/descripción se
// cargan de la base de datos y se combinan con las zonas clickeables de aquí).
//
// pricePerKg está en pesos (COP). Edita libremente.
// methods: 'guiso' | 'parrilla' | 'sarten' | 'horno'
//
// hotspot: polígono clickeable ubicado SOBRE tu imagen del despiece
//          (coordenadas en píxeles de la imagen: 624 x 491 -> ver CONFIG.pig).
//          Si cambias la imagen, ajusta estos puntos a la nueva.

export const CORTES = [
  {
    slug: 'lomo',
    name: 'Lomo',
    pricePerKg: 21000,
    methods: ['horno', 'sarten', 'parrilla'],
    description: 'Corte magro y tierno de la parte alta del lomo. Ideal al horno entero, en medallones a la sarten o en la parrilla.',
    hotspot: '300,220 405,215 407,253 302,258',
  },
  {
    slug: 'chuletero',
    name: 'Chuletero',
    pricePerKg: 19500,
    methods: ['parrilla', 'horno'],
    description: 'De aqui salen las chuletas con hueso. Jugoso y con buena grasa, perfecto para la parrilla.',
    hotspot: '405,216 472,226 470,268 407,265',
  },
  {
    slug: 'solomillo',
    name: 'Solomillo',
    pricePerKg: 26000,
    methods: ['sarten', 'horno'],
    description: 'El corte mas tierno del cerdo, pequeno y magro. Se sella rapido a la sarten o va al horno.',
    hotspot: '410,270 468,273 466,306 412,303',
  },
  {
    slug: 'aguja',
    name: 'Aguja',
    pricePerKg: 16500,
    methods: ['guiso', 'horno', 'parrilla'],
    description: 'Cuello y parte alta de la paleta, con grasa entreverada. Excelente para guisos lentos y pernil.',
    hotspot: '202,232 278,222 280,275 205,282',
  },
  {
    slug: 'costillar',
    name: 'Costillar',
    pricePerKg: 18000,
    methods: ['parrilla', 'horno', 'guiso'],
    description: 'Las costillas del cerdo. Ahumadas, a la BBQ o en sancocho: siempre rinden.',
    hotspot: '285,258 402,253 402,315 286,318',
  },
  {
    slug: 'cabeza',
    name: 'Cabeza',
    pricePerKg: 8500,
    methods: ['guiso'],
    description: 'Rica en colageno. Base de caldos, tamales y preparaciones tradicionales.',
    hotspot: '96,262 118,225 158,212 192,242 190,300 152,332 112,320 92,286',
  },
  {
    slug: 'papada',
    name: 'Papada',
    pricePerKg: 12000,
    methods: ['sarten', 'horno'],
    description: 'Corte graso y sabroso. Se usa para chicharron, confitados y para dar sabor a los guisos.',
    hotspot: '108,320 152,330 180,350 158,378 118,372 98,342',
  },
  {
    slug: 'paleta',
    name: 'Paleta',
    pricePerKg: 15000,
    methods: ['guiso', 'horno'],
    description: 'Brazuelo delantero. Carne jugosa para desmechar, pernil pequeno o carne molida.',
    hotspot: '205,285 278,278 280,348 240,352 210,348',
  },
  {
    slug: 'manos',
    name: 'Manos',
    pricePerKg: 9000,
    methods: ['guiso'],
    description: 'Patas delanteras. Imprescindibles para un buen caldo, frijoles y preparaciones con mucho colageno.',
    hotspot: '232,352 292,352 292,392 232,392',
  },
  {
    slug: 'panceta',
    name: 'Panceta',
    pricePerKg: 16000,
    methods: ['sarten', 'horno', 'parrilla'],
    description: 'La barriga: capas de carne y grasa. Tocineta, chicharron carnudo y bacon casero.',
    hotspot: '290,320 402,317 432,352 340,372 294,362',
  },
  {
    slug: 'jamon',
    name: 'Jamon',
    pricePerKg: 15500,
    methods: ['horno', 'guiso', 'parrilla'],
    description: 'La pierna trasera. El pernil por excelencia: al horno entero o en postas para guisar.',
    hotspot: '412,262 445,235 475,228 508,268 508,332 472,370 432,362 412,306',
  },
  {
    slug: 'rabo',
    name: 'Rabo',
    pricePerKg: 10000,
    methods: ['guiso'],
    description: 'Cola del cerdo. Gelatinosa y con mucho sabor para sopas y guisos criollos.',
    hotspot: '492,260 514,255 522,286 500,294',
  },
]
