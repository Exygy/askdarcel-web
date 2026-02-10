import type { SearchConfig } from "../types";
import { HITS_PER_PAGE } from "../constants";

/**
 * Provider-agnostic hook for search configuration
 * Returns props to pass to the Configure component
 *
 * This abstracts away Algolia-specific configuration format
 */
export function useSearchConfigure(config: SearchConfig) {
  // Transform provider-agnostic config to Algolia format
  const algoliaConfig: Record<string, unknown> = {
    hitsPerPage: config.hitsPerPage || HITS_PER_PAGE,
  };

  if (config.filters) {
    algoliaConfig.filters = config.filters;
  }

  if (config.insideBoundingBox) {
    algoliaConfig.insideBoundingBox = config.insideBoundingBox;
  }

  if (config.aroundLatLng) {
    algoliaConfig.aroundLatLng = config.aroundLatLng;
  }

  if (config.aroundRadius !== undefined) {
    algoliaConfig.aroundRadius = config.aroundRadius;
  }

  if (config.aroundPrecision) {
    algoliaConfig.aroundPrecision = config.aroundPrecision;
  }

  if (config.minimumAroundRadius) {
    algoliaConfig.minimumAroundRadius = config.minimumAroundRadius;
  }

  return algoliaConfig;
}
