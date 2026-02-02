/**
 * Builds an Algolia-compatible filter string for use with <Configure filters={...}>.
 * The Typesense InstantSearch adapter translates Algolia filter syntax to Typesense's
 * filter_by format, so we must use Algolia syntax here (not Typesense-native syntax).
 */

function escapeFilterValue(value: string): string {
  return value.replace(/'/g, "\\'");
}

interface BuildFilterStringOptions {
  pageFilter?: string;
  eligibilities?: Set<string> | string[];
}

export function buildFilterString({
  pageFilter,
  eligibilities,
}: BuildFilterStringOptions): string {
  const parts: string[] = [];

  if (pageFilter) {
    parts.push(pageFilter);
  }

  const eligibilityValues = eligibilities
    ? Array.from(eligibilities)
    : [];

  if (eligibilityValues.length > 0) {
    // Algolia syntax: each value is a separate facet filter joined with OR
    const facetFilters = eligibilityValues.map(
      (v) => `eligibilities:'${escapeFilterValue(v)}'`
    );
    // Wrap in parens when multiple values so OR binds correctly with AND
    if (facetFilters.length === 1) {
      parts.push(facetFilters[0]);
    } else {
      parts.push(`(${facetFilters.join(" OR ")})`);
    }
  }

  return parts.join(" AND ");
}
