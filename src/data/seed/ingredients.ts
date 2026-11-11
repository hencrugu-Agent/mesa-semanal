import { Ingredient } from '@/types/ingredient';

export const SEED_INGREDIENTS: Ingredient[] = [
  // Víveres y Granos
  {
    id: 'ing-arroz',
    name: 'Arroz extra',
    normalizedName: 'arroz extra',
    category: 'Víveres',
    baseUnit: 'g',
    commercialPackage: { name: 'Bolsa 1 kg', unit: 'kg', quantityInBaseUnit: 1000 },
    priceRefPerBaseUnit: 0.0048, // S/ 4.80 por kg
    notes: 'Arroz añejo de grano largo',
  },
  {
    id: 'ing-lenteja',
    name: 'Lentejas',
    normalizedName: 'lentejas',
    category: 'Víveres',
    baseUnit: 'g',
    commercialPackage: { name: 'Bolsa 500g', unit: 'g', quantityInBaseUnit: 500 },
    priceRefPerBaseUnit: 0.007, // S/ 3.50 bolsa 500g
    notes: 'Lenteja pardina o bebé',
  },
  {
    id: 'ing-frejol',
    name: 'Frejol canario',
    normalizedName: 'frejol canario',
    category: 'Víveres',
    baseUnit: 'g',
    commercialPackage: { name: 'Bolsa 500g', unit: 'g', quantityInBaseUnit: 500 },
    priceRefPerBaseUnit: 0.008, // S/ 8.00 por kg
  },
  {
    id: 'ing-fideos-sopa',
    name: 'Fideos cabello de ángel',
    normalizedName: 'fideos cabello de angel',
    category: 'Víveres',
    baseUnit: 'g',
    commercialPackage: { name: 'Paquete 250g', unit: 'g', quantityInBaseUnit: 250 },
    priceRefPerBaseUnit: 0.008, // S/ 2.00 por paquete 250g
  },
  {
    id: 'ing-fideos-tallarin',
    name: 'Fideos espagueti',
    normalizedName: 'fideos espagueti',
    category: 'Víveres',
    baseUnit: 'g',
    commercialPackage: { name: 'Paquete 500g', unit: 'g', quantityInBaseUnit: 500 },
    priceRefPerBaseUnit: 0.006, // S/ 3.00 por paquete
  },
  {
    id: 'ing-aceite',
    name: 'Aceite vegetal',
    normalizedName: 'aceite vegetal',
    category: 'Víveres',
    baseUnit: 'ml',
    commercialPackage: { name: 'Botella 1 L', unit: 'L', quantityInBaseUnit: 1000 },
    priceRefPerBaseUnit: 0.0085, // S/ 8.50 por litro
  },
  {
    id: 'ing-quinua',
    name: 'Quinua perlada',
    normalizedName: 'quinua perlada',
    category: 'Víveres',
    baseUnit: 'g',
    commercialPackage: { name: 'Bolsa 500g', unit: 'g', quantityInBaseUnit: 500 },
    priceRefPerBaseUnit: 0.012, // S/ 6.00 por 500g
  },
  {
    id: 'ing-avena',
    name: 'Avena en hojuelas',
    normalizedName: 'avena en hojuelas',
    category: 'Víveres',
    baseUnit: 'g',
    commercialPackage: { name: 'Bolsa 300g', unit: 'g', quantityInBaseUnit: 300 },
    priceRefPerBaseUnit: 0.009, // S/ 2.70 por 300g
  },
  {
    id: 'ing-pan-frances',
    name: 'Pan francés / piso',
    normalizedName: 'pan frances',
    category: 'Víveres',
    baseUnit: 'und',
    commercialPackage: { name: 'Bolsa 10 unds', unit: 'und', quantityInBaseUnit: 10 },
    priceRefPerBaseUnit: 0.35, // S/ 0.35 por pan
  },
  {
    id: 'ing-pan-molde',
    name: 'Pan de molde blanco',
    normalizedName: 'pan de molde',
    category: 'Víveres',
    baseUnit: 'und',
    commercialPackage: { name: 'Bolsa molde 20 tajadas', unit: 'und', quantityInBaseUnit: 20 },
    priceRefPerBaseUnit: 0.35,
  },
  {
    id: 'ing-maiz-morado',
    name: 'Maíz morado',
    normalizedName: 'maiz morado',
    category: 'Víveres',
    baseUnit: 'g',
    commercialPackage: { name: 'Kilo desgranado/mazorca', unit: 'kg', quantityInBaseUnit: 1000 },
    priceRefPerBaseUnit: 0.005, // S/ 5.00 por kilo
  },

  // Carnes y Aves
  {
    id: 'ing-pollo-pechuga',
    name: 'Pechuga de pollo fresca',
    normalizedName: 'pechuga de pollo',
    category: 'Carnes y Aves',
    baseUnit: 'g',
    commercialPackage: { name: 'Kilo pechuga entera/filete', unit: 'kg', quantityInBaseUnit: 1000 },
    priceRefPerBaseUnit: 0.017, // S/ 17.00 por kg
  },
  {
    id: 'ing-pollo-presa',
    name: 'Pollo en presas (pierna/encuentro)',
    normalizedName: 'pollo en presas',
    category: 'Carnes y Aves',
    baseUnit: 'und',
    commercialPackage: { name: 'Presa individual fresca', unit: 'und', quantityInBaseUnit: 1 },
    priceRefPerBaseUnit: 3.5, // S/ 3.50 por presa
  },
  {
    id: 'ing-gallina',
    name: 'Gallina para caldo',
    normalizedName: 'gallina para caldo',
    category: 'Carnes y Aves',
    baseUnit: 'g',
    commercialPackage: { name: 'Kilo trozado', unit: 'kg', quantityInBaseUnit: 1000 },
    priceRefPerBaseUnit: 0.019, // S/ 19.00 por kg
  },
  {
    id: 'ing-res-lomo',
    name: 'Carne de res (lomo o cadera)',
    normalizedName: 'carne de res lomo',
    category: 'Carnes y Aves',
    baseUnit: 'g',
    commercialPackage: { name: 'Kilo en bistec / cubos', unit: 'kg', quantityInBaseUnit: 1000 },
    priceRefPerBaseUnit: 0.034, // S/ 34.00 por kg
  },
  {
    id: 'ing-res-molida',
    name: 'Carne molida de res',
    normalizedName: 'carne molida de res',
    category: 'Carnes y Aves',
    baseUnit: 'g',
    commercialPackage: { name: 'Bandeja 500g', unit: 'g', quantityInBaseUnit: 500 },
    priceRefPerBaseUnit: 0.022, // S/ 11.00 por 500g
  },
  {
    id: 'ing-cerdo-panceta',
    name: 'Panceta de cerdo',
    normalizedName: 'panceta de cerdo',
    category: 'Carnes y Aves',
    baseUnit: 'g',
    commercialPackage: { name: 'Kilo panceta', unit: 'kg', quantityInBaseUnit: 1000 },
    priceRefPerBaseUnit: 0.024, // S/ 24.00 por kg
  },

  // Pescados y Mariscos
  {
    id: 'ing-pescado-filete',
    name: 'Filete de pescado fresco (bonito/perico)',
    normalizedName: 'filete de pescado',
    category: 'Pescados y Mariscos',
    baseUnit: 'g',
    commercialPackage: { name: 'Kilo de filete limpio', unit: 'kg', quantityInBaseUnit: 1000 },
    priceRefPerBaseUnit: 0.02, // S/ 20.00 por kg
  },

  // Verduras y Tubérculos
  {
    id: 'ing-papa-amarilla',
    name: 'Papa amarilla',
    normalizedName: 'papa amarilla',
    category: 'Verduras',
    baseUnit: 'g',
    commercialPackage: { name: 'Kilo de papa amarilla', unit: 'kg', quantityInBaseUnit: 1000 },
    priceRefPerBaseUnit: 0.0055, // S/ 5.50 por kg
  },
  {
    id: 'ing-papa-blanca',
    name: 'Papa blanca / canchán',
    normalizedName: 'papa blanca',
    category: 'Verduras',
    baseUnit: 'g',
    commercialPackage: { name: 'Kilo de papa canchan', unit: 'kg', quantityInBaseUnit: 1000 },
    priceRefPerBaseUnit: 0.0035, // S/ 3.50 por kg
  },
  {
    id: 'ing-camote',
    name: 'Camote amarillo',
    normalizedName: 'camote amarillo',
    category: 'Verduras',
    baseUnit: 'g',
    commercialPackage: { name: 'Kilo de camote', unit: 'kg', quantityInBaseUnit: 1000 },
    priceRefPerBaseUnit: 0.0035,
  },
  {
    id: 'ing-cebolla-roja',
    name: 'Cebolla roja criolla',
    normalizedName: 'cebolla roja',
    category: 'Verduras',
    baseUnit: 'und',
    commercialPackage: { name: 'Kilo de cebolla (aprox 5 und)', unit: 'kg', quantityInBaseUnit: 5 },
    priceRefPerBaseUnit: 0.8, // S/ 0.80 por unidad (aprox S/ 4.00 kg)
  },
  {
    id: 'ing-tomate',
    name: 'Tomate italiano',
    normalizedName: 'tomate italiano',
    category: 'Verduras',
    baseUnit: 'und',
    commercialPackage: { name: 'Kilo de tomate (aprox 6 und)', unit: 'kg', quantityInBaseUnit: 6 },
    priceRefPerBaseUnit: 0.7, // S/ 0.70 por tomate
  },
  {
    id: 'ing-aji-amarillo',
    name: 'Ají amarillo fresco',
    normalizedName: 'aji amarillo',
    category: 'Verduras',
    baseUnit: 'g',
    commercialPackage: { name: 'Cuarto de kilo (250g)', unit: 'g', quantityInBaseUnit: 250 },
    priceRefPerBaseUnit: 0.008, // S/ 8.00 por kg
  },
  {
    id: 'ing-culantro',
    name: 'Culantro fresco licuado / atado',
    normalizedName: 'culantro fresco',
    category: 'Verduras',
    baseUnit: 'g',
    commercialPackage: { name: '1 Atado grande', unit: 'atado', quantityInBaseUnit: 100 },
    priceRefPerBaseUnit: 0.015, // S/ 1.50 por atado de 100g
  },
  {
    id: 'ing-espinaca',
    name: 'Espinaca fresca deshojada',
    normalizedName: 'espinaca fresca',
    category: 'Verduras',
    baseUnit: 'g',
    commercialPackage: { name: 'Atado de espinaca 250g', unit: 'atado', quantityInBaseUnit: 250 },
    priceRefPerBaseUnit: 0.008, // S/ 2.00 por atado
  },
  {
    id: 'ing-zanahoria',
    name: 'Zanahoria fresca',
    normalizedName: 'zanahoria',
    category: 'Verduras',
    baseUnit: 'g',
    commercialPackage: { name: 'Kilo zanahoria', unit: 'kg', quantityInBaseUnit: 1000 },
    priceRefPerBaseUnit: 0.003, // S/ 3.00 por kg
  },
  {
    id: 'ing-choclo',
    name: 'Choclo serrano desgranado',
    normalizedName: 'choclo serrano',
    category: 'Verduras',
    baseUnit: 'g',
    commercialPackage: { name: 'Choclo entero o bolsa 500g', unit: 'g', quantityInBaseUnit: 500 },
    priceRefPerBaseUnit: 0.006, // S/ 3.00 por bolsa
  },
  {
    id: 'ing-arveja',
    name: 'Arvejas verdes peladas',
    normalizedName: 'arvejas verdes',
    category: 'Verduras',
    baseUnit: 'g',
    commercialPackage: { name: 'Bolsa 250g pelada', unit: 'g', quantityInBaseUnit: 250 },
    priceRefPerBaseUnit: 0.012, // S/ 3.00 bolsa
  },
  {
    id: 'ing-limon',
    name: 'Limón sutil norteño',
    normalizedName: 'limon sutil',
    category: 'Verduras',
    baseUnit: 'und',
    commercialPackage: { name: 'Kilo de limón (aprox 20 und)', unit: 'kg', quantityInBaseUnit: 20 },
    priceRefPerBaseUnit: 0.35, // S/ 0.35 por limón
  },
  {
    id: 'ing-palta',
    name: 'Palta fuerte / hass',
    normalizedName: 'palta fuerte',
    category: 'Verduras',
    baseUnit: 'und',
    commercialPackage: { name: 'Palta individual grande', unit: 'und', quantityInBaseUnit: 1 },
    priceRefPerBaseUnit: 3.5, // S/ 3.50 por palta
  },
  {
    id: 'ing-lechuga',
    name: 'Lechuga seda / americana',
    normalizedName: 'lechuga',
    category: 'Verduras',
    baseUnit: 'und',
    commercialPackage: { name: '1 Cabeza de lechuga', unit: 'und', quantityInBaseUnit: 1 },
    priceRefPerBaseUnit: 2.0, // S/ 2.00 por cabeza
  },

  // Frutas
  {
    id: 'ing-manzana',
    name: 'Manzana de agua o delicia',
    normalizedName: 'manzana',
    category: 'Frutas',
    baseUnit: 'und',
    commercialPackage: { name: 'Kilo de manzana (aprox 5 und)', unit: 'kg', quantityInBaseUnit: 5 },
    priceRefPerBaseUnit: 0.8, // S/ 0.80 por manzana
  },
  {
    id: 'ing-platano',
    name: 'Plátano de la isla / seda',
    normalizedName: 'platano de seda',
    category: 'Frutas',
    baseUnit: 'und',
    commercialPackage: { name: 'Mano de plátanos (5 und)', unit: 'und', quantityInBaseUnit: 5 },
    priceRefPerBaseUnit: 0.6, // S/ 0.60 por plátano
  },
  {
    id: 'ing-papaya',
    name: 'Papaya arequipeña dulce',
    normalizedName: 'papaya',
    category: 'Frutas',
    baseUnit: 'g',
    commercialPackage: { name: 'Papaya entera (aprox 1.5 kg)', unit: 'kg', quantityInBaseUnit: 1500 },
    priceRefPerBaseUnit: 0.0035, // S/ 3.50 por kg
  },
  {
    id: 'ing-fresas',
    name: 'Fresas frescas de huerto',
    normalizedName: 'fresas frescas',
    category: 'Frutas',
    baseUnit: 'g',
    commercialPackage: { name: 'Caja o bolsa 500g', unit: 'g', quantityInBaseUnit: 500 },
    priceRefPerBaseUnit: 0.012, // S/ 6.00 por 500g
  },

  // Lácteos y Huevos
  {
    id: 'ing-huevo',
    name: 'Huevos de gallina frescos',
    normalizedName: 'huevos de gallina',
    category: 'Lácteos y Huevos',
    baseUnit: 'und',
    commercialPackage: { name: 'Jaba de 15 huevos', unit: 'und', quantityInBaseUnit: 15 },
    priceRefPerBaseUnit: 0.65, // S/ 0.65 por huevo
  },
  {
    id: 'ing-leche-evap',
    name: 'Leche evaporada entera',
    normalizedName: 'leche evaporada',
    category: 'Lácteos y Huevos',
    baseUnit: 'ml',
    commercialPackage: { name: 'Lata 400g / 410ml', unit: 'lata', quantityInBaseUnit: 410 },
    priceRefPerBaseUnit: 0.011, // S/ 4.50 por lata
  },
  {
    id: 'ing-queso-andino',
    name: 'Queso andino / paria artesanal',
    normalizedName: 'queso andino',
    category: 'Lácteos y Huevos',
    baseUnit: 'g',
    commercialPackage: { name: 'Trozo 250g', unit: 'g', quantityInBaseUnit: 250 },
    priceRefPerBaseUnit: 0.032, // S/ 8.00 por 250g
  },
  {
    id: 'ing-yogur',
    name: 'Yogur natural probiótico',
    normalizedName: 'yogur natural',
    category: 'Lácteos y Huevos',
    baseUnit: 'ml',
    commercialPackage: { name: 'Botella 1 L', unit: 'L', quantityInBaseUnit: 1000 },
    priceRefPerBaseUnit: 0.0075, // S/ 7.50 por litro
  },
  {
    id: 'ing-mantequilla',
    name: 'Mantequilla con sal',
    normalizedName: 'mantequilla con sal',
    category: 'Lácteos y Huevos',
    baseUnit: 'g',
    commercialPackage: { name: 'Barra 200g', unit: 'g', quantityInBaseUnit: 200 },
    priceRefPerBaseUnit: 0.038, // S/ 7.60 barra 200g
  },

  // Especias y Condimentos
  {
    id: 'ing-ajo',
    name: 'Ajo fresco morado',
    normalizedName: 'ajo fresco',
    category: 'Especias y Condimentos',
    baseUnit: 'dientes',
    commercialPackage: { name: 'Cabeza de ajo (aprox 10 dientes)', unit: 'und', quantityInBaseUnit: 10 },
    priceRefPerBaseUnit: 0.2, // S/ 0.20 por diente
  },
  {
    id: 'ing-sillao',
    name: 'Sillao (salsa de soya oscura)',
    normalizedName: 'sillao salsa de soya',
    category: 'Especias y Condimentos',
    baseUnit: 'ml',
    commercialPackage: { name: 'Botella 500ml', unit: 'ml', quantityInBaseUnit: 500 },
    priceRefPerBaseUnit: 0.009, // S/ 4.50 botella
  },
  {
    id: 'ing-vinagre',
    name: 'Vinagre tinto criollo',
    normalizedName: 'vinagre tinto',
    category: 'Especias y Condimentos',
    baseUnit: 'ml',
    commercialPackage: { name: 'Botella 500ml', unit: 'ml', quantityInBaseUnit: 500 },
    priceRefPerBaseUnit: 0.006, // S/ 3.00 botella
  },
  {
    id: 'ing-kion',
    name: 'Kion (jengibre) fresco pelado',
    normalizedName: 'kion jengibre',
    category: 'Especias y Condimentos',
    baseUnit: 'g',
    commercialPackage: { name: 'Porción 100g', unit: 'g', quantityInBaseUnit: 100 },
    priceRefPerBaseUnit: 0.012,
  },
  {
    id: 'ing-canela-clavo',
    name: 'Canela entera y clavo de olor',
    normalizedName: 'canela y clavo',
    category: 'Especias y Condimentos',
    baseUnit: 'g',
    commercialPackage: { name: 'Sobre mixto 20g', unit: 'g', quantityInBaseUnit: 20 },
    priceRefPerBaseUnit: 0.075, // S/ 1.50 sobre
  },
  {
    id: 'ing-miel-algarrobina',
    name: 'Algarrobina o miel pura',
    normalizedName: 'algarrobina miel',
    category: 'Especias y Condimentos',
    baseUnit: 'ml',
    commercialPackage: { name: 'Frasco 250ml', unit: 'ml', quantityInBaseUnit: 250 },
    priceRefPerBaseUnit: 0.04, // S/ 10.00 frasco
  },
];
