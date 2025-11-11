import { usePagination as useAlgoliaPagination } from "react-instantsearch";

/**
 * Provider-agnostic hook for pagination
 * Wraps Algolia's usePagination hook
 */
export function useSearchPagination() {
  const {
    refine,
    currentRefinement: currentPage,
    nbPages,
    isFirstPage,
    isLastPage,
    pages,
  } = useAlgoliaPagination();

  return {
    /** Navigate to a specific page (0-indexed) */
    goToPage: refine,
    /** Current page number (0-indexed) */
    currentPage,
    /** Total number of pages */
    totalPages: nbPages,
    /** Is this the first page? */
    isFirstPage,
    /** Is this the last page? */
    isLastPage,
    /** Array of available page numbers */
    availablePages: pages,
    /** Navigate to next page */
    nextPage: () => !isLastPage && refine(currentPage + 1),
    /** Navigate to previous page */
    previousPage: () => !isFirstPage && refine(currentPage - 1),
  };
}
