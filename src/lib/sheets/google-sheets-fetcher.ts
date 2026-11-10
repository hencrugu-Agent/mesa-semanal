import { Dish, DishCategory } from '@/types/dish';
import { RecipeIngredient, IngredientCategory, UnitType } from '@/types/ingredient';
import { SEED_DISHES } from '@/data/seed/dishes';

// URL predeterminada de Google Sheets
export const DEFAULT_SHEET_ID = '1eMesaSemanal_Platos_Peru_v1';

const KNOWN_UNITS_REGEX = /^(kg|kilos?|kilogramos?|gr?s?|gramos?|mls?|cc|mililitros?|lts?|litros?|unds?|unids?|unidades?|dientes?|atados?|manojos?|latas?|tazas?|cdas?|cucharadas?|cdtas?|cucharaditas?|presas?|tajadas?|rebanadas?|cabezas?)$/i;

/**
 * Convierte texto de números o fracciones ("1/2", "1/4", "3/4", "1.5", "1 1/2") a decimal.
 */
export function parseAmount(amountStr: string): number {
  if (!amountStr) return 1;
  const clean = amountStr.trim().replace(',', '.');

  // Fracción mixta: "1 1/2" -> 1.5
  if (/^\d+\s+\d+\/\d+$/.test(clean)) {
    const [whole, frac] = clean.split(/\s+/);
    const [num, den] = frac.split('/').map(Number);
    return den ? Number(whole) + num / den : Number(whole);
  }

  // Fracción simple: "1/2" -> 0.5, "1/4" -> 0.25, "3/4" -> 0.75
  if (/^\d+\/\d+$/.test(clean)) {
    const [num, den] = clean.split('/').map(Number);
    return den ? Math.round((num / den) * 100) / 100 : 1;
  }

  const num = parseFloat(clean);
  return isNaN(num) ? 1 : num;
}

/**
 * Normaliza cualquier variante de unidad escrita a las unidades estándar de la aplicación.
 */
export function normalizeUnit(rawUnit?: string): UnitType {
  if (!rawUnit) return 'und';
  const u = rawUnit.toLowerCase().replace(/[^a-záéíóú]/g, '').trim();

  if (['g', 'gr', 'grs', 'gramo', 'gramos'].includes(u)) return 'g';
  if (['kg', 'kilo', 'kilos', 'kilogramo', 'kilogramos'].includes(u)) return 'kg';
  if (['ml', 'mls', 'mililitro', 'mililitros', 'cc'].includes(u)) return 'ml';
  if (['l', 'lt', 'lts', 'litro', 'litros'].includes(u)) return 'L';
  if (['und', 'unid', 'unidad', 'unidades', 'u', 'pz', 'pieza', 'piezas', 'presa', 'presas', 'rebanada', 'rebanadas', 'tajada', 'tajadas', 'cabeza', 'cabezas'].includes(u)) return 'und';
  if (['diente', 'dientes'].includes(u)) return 'dientes';
  if (['atado', 'atados', 'manojo', 'ramo'].includes(u)) return 'atado';
  if (['lata', 'latas'].includes(u)) return 'lata';
  if (['taza', 'tazas'].includes(u)) return 'taza';
  if (['cda', 'cdas', 'cucharada', 'cucharadas', 'cdta', 'cdtas', 'cucharadita', 'cucharaditas'].includes(u)) return 'cda';

  return 'und';
}

/**
 * Categoriza automáticamente un ingrediente por su nombre.
 */
export function detectCategory(name: string): IngredientCategory {
  const lower = name.toLowerCase();
  if (/pescado|filete|bonito|perico|trucha|mariscos|choros|langostino/.test(lower)) {
    return 'Pescados y Mariscos';
  }
  if (/pollo|gallina|res|carne|lomo|bistec|cerdo|panceta|chicharron|pavo|molida/.test(lower)) {
    return 'Carnes y Aves';
  }
  if (/papa|camote|cebolla|tomate|aji|rocoto|culantro|espinaca|zanahoria|choclo|arveja|limon|palta|lechuga|kion|apio|poro|yuca/.test(lower)) {
    return 'Verduras';
  }
  if (/manzana|platano|papaya|fresa|fruta|naranja|maracuya|pina|mango|uva/.test(lower)) {
    return 'Frutas';
  }
  if (/huevo|leche|queso|yogur|mantequilla|crema/.test(lower)) {
    return 'Lácteos y Huevos';
  }
  if (/ajo|sillao|vinagre|canela|clavo|oregano|sal|pimienta|comino|miel|algarrobina|panca|laurel/.test(lower)) {
    return 'Especias y Condimentos';
  }
  return 'Víveres';
}

/**
 * Parsea un único ingrediente individual escrito en texto libre.
 */
