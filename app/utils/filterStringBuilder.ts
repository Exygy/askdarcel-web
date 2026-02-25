/**
 * Builds a Typesense filter_by string for use with <Configure filters={...}>.
 * The Typesense InstantSearch adapter passes `filters` directly through to Typesense
 * without translation, so we must use Typesense's native filter_by syntax here.
 *
 * Typesense uses && for AND and || for OR.
 */

function escapeFilterValue(value: string): string {
  return value.replace(/`/g, "\\`");
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

  const eligibilityValues = eligibilities ? Array.from(eligibilities) : [];

  if (eligibilityValues.length > 0) {
    const facetFilters = eligibilityValues.map(
      (v) => `eligibilities:\`${escapeFilterValue(v)}\``
    );
    if (facetFilters.length === 1) {
      parts.push(facetFilters[0]);
    } else {
      parts.push(`(${facetFilters.join(" || ")})`);
    }
  }

  return parts.join(" && ");
}
