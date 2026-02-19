import { useClearRefinements as useAlgoliaClearRefinements } from "react-instantsearch";

/**
 * Provider-agnostic hook for clearing refinements
 * Wraps Algolia's useClearRefinements hook
 */
export function useClearRefinements() {
  const { refine, canRefine } = useAlgoliaClearRefinements();

  return {
    /** Clear all refinements */
    clearAll: refine,
    /** Are there any refinements to clear? */
    hasRefinements: canRefine,
  };
}
