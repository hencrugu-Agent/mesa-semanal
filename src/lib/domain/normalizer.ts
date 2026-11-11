/**
 * Normaliza un texto eliminando tildes, signos diacríticos,
 * convirtiendo a minúsculas y colapsando espacios en blanco múltiples.
 */
export function normalizeString(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quita tildes y diacríticos
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Compara dos nombres de ingredientes de forma tolerante a mayúsculas y acentos.
 */
export function areIngredientsEqual(nameA: string, nameB: string): boolean {
  return normalizeString(nameA) === normalizeString(nameB);
}
