import { useInstantSearch } from "react-instantsearch";
import type { SearchResults, SearchHit } from "../types";

export function useSearchResults<T = SearchHit>() {
  const { results: searchResults, status, indexUiState } = useInstantSearch();

  const results: SearchResults<T> | null = searchResults
    ? {
        hits: searchResults.hits as T[],
        nbHits: searchResults.nbHits,
        page: searchResults.page,
        nbPages: searchResults.nbPages,
        hitsPerPage: searchResults.hitsPerPage,
        processingTimeMS: searchResults.processingTimeMS,
        query: searchResults.query,
        facets: searchResults.facets as unknown as
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
