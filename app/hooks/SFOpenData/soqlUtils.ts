/**
 * Utilities for building SoQL (Socrata Query Language) queries
 * for SF Open Data API
 */

export interface SoQLParams {
  where?: string;
  limit?: number;
  offset?: number;
  order?: string;
  select?: string;
}

/**
 * Builds a URL with SoQL query parameters
 */
export function buildSoQLUrl(baseUrl: string, params: SoQLParams = {}): string {
  const searchParams = new URLSearchParams();

  if (params.where) {
    searchParams.set("$where", params.where);
  }
  if (params.limit !== undefined) {
    searchParams.set("$limit", params.limit.toString());
  }
  if (params.offset !== undefined) {
    searchParams.set("$offset", params.offset.toString());
  }
  if (params.order) {
    searchParams.set("$order", params.order);
  }
  if (params.select) {
    searchParams.set("$select", params.select);
  }

  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Builds a SoQL WHERE clause for ID lookup
 */
export function buildIdFilter(id: string): string {
  return `id='${escapeString(id)}'`;
}

/**
 * Builds a SoQL WHERE clause for multiple IDs (IN clause)
 */
export function buildIdsFilter(ids: string[]): string {
  if (ids.length === 0) return "";
  const escaped = ids.map((id) => `'${escapeString(id)}'`).join(",");
  return `id in (${escaped})`;
}

/**
 * Builds a case-insensitive LIKE filter for text search
 */
export function buildTextSearchFilter(field: string, query: string): string {
  return `lower(${field}) like '%${escapeString(query.toLowerCase())}%'`;
}

/**
 * Builds a simple equality filter
 */
export function buildEqualityFilter(field: string, value: string): string {
  return `${field}='${escapeString(value)}'`;
}

/**
 * Combines multiple WHERE conditions with AND
 */
export function combineFilters(filters: (string | undefined)[]): string {
  return filters.filter(Boolean).join(" AND ");
}

/**
 * Escapes special characters in strings for SoQL
 */
function escapeString(str: string): string {
  return str.replace(/'/g, "''");
}
