import type { ISearchProvider } from "../types";
import { ACTIVE_SEARCH_PROVIDER } from "../constants";
import { getAlgoliaProvider } from "./algolia";
import { getTypesenseProvider } from "./typesense";

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
      return getTypesenseProvider();
    default:
      throw new Error(`Unknown search provider: ${ACTIVE_SEARCH_PROVIDER}`);
  }
}

export * from "./algolia";
export * from "./typesense";