export function parseSingleIngredient(rawText: string): RecipeIngredient | null {
  // Limpiar viñetas (- , • , * , números tipo 1., 2))
  const clean = rawText
    .replace(/^[-•*]\s*/, '')
    .replace(/^\d+[\.\)]\s*/, '')
    .trim();

  if (!clean) return null;

  // CASO 1: Comienza con número/fracción (ej. "150g pechuga", "1/2 cebolla", "2 huevos", "2 dientes de ajo")
  const startNumMatch = clean.match(/^(\d+(?:\s+\d+\/\d+|\/\d+|\.\d+)?)\s*(.*)$/);
  if (startNumMatch) {
    const rawNum = startNumMatch[1];
    const rest = startNumMatch[2].trim();

    if (rest.length > 0) {
      // Revisar si la primera palabra de 'rest' es una unidad conocida
      const wordMatch = rest.match(/^([a-zA-ZáéíóúÁÉÍÓÚ.]+)\b\s*(.*)$/);
      if (wordMatch) {
        const firstWord = wordMatch[1];
        const afterWord = wordMatch[2];

        if (KNOWN_UNITS_REGEX.test(firstWord)) {
          const unit = normalizeUnit(firstWord);
          const name = afterWord.replace(/^de\s+/i, '').replace(/^[-\s:]+/, '').trim();
          const finalName = name || firstWord;
          return {
            ingredientId: `ing-${Math.random().toString(36).substring(2, 7)}`,
            ingredientName: finalName,
            category: detectCategory(finalName),
            amountForOne: parseAmount(rawNum),
            unit,
          };
        }
      }

      // No es una unidad conocida, por lo que toda la frase es el nombre del insumo (ej. "huevos", "cebolla roja")
      const finalName = rest.replace(/^de\s+/i, '').replace(/^[-\s:]+/, '').trim();
      return {
        ingredientId: `ing-${Math.random().toString(36).substring(2, 7)}`,
        ingredientName: finalName,
        category: detectCategory(finalName),
        amountForOne: parseAmount(rawNum),
        unit: 'und',
      };
    }
  }

  // CASO 2: El número está al final o entre paréntesis (ej. "Pechuga de pollo 150g", "Arroz extra: 75g", "Papa amarilla (150 g)")
  const patternEndAmount = /^(.*?)\s*(?:[-:(]|\s+)\s*(\d+(?:\s+\d+\/\d+|\/\d+|\.\d+)?)\s*([a-zA-ZáéíóúÁÉÍÓÚ.]+)?\s*\)?$/i;
  const matchEnd = clean.match(patternEndAmount);

  if (matchEnd) {
    const rawName = matchEnd[1].trim();
    const rawNum = matchEnd[2];
    const rawUnit = matchEnd[3];

    return {
      ingredientId: `ing-${Math.random().toString(36).substring(2, 7)}`,
      ingredientName: rawName.replace(/^[-\s:]+/, '').trim(),
      category: detectCategory(rawName),
      amountForOne: parseAmount(rawNum),
      unit: normalizeUnit(rawUnit),
    };
  }

  // CASO 3: Insumo en texto libre sin cantidad explícita (ej. "Sal y pimienta al gusto", "Orégano seco")
  return {
    ingredientId: `ing-${Math.random().toString(36).substring(2, 7)}`,
    ingredientName: clean,
    category: detectCategory(clean),
    amountForOne: 1,
    unit: 'und',
  };
}

/**
 * Parsea un bloque de texto libre con múltiples ingredientes separados por:
 * saltos de línea (\n), comas (,), punto y coma (;), o viñetas.
 */
