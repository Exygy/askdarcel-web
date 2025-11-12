import { useInstantSearch } from "react-instantsearch";
import type { SearchResults, SearchHit } from "../types";

/**
 * Provider-agnostic hook for accessing search results
 * Wraps Algolia's useInstantSearch hook
 *
 * When migrating to Typesense, update this hook's implementation
 * but keep the same return interface
 */
export function useSearchResults<T = SearchHit>() {
  const { results: algoliaResults, status, indexUiState } = useInstantSearch();

  const results: SearchResults<T> | null = algoliaResults
    ? {
        hits: algoliaResults.hits as T[],
        nbHits: algoliaResults.nbHits,
        page: algoliaResults.page,
        nbPages: algoliaResults.nbPages,
        hitsPerPage: algoliaResults.hitsPerPage,
        processingTimeMS: algoliaResults.processingTimeMS,
        query: algoliaResults.query,
        facets: algoliaResults.facets as unknown as
          | Record<string, Record<string, number>>
          | undefined,
      }
    : null;

  return {
    results,
    isSearching: status === "loading" || status === "stalled",
    isIdle: status === "idle",
    isError: status === "error",
    query: indexUiState?.query || "",
  };
}
