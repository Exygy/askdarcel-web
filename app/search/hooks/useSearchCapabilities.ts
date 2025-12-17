import { useSearchContext } from "../context/SearchContext";
import type { ProviderCapabilities } from "../types";

/**
 * Hook to access the current search provider's capabilities
 *
 * Use this to conditionally render features based on what the provider supports
 *
 * Example:
 * ```tsx
 * const { facetableFields } = useSearchCapabilities();
 * const canShowEligibilities = facetableFields.includes('eligibilities');
 * ```
 */
export function useSearchCapabilities(): ProviderCapabilities {
  const { provider } = useSearchContext();
  return provider.getCapabilities();
}
