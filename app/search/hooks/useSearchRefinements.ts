import { useRefinementList as useAlgoliaRefinementList } from "react-instantsearch";
import type { RefinementItem } from "../types";

interface UseSearchRefinementsOptions {
  attribute: string;
  limit?: number;
  operator?: "and" | "or";
}

/**
 * Provider-agnostic hook for refinement/faceting
 * Wraps Algolia's useRefinementList hook
 */
export function useSearchRefinements(options: UseSearchRefinementsOptions) {
  const { attribute, limit = 9999, operator = "or" } = options;

  const {
    items: algoliaItems,
    refine: algoliaRefine,
    canRefine,
    canToggleShowMore,
    isShowingMore,
    toggleShowMore,
    searchForItems,
  } = useAlgoliaRefinementList({
    attribute,
    limit,
    operator,
  });

  // Transform Algolia items to provider-agnostic format
  const items: RefinementItem[] = algoliaItems.map((item) => ({
    label: item.label,
    value: item.value,
    count: item.count,
    isRefined: item.isRefined,
  }));

  return {
    /** Available refinement items */
    items,
    /** Toggle a refinement value */
    toggleRefinement: algoliaRefine,
    /** Can any refinements be applied? */
    canRefine,
    /** Can show more items? */
    canToggleShowMore,
    /** Are more items showing? */
    isShowingMore,
    /** Toggle showing more items */
    toggleShowMore,
    /** Search within refinement items */
    searchItems: searchForItems,
  };
}
