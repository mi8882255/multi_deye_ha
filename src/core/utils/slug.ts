/**
 * Convert a sensor name to a URL-safe slug.
 * "Grid Power L1" → "grid_power_l1"
 */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
}
