import { Dish } from '@/types/dish';

export const SEED_DISHES: Dish[] = [
  // 1. Almuerzo Criollo Clásico
  {
    id: 'plato-lentejas',
    name: 'Lentejas con arroz y huevo frito',
    category: 'Criollo',
    moments: ['almuerzo', 'cena'],
    prepTimeMinutes: 35,
    basePortions: 1,
    priceRefPerPlate: 5.2, // S/ 5.20 por plato
    imageSvgKey: 'lentejas',
    description: 'Tradicionales lentejas caseras aderezadas con cebolla, ajo y orégano, servidas con arroz blanco y huevo montado.',
    ingredients: [
      { ingredientId: 'ing-lenteja', ingredientName: 'Lentejas', category: 'Víveres', amountForOne: 100, unit: 'g' },
      { ingredientId: 'ing-arroz', ingredientName: 'Arroz extra', category: 'Víveres', amountForOne: 75, unit: 'g' },
      { ingredientId: 'ing-huevo', ingredientName: 'Huevos de gallina frescos', category: 'Lácteos y Huevos', amountForOne: 1, unit: 'und' },
      { ingredientId: 'ing-cebolla-roja', ingredientName: 'Cebolla roja criolla', category: 'Verduras', amountForOne: 0.25, unit: 'und' },
      { ingredientId: 'ing-ajo', ingredientName: 'Ajo fresco morado', category: 'Especias y Condimentos', amountForOne: 0.5, unit: 'dientes' },
      { ingredientId: 'ing-aceite', ingredientName: 'Aceite vegetal', category: 'Víveres', amountForOne: 10, unit: 'ml' },
    ],
  },

  // 2. Ají de Gallina
  {
    id: 'plato-aji-gallina',
    name: 'Ají de gallina con papa y arroz',
    category: 'Criollo',
    moments: ['almuerzo', 'cena'],
    prepTimeMinutes: 45,
    basePortions: 1,
    priceRefPerPlate: 8.5,
    imageSvgKey: 'aji-gallina',
    description: 'Crema aterciopelada de ají amarillo y pechuga de pollo deshilachada con leche y nueces, sobre papas amarillas y arroz.',
    ingredients: [
      { ingredientId: 'ing-pollo-pechuga', ingredientName: 'Pechuga de pollo fresca', category: 'Carnes y Aves', amountForOne: 150, unit: 'g' },
      { ingredientId: 'ing-pan-molde', ingredientName: 'Pan de molde blanco', category: 'Víveres', amountForOne: 1, unit: 'und' },
      { ingredientId: 'ing-leche-evap', ingredientName: 'Leche evaporada entera', category: 'Lácteos y Huevos', amountForOne: 50, unit: 'ml' },
      { ingredientId: 'ing-aji-amarillo', ingredientName: 'Ají amarillo fresco', category: 'Verduras', amountForOne: 20, unit: 'g' },
      { ingredientId: 'ing-papa-amarilla', ingredientName: 'Papa amarilla', category: 'Verduras', amountForOne: 150, unit: 'g' },
      { ingredientId: 'ing-arroz', ingredientName: 'Arroz extra', category: 'Víveres', amountForOne: 75, unit: 'g' },
      { ingredientId: 'ing-huevo', ingredientName: 'Huevos de gallina frescos', category: 'Lácteos y Huevos', amountForOne: 0.5, unit: 'und' },
    ],
  },

  // 3. Lomo Saltado
  {
    id: 'plato-lomo-saltado',
    name: 'Lomo saltado al wok criollo',
    category: 'Criollo',
    moments: ['almuerzo'],
    prepTimeMinutes: 25,
    basePortions: 1,
    priceRefPerPlate: 12.8,
    imageSvgKey: 'lomo-saltado',
    description: 'Tiras de res salteadas al fuego vivo con cebolla pluma gruesa, tomate, ají amarillo y sillao, con crocantes papas fritas y arroz.',
    ingredients: [
      { ingredientId: 'ing-res-lomo', ingredientName: 'Carne de res (lomo o cadera)', category: 'Carnes y Aves', amountForOne: 150, unit: 'g' },
      { ingredientId: 'ing-cebolla-roja', ingredientName: 'Cebolla roja criolla', category: 'Verduras', amountForOne: 0.5, unit: 'und' },
      { ingredientId: 'ing-tomate', ingredientName: 'Tomate italiano', category: 'Verduras', amountForOne: 0.5, unit: 'und' },
      { ingredientId: 'ing-aji-amarillo', ingredientName: 'Ají amarillo fresco', category: 'Verduras', amountForOne: 15, unit: 'g' },
      { ingredientId: 'ing-papa-blanca', ingredientName: 'Papa blanca / canchán', category: 'Verduras', amountForOne: 200, unit: 'g' },
      { ingredientId: 'ing-sillao', ingredientName: 'Sillao (salsa de soya oscura)', category: 'Especias y Condimentos', amountForOne: 10, unit: 'ml' },
      { ingredientId: 'ing-vinagre', ingredientName: 'Vinagre tinto criollo', category: 'Especias y Condimentos', amountForOne: 8, unit: 'ml' },
      { ingredientId: 'ing-arroz', ingredientName: 'Arroz extra', category: 'Víveres', amountForOne: 75, unit: 'g' },
    ],
  },

  // 4. Arroz con Pollo
  {
    id: 'plato-arroz-con-pollo',
    name: 'Arroz con pollo chiclayano',
    category: 'Criollo',
    moments: ['almuerzo'],
    prepTimeMinutes: 50,
    basePortions: 1,
    priceRefPerPlate: 7.8,
    imageSvgKey: 'arroz-pollo',
    description: 'Arroz graneado perfumado con culantro licuado, chicha o cerveza, alverjitas, choclo y presa tierna de pollo dorado.',
    ingredients: [
      { ingredientId: 'ing-pollo-presa', ingredientName: 'Pollo en presas (pierna/encuentro)', category: 'Carnes y Aves', amountForOne: 1, unit: 'und' },
      { ingredientId: 'ing-arroz', ingredientName: 'Arroz extra', category: 'Víveres', amountForOne: 100, unit: 'g' },
      { ingredientId: 'ing-culantro', ingredientName: 'Culantro fresco licuado / atado', category: 'Verduras', amountForOne: 35, unit: 'g' },
      { ingredientId: 'ing-arveja', ingredientName: 'Arvejas verdes peladas', category: 'Verduras', amountForOne: 25, unit: 'g' },
      { ingredientId: 'ing-zanahoria', ingredientName: 'Zanahoria fresca', category: 'Verduras', amountForOne: 25, unit: 'g' },
      { ingredientId: 'ing-choclo', ingredientName: 'Choclo serrano desgranado', category: 'Verduras', amountForOne: 25, unit: 'g' },
    ],
  },

  // 5. Causa Rellena
  {
    id: 'plato-causa-rellena',
    name: 'Causa limeña de pollo y palta',
    category: 'Entradas',
    moments: ['almuerzo', 'cena'],
    prepTimeMinutes: 30,
    basePortions: 1,
    priceRefPerPlate: 6.9,
    imageSvgKey: 'causa-rellena',
    description: 'Masa suave de papa amarilla sazonada con pasta de ají amarillo y limón sutil, rellena de pechuga deshilachada y palta fuerte.',
    ingredients: [
      { ingredientId: 'ing-papa-amarilla', ingredientName: 'Papa amarilla', category: 'Verduras', amountForOne: 200, unit: 'g' },
      { ingredientId: 'ing-aji-amarillo', ingredientName: 'Ají amarillo fresco', category: 'Verduras', amountForOne: 15, unit: 'g' },
      { ingredientId: 'ing-limon', ingredientName: 'Limón sutil norteño', category: 'Verduras', amountForOne: 1, unit: 'und' },
      { ingredientId: 'ing-pollo-pechuga', ingredientName: 'Pechuga de pollo fresca', category: 'Carnes y Aves', amountForOne: 80, unit: 'g' },
      { ingredientId: 'ing-palta', ingredientName: 'Palta fuerte / hass', category: 'Verduras', amountForOne: 0.25, unit: 'und' },
    ],
  },

  // 6. Seco de Res
  {
    id: 'plato-seco-res',
    name: 'Seco de res norteño con frejoles',
    category: 'Criollo',
    moments: ['almuerzo'],
    prepTimeMinutes: 55,
    basePortions: 1,
    priceRefPerPlate: 9.8,
    imageSvgKey: 'seco-res',
    description: 'Guiso tierno de res cocido a fuego lento en culantro y ají amarillo, servido con cremosos frejoles canario y arroz blanco.',
    ingredients: [
      { ingredientId: 'ing-res-lomo', ingredientName: 'Carne de res (lomo o cadera)', category: 'Carnes y Aves', amountForOne: 150, unit: 'g' },
      { ingredientId: 'ing-frejol', ingredientName: 'Frejol canario', category: 'Víveres', amountForOne: 100, unit: 'g' },
      { ingredientId: 'ing-culantro', ingredientName: 'Culantro fresco licuado / atado', category: 'Verduras', amountForOne: 30, unit: 'g' },
      { ingredientId: 'ing-cebolla-roja', ingredientName: 'Cebolla roja criolla', category: 'Verduras', amountForOne: 0.5, unit: 'und' },
      { ingredientId: 'ing-arroz', ingredientName: 'Arroz extra', category: 'Víveres', amountForOne: 75, unit: 'g' },
    ],
  },

  // 7. Caldo de Gallina
  {
    id: 'plato-caldo-gallina',
    name: 'Caldo de gallina levantamuertos',
    category: 'Sopas',
    moments: ['desayuno', 'cena'],
    prepTimeMinutes: 50,
    basePortions: 1,
    priceRefPerPlate: 8.2,
    imageSvgKey: 'caldo-gallina',
    description: 'Sopa reconstituyente de concentrado de gallina con fideos largos, papa amarilla, huevo duro, kion aromático y limón.',
    ingredients: [
      { ingredientId: 'ing-gallina', ingredientName: 'Gallina para caldo', category: 'Carnes y Aves', amountForOne: 200, unit: 'g' },
      { ingredientId: 'ing-fideos-tallarin', ingredientName: 'Fideos espagueti', category: 'Víveres', amountForOne: 60, unit: 'g' },
      { ingredientId: 'ing-papa-amarilla', ingredientName: 'Papa amarilla', category: 'Verduras', amountForOne: 1, unit: 'und' },
      { ingredientId: 'ing-huevo', ingredientName: 'Huevos de gallina frescos', category: 'Lácteos y Huevos', amountForOne: 1, unit: 'und' },
      { ingredientId: 'ing-kion', ingredientName: 'Kion (jengibre) fresco pelado', category: 'Especias y Condimentos', amountForOne: 5, unit: 'g' },
      { ingredientId: 'ing-limon', ingredientName: 'Limón sutil norteño', category: 'Verduras', amountForOne: 0.5, unit: 'und' },
    ],
  },

  // 8. Desayuno Quinua Carretillera
  {
    id: 'plato-quinua-desayuno',
    name: 'Quinua carretillera con pan y palta',
    category: 'Desayunos',
    moments: ['desayuno'],
    prepTimeMinutes: 20,
    basePortions: 1,
    priceRefPerPlate: 4.0,
    imageSvgKey: 'quinua-desayuno',
    description: 'Bebida caliente de quinua con manzana cocida, canela y clavo de olor, acompañada de pan francés con abundante palta.',
    ingredients: [
      { ingredientId: 'ing-quinua', ingredientName: 'Quinua perlada', category: 'Víveres', amountForOne: 35, unit: 'g' },
      { ingredientId: 'ing-manzana', ingredientName: 'Manzana de agua o delicia', category: 'Frutas', amountForOne: 0.5, unit: 'und' },
      { ingredientId: 'ing-canela-clavo', ingredientName: 'Canela entera y clavo de olor', category: 'Especias y Condimentos', amountForOne: 2, unit: 'g' },
      { ingredientId: 'ing-pan-frances', ingredientName: 'Pan francés / piso', category: 'Víveres', amountForOne: 1, unit: 'und' },
      { ingredientId: 'ing-palta', ingredientName: 'Palta fuerte / hass', category: 'Verduras', amountForOne: 0.25, unit: 'und' },
    ],
  },

  // 9. Desayuno Avena con Queso
  {
    id: 'plato-avena-desayuno',
    name: 'Avena con manzana y pan con queso andino',
    category: 'Desayunos',
    moments: ['desayuno'],
    prepTimeMinutes: 15,
    basePortions: 1,
    priceRefPerPlate: 3.8,
    imageSvgKey: 'avena-desayuno',
    description: 'Avena espesa cocida con trozos de manzana, leche evaporada y canela, servida con pan crujiente y tajada de queso andino.',
    ingredients: [
      { ingredientId: 'ing-avena', ingredientName: 'Avena en hojuelas', category: 'Víveres', amountForOne: 30, unit: 'g' },
      { ingredientId: 'ing-leche-evap', ingredientName: 'Leche evaporada entera', category: 'Lácteos y Huevos', amountForOne: 50, unit: 'ml' },
      { ingredientId: 'ing-manzana', ingredientName: 'Manzana de agua o delicia', category: 'Frutas', amountForOne: 0.25, unit: 'und' },
      { ingredientId: 'ing-pan-frances', ingredientName: 'Pan francés / piso', category: 'Víveres', amountForOne: 1, unit: 'und' },
      { ingredientId: 'ing-queso-andino', ingredientName: 'Queso andino / paria artesanal', category: 'Lácteos y Huevos', amountForOne: 50, unit: 'g' },
    ],
  },

  // 10. Desayuno Criollo Pan con Chicharrón
  {
    id: 'plato-pan-chicharron',
    name: 'Pan con chicharrón y salsa criolla',
    category: 'Desayunos',
    moments: ['desayuno'],
    prepTimeMinutes: 30,
    basePortions: 1,
    priceRefPerPlate: 7.5,
    imageSvgKey: 'pan-chicharron',
    description: 'Panceta de cerdo frita en su propia manteca hasta quedar dorada y jugosa, con camote frito y sarza criolla de cebolla y ají limo.',
    ingredients: [
      { ingredientId: 'ing-cerdo-panceta', ingredientName: 'Panceta de cerdo', category: 'Carnes y Aves', amountForOne: 150, unit: 'g' },
      { ingredientId: 'ing-camote', ingredientName: 'Camote amarillo', category: 'Verduras', amountForOne: 100, unit: 'g' },
      { ingredientId: 'ing-pan-frances', ingredientName: 'Pan francés / piso', category: 'Víveres', amountForOne: 1, unit: 'und' },
      { ingredientId: 'ing-cebolla-roja', ingredientName: 'Cebolla roja criolla', category: 'Verduras', amountForOne: 0.25, unit: 'und' },
      { ingredientId: 'ing-limon', ingredientName: 'Limón sutil norteño', category: 'Verduras', amountForOne: 0.5, unit: 'und' },
    ],
  },

  // 11. Media Mañana Frutas Frescas
  {
    id: 'plato-ensalada-frutas',
    name: 'Ensalada de frutas con yogur y algarrobina',
    category: 'Snacks y Postres',
    moments: ['media_manana', 'media_tarde'],
    prepTimeMinutes: 10,
    basePortions: 1,
    priceRefPerPlate: 4.2,
    imageSvgKey: 'ensalada-frutas',
    description: 'Bowl fresco de papaya en cubos, plátano de seda y fresas, bañado con yogur natural probiótico y un toque de algarrobina.',
    ingredients: [
      { ingredientId: 'ing-papaya', ingredientName: 'Papaya arequipeña dulce', category: 'Frutas', amountForOne: 100, unit: 'g' },
      { ingredientId: 'ing-platano', ingredientName: 'Plátano de la isla / seda', category: 'Frutas', amountForOne: 0.5, unit: 'und' },
      { ingredientId: 'ing-fresas', ingredientName: 'Fresas frescas de huerto', category: 'Frutas', amountForOne: 50, unit: 'g' },
      { ingredientId: 'ing-yogur', ingredientName: 'Yogur natural probiótico', category: 'Lácteos y Huevos', amountForOne: 50, unit: 'ml' },
      { ingredientId: 'ing-miel-algarrobina', ingredientName: 'Algarrobina o miel pura', category: 'Especias y Condimentos', amountForOne: 10, unit: 'ml' },
    ],
  },

  // 12. Media Tarde Mazamorra y Arroz con Leche
  {
    id: 'plato-clasico-combinado',
    name: 'Clásico combinado limeño',
    category: 'Snacks y Postres',
    moments: ['media_tarde'],
    prepTimeMinutes: 35,
    basePortions: 1,
    priceRefPerPlate: 3.8,
    imageSvgKey: 'clasico-combinado',
    description: 'El tradicional dúo limeño de mazamorra morada con frutas y canela junto al cremoso arroz con leche perfumado.',
    ingredients: [
      { ingredientId: 'ing-maiz-morado', ingredientName: 'Maíz morado', category: 'Víveres', amountForOne: 75, unit: 'g' },
      { ingredientId: 'ing-arroz', ingredientName: 'Arroz extra', category: 'Víveres', amountForOne: 35, unit: 'g' },
      { ingredientId: 'ing-leche-evap', ingredientName: 'Leche evaporada entera', category: 'Lácteos y Huevos', amountForOne: 40, unit: 'ml' },
      { ingredientId: 'ing-canela-clavo', ingredientName: 'Canela entera y clavo de olor', category: 'Especias y Condimentos', amountForOne: 2, unit: 'g' },
    ],
  },

  // 13. Sopa Criolla de Carne
  {
    id: 'plato-sopa-criolla',
    name: 'Sopa criolla tradicional con carne',
    category: 'Sopas',
    moments: ['cena'],
    prepTimeMinutes: 25,
    basePortions: 1,
    priceRefPerPlate: 5.8,
    imageSvgKey: 'sopa-criolla',
    description: 'Sopa cálida de carne molida, aderezo de ají panca, fideos cabello de ángel, toque de leche y huevo escalfado con orégano.',
    ingredients: [
      { ingredientId: 'ing-res-molida', ingredientName: 'Carne molida de res', category: 'Carnes y Aves', amountForOne: 80, unit: 'g' },
      { ingredientId: 'ing-fideos-sopa', ingredientName: 'Fideos cabello de ángel', category: 'Víveres', amountForOne: 40, unit: 'g' },
      { ingredientId: 'ing-cebolla-roja', ingredientName: 'Cebolla roja criolla', category: 'Verduras', amountForOne: 0.25, unit: 'und' },
      { ingredientId: 'ing-tomate', ingredientName: 'Tomate italiano', category: 'Verduras', amountForOne: 0.25, unit: 'und' },
      { ingredientId: 'ing-leche-evap', ingredientName: 'Leche evaporada entera', category: 'Lácteos y Huevos', amountForOne: 25, unit: 'ml' },
      { ingredientId: 'ing-huevo', ingredientName: 'Huevos de gallina frescos', category: 'Lácteos y Huevos', amountForOne: 1, unit: 'und' },
    ],
  },

  // 14. Tortilla de Verduras Ligera
  {
    id: 'plato-tortilla-verduras',
    name: 'Tortilla casera de verduras y choclo',
    category: 'Cenas Ligeras',
    moments: ['cena', 'desayuno'],
    prepTimeMinutes: 15,
    basePortions: 1,
    priceRefPerPlate: 4.2,
    imageSvgKey: 'tortilla-verduras',
    description: 'Tortilla esponjosa de huevos frescos con espinaca salteada, zanahoria rallada dulce y granos tiernos de choclo.',
    ingredients: [
      { ingredientId: 'ing-huevo', ingredientName: 'Huevos de gallina frescos', category: 'Lácteos y Huevos', amountForOne: 2, unit: 'und' },
      { ingredientId: 'ing-espinaca', ingredientName: 'Espinaca fresca deshojada', category: 'Verduras', amountForOne: 40, unit: 'g' },
      { ingredientId: 'ing-zanahoria', ingredientName: 'Zanahoria fresca', category: 'Verduras', amountForOne: 30, unit: 'g' },
      { ingredientId: 'ing-choclo', ingredientName: 'Choclo serrano desgranado', category: 'Verduras', amountForOne: 25, unit: 'g' },
      { ingredientId: 'ing-aceite', ingredientName: 'Aceite vegetal', category: 'Víveres', amountForOne: 5, unit: 'ml' },
    ],
  },

  // 15. Pescado a la Plancha
  {
    id: 'plato-pescado-plancha',
    name: 'Pescado a la plancha con puré y ensalada',
    category: 'Marino',
    moments: ['almuerzo', 'cena'],
    prepTimeMinutes: 30,
    basePortions: 1,
    priceRefPerPlate: 8.9,
    imageSvgKey: 'pescado-plancha',
    description: 'Filete de pescado sazonado a la plancha con limón, puré casero de papa con mantequilla y ensalada fresca de lechuga y tomate.',
    ingredients: [
      { ingredientId: 'ing-pescado-filete', ingredientName: 'Filete de pescado fresco (bonito/perico)', category: 'Pescados y Mariscos', amountForOne: 150, unit: 'g' },
      { ingredientId: 'ing-papa-blanca', ingredientName: 'Papa blanca / canchán', category: 'Verduras', amountForOne: 180, unit: 'g' },
      { ingredientId: 'ing-mantequilla', ingredientName: 'Mantequilla con sal', category: 'Lácteos y Huevos', amountForOne: 10, unit: 'g' },
      { ingredientId: 'ing-leche-evap', ingredientName: 'Leche evaporada entera', category: 'Lácteos y Huevos', amountForOne: 25, unit: 'ml' },
      { ingredientId: 'ing-lechuga', ingredientName: 'Lechuga seda / americana', category: 'Verduras', amountForOne: 0.25, unit: 'und' },
      { ingredientId: 'ing-tomate', ingredientName: 'Tomate italiano', category: 'Verduras', amountForOne: 0.5, unit: 'und' },
      { ingredientId: 'ing-limon', ingredientName: 'Limón sutil norteño', category: 'Verduras', amountForOne: 0.5, unit: 'und' },
    ],
  },
];
