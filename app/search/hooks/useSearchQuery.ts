import { useSearchBox as useAlgoliaSearchBox } from "react-instantsearch";

/**
 * Provider-agnostic hook for search query input
 * Wraps Algolia's useSearchBox hook
 */
export function useSearchQuery() {
  const { query, refine, clear } = useAlgoliaSearchBox();

  return {
    /** Current search query */
    query,
    /** Update the search query */
    setQuery: refine,
    /** Clear the search query */
    clearQuery: clear,
  };
}