export function parseIngredientsString(rawStr: string): RecipeIngredient[] {
  if (!rawStr) return [];

  // Dividir por saltos de línea, comas y puntos y comas
  const chunks = rawStr
    .split(/[\r\n;,]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const result: RecipeIngredient[] = [];

  for (const chunk of chunks) {
    const item = parseSingleIngredient(chunk);
    if (item && item.ingredientName.length > 0) {
      result.push(item);
    }
  }

  return result;
}

/**
 * Parser RFC 4180 completo para CSV de Google Sheets:
 * Preserva celdas que contienen saltos de línea entre comillas ("...") sin romper las filas.
 */
export function parseCSVToRows(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++; // saltar comilla escapada
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if (char === '\r') {
        if (nextChar === '\n') {
          i++;
        }
        currentRow.push(currentField.trim());
        currentField = '';
        if (currentRow.some((f) => f.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
      } else if (char === '\n') {
        currentRow.push(currentField.trim());
        currentField = '';
        if (currentRow.some((f) => f.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
      } else {
        currentField += char;
      }
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Parsea el CSV completo de Google Sheets a la lista de platos con sus ingredientes.
 */
export function parseGoogleSheetsCSV(csvText: string): Dish[] {
  const rows = parseCSVToRows(csvText);
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.toLowerCase().trim());

  // Búsqueda flexible de columnas
  const nameIdx = headers.findIndex((h) =>
    h.includes('nombre') || h.includes('plato') || h.includes('name') || h.includes('title')
  );
  const catIdx = headers.findIndex((h) =>
    h.includes('categoria') || h.includes('categoría') || h.includes('category') || h.includes('tipo')
  );
  const timeIdx = headers.findIndex((h) =>
    h.includes('tiempo') || h.includes('minutos') || h.includes('time') || h.includes('duracion')
  );
  const priceIdx = headers.findIndex((h) =>
    h.includes('precio') || h.includes('costo') || h.includes('price') || h.includes('soles') || h.includes('s/')
  );
  const imgIdx = headers.findIndex((h) =>
    h.includes('imagen') || h.includes('foto') || h.includes('image') || h.includes('img')
  );
  const descIdx = headers.findIndex((h) =>
    h.includes('descripcion') || h.includes('descripción') || h.includes('description') || h.includes('detalle')
  );
  const ingIdx = headers.findIndex((h) =>
    h.includes('ingrediente') || h.includes('insumo') || h.includes('receta') || h.includes('ingredient')
  );

  const parsedDishes: Dish[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 2) continue;

    const name = row[nameIdx !== -1 ? nameIdx : 0] || `Plato ${i}`;
    if (!name.trim()) continue;

    const category = (row[catIdx !== -1 ? catIdx : 1] || 'Criollo') as DishCategory;
    const prepTime = parseInt(row[timeIdx !== -1 ? timeIdx : 2], 10) || 30;
    const price = parseFloat((row[priceIdx !== -1 ? priceIdx : 3] || '8').replace(',', '.')) || 8.0;
    const imageKey = (row[imgIdx !== -1 ? imgIdx : 4] || 'lentejas').trim().toLowerCase();
    const description = row[descIdx !== -1 ? descIdx : 5] || 'Receta casera tradicional';
    const rawIngs = row[ingIdx !== -1 ? ingIdx : 6] || '';

    const ingredients = parseIngredientsString(rawIngs);

    parsedDishes.push({
      id: `gsheet-dish-${i}-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: name.trim(),
      category: category || 'Criollo',
      moments: ['almuerzo', 'cena'],
      prepTimeMinutes: isNaN(prepTime) ? 30 : prepTime,
      basePortions: 1,
      priceRefPerPlate: isNaN(price) ? 8.0 : price,
      imageSvgKey: imageKey || 'lentejas',
      description: description.trim(),
      ingredients: ingredients.length > 0 ? ingredients : [
        { ingredientId: 'ing-base', ingredientName: 'Ingrediente principal', category: 'Víveres', amountForOne: 100, unit: 'g' },
      ],
    });
  }

  return parsedDishes;
}

/**
 * Convierte cualquier enlace o ID de Google Sheets a la URL directa de exportación CSV
 * e inyecta un parámetro de fecha (_t) para EVITAR el caché antiguo de Google.
 */
export function buildGoogleSheetsExportUrl(inputUrlOrId: string): string {
  const clean = inputUrlOrId.trim();
  const cacheBuster = `_t=${Date.now()}`;

  // Caso 1: Enlace publicado en la web (docs.google.com/spreadsheets/d/e/2PACX-.../pub...)
  if (clean.includes('/spreadsheets/d/e/')) {
    let base = clean.replace(/\/pubhtml.*$/, '/pub').replace(/\/pub\?.*$/, '/pub');
    if (!base.endsWith('/pub')) {
      base = base.replace(/\/+$/, '') + '/pub';
    }
    return `${base}?output=csv&${cacheBuster}`;
  }

  // Extraer gid si existe (ej. #gid=1234 o ?gid=1234)
  const gidMatch = clean.match(/gid=([0-9]+)/);
  const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : '';

  // Caso 2: Enlace estándar de edición (docs.google.com/spreadsheets/d/{ID}/edit...)
  const sheetIdMatch = clean.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (sheetIdMatch && sheetIdMatch[1] !== 'e') {
    const id = sheetIdMatch[1];
    return `https://docs.google.com/spreadsheets/d/${id}/export?format=csv${gidParam}&${cacheBuster}`;
  }

  // Caso 3: Es solo el ID alfanumérico
  if (!clean.startsWith('http')) {
    return `https://docs.google.com/spreadsheets/d/${clean}/export?format=csv&${cacheBuster}`;
  }

  // Caso 4: URL completa ya preparada
  const separator = clean.includes('?') ? '&' : '?';
  return `${clean}${separator}${cacheBuster}`;
}

/**
 * Obtiene los platos directamente desde Google Sheets (vía export CSV en vivo).
 * Siempre fuerza { cache: 'no-store' } y cache-buster para ver los cambios de inmediato.
 */
export async function fetchDishesFromGoogleSheets(customUrlOrId?: string): Promise<{
  dishes: Dish[];
  source: 'google-sheets' | 'seed-local';
}> {
  if (!customUrlOrId || !customUrlOrId.trim()) {
    return { dishes: SEED_DISHES, source: 'seed-local' };
  }

  try {
    const csvUrl = buildGoogleSheetsExportUrl(customUrlOrId);

    const response = await fetch(csvUrl, {
      cache: 'no-store',
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error(`Google Sheets respondió con código ${response.status}`);
    }

    const csvText = await response.text();
    const dishes = parseGoogleSheetsCSV(csvText);

    if (dishes.length > 0) {
      return { dishes, source: 'google-sheets' };
    }
  } catch (err) {
    console.warn('[GoogleSheetsFetcher] Error leyendo hoja en vivo:', err);
  }

  return { dishes: SEED_DISHES, source: 'seed-local' };
}
