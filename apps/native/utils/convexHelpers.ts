/**
 * Normalize data for Convex storage
 * - Converts Date objects to ISO strings
 * - Removes empty strings and undefined values
 * - Filters empty arrays
 */
export function normalizeForConvex<T extends Record<string, any>>(data: T): Partial<T> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    // Skip undefined or null values
    if (value === undefined || value === null) continue;

    // Convert Date objects to ISO strings
    if (value instanceof Date) {
      result[key] = value.toISOString();
      continue;
    }

    // Handle strings - skip empty ones
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed !== '') {
        result[key] = trimmed;
      }
      continue;
    }

    // Handle arrays - filter out empty values
    if (Array.isArray(value)) {
      const filtered = value.filter((item) => {
        if (item === undefined || item === null) return false;
        if (typeof item === 'string' && item.trim() === '') return false;
        return true;
      });

      if (filtered.length > 0) {
        result[key] = filtered;
      }
      continue;
    }

    // Handle objects recursively
    if (typeof value === 'object' && value !== null) {
      const normalized = normalizeForConvex(value);
      if (Object.keys(normalized).length > 0) {
        result[key] = normalized;
      }
      continue;
    }

    // Keep all other values as-is
    result[key] = value;
  }

  return result as Partial<T>;
}
