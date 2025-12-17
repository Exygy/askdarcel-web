/**
 * Provider-agnostic search constants
 * These values are independent of the search provider implementation
 */

/**
 * Number of search results to display per page
 */
export const HITS_PER_PAGE = 40;

/**
 * Default search configuration
 */
export const DEFAULT_SEARCH_CONFIG = {
  /** Maximum number of refinement items to display */
  REFINEMENT_LIMIT: 9999,
  /** Default refinement operator */
  REFINEMENT_OPERATOR: "or" as const,
  /** Default geo precision in meters */
  DEFAULT_AROUND_PRECISION: 1600,
  /** Minimum radius for geo search */
  MINIMUM_AROUND_RADIUS: 100,
};

/**
 * Search provider type
 * Add new providers here as they're implemented
 */
export type SearchProviderType = "algolia" | "typesense";

/**
 * Feature flag for search provider selection
 * TODO: Move to environment config when Typesense is ready
 */
export const ACTIVE_SEARCH_PROVIDER: SearchProviderType = "typesense";
