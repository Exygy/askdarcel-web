import type { ISearchProvider } from "../types";
import { ACTIVE_SEARCH_PROVIDER } from "../constants";
import { getAlgoliaProvider } from "./algolia";

/**
 * Provider factory
 * Returns the active search provider based on feature flag
 *
 * To switch providers, update ACTIVE_SEARCH_PROVIDER in constants.ts
 */
export function getSearchProvider(): ISearchProvider {
  switch (ACTIVE_SEARCH_PROVIDER) {
    case "algolia":
      return getAlgoliaProvider();
    case "typesense":
      // Will be implemented in Phase 13
      throw new Error("Typesense provider not yet implemented");
    default:
      throw new Error(`Unknown search provider: ${ACTIVE_SEARCH_PROVIDER}`);
  }
}

export * from "./algolia";
