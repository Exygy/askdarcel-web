import useSWR from "swr";
import { useMemo } from "react";
import fetcher from "../../utils/fetcher";
import { SF_OPEN_DATA_ENDPOINTS, SF_OPEN_DATA_SWR_CONFIG } from "./constants";
import {
  SFTaxonomy,
  SFOpenDataHookResult,
  SFTaxonomyLinkEntity,
} from "./types";
import {
  buildSoQLUrl,
  buildEqualityFilter,
  combineFilters,
  buildFieldInFilter,
} from "./soqlUtils";

/**
 * Fetch categories for a service or organization
 */
export function useCategories(
  linkId: string | null,
  linkEntity: SFTaxonomyLinkEntity = "service"
): SFOpenDataHookResult<SFTaxonomy[]> {
  const url =
    linkId &&
    buildSoQLUrl(SF_OPEN_DATA_ENDPOINTS.taxonomy, {
      where: combineFilters([
        buildEqualityFilter("link_id", linkId),
        buildEqualityFilter("link_entity", linkEntity),
        buildEqualityFilter("link_type", "our415_categories"),
      ]),
    });

  const { data, error, isLoading } = useSWR<SFTaxonomy[]>(
    linkId ? `sf-categories-${linkEntity}-${linkId}` : null,
    () => (url ? fetcher<SFTaxonomy[]>(url) : Promise.resolve([])),
    SF_OPEN_DATA_SWR_CONFIG
  );

  return {
    data: data ?? null,
    error,
    isLoading,
  };
}

/**
 * Fetch eligibilities for a service or organization.
 * The SF Open Data taxonomy table stores eligibilities for both entity types
 * using link_type='our415_tags_services'. The search index falls back to the
 * parent org's eligibilities when a service has none of its own, so we support
 * querying by either entity type to implement the same inheritance on the frontend.
 */
export function useEligibilities(
  linkId: string | null,
  linkEntity: SFTaxonomyLinkEntity = "service"
): SFOpenDataHookResult<SFTaxonomy[]> {
  const url =
    linkId &&
    buildSoQLUrl(SF_OPEN_DATA_ENDPOINTS.taxonomy, {
      where: combineFilters([
        buildEqualityFilter("link_id", linkId),
        buildEqualityFilter("link_entity", linkEntity),
        buildEqualityFilter("link_type", "our415_tags_services"),
      ]),
    });

  const { data, error, isLoading } = useSWR<SFTaxonomy[]>(
    linkId ? `sf-eligibilities-${linkEntity}-${linkId}` : null,
    () => (url ? fetcher<SFTaxonomy[]>(url) : Promise.resolve([])),
    SF_OPEN_DATA_SWR_CONFIG
  );

  return {
    data: data ?? null,
    error,
    isLoading,
  };
}

/**
 * Fetch taxonomy terms by their taxonomy_term_id values.
 *
 * Used to resolve parent category terms that are referenced by a subcategory's
 * parent_id but are not themselves directly linked to the service/org. The SF
 * Open Data taxonomy table is a join table, so we find these terms by looking
 * for any row where taxonomy_term_id matches — then deduplicate by term ID.
 */
export function useParentTaxonomyTerms(
  termIds: string[] | null
): SFOpenDataHookResult<SFTaxonomy[]> {
  const sortedIds = useMemo(
    () => (termIds && termIds.length > 0 ? [...termIds].sort() : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [termIds?.join(",")]
  );

  const url =
    sortedIds &&
    buildSoQLUrl(SF_OPEN_DATA_ENDPOINTS.taxonomy, {
      where: buildFieldInFilter("taxonomy_term_id", sortedIds),
      // DISTINCT ensures we get exactly one row per term regardless of how many
      // entities reference that term — avoids the default 1000-row page limit
      // cutting off results when a common parent term has many referencing rows.
      select: "DISTINCT taxonomy_term_id, taxonomy_term",
    });

  const { data, error, isLoading } = useSWR<SFTaxonomy[]>(
    sortedIds ? `sf-parent-terms-${sortedIds.join(",")}` : null,
    () => (url ? fetcher<SFTaxonomy[]>(url) : Promise.resolve([])),
    {
      ...SF_OPEN_DATA_SWR_CONFIG,
      refreshInterval: 1000 * 60 * 60, // parent terms are relatively static
    }
  );

  // Deduplicate by taxonomy_term_id — multiple entities may reference the same term
  const deduped = useMemo(() => {
    if (!data) return null;
    const seen = new Set<string>();
    return data.filter((item) => {
      if (seen.has(item.taxonomy_term_id)) return false;
      seen.add(item.taxonomy_term_id);
      return true;
    });
  }, [data]);

  return { data: deduped, error, isLoading };
}

/**
 * Fetch all top-level categories (those without a parent_id)
 */
export function useTopLevelCategories(): SFOpenDataHookResult<SFTaxonomy[]> {
  const url = buildSoQLUrl(SF_OPEN_DATA_ENDPOINTS.taxonomy, {
    where: combineFilters([
      buildEqualityFilter("link_type", "our415_categories"),
      "parent_id IS NULL",
    ]),
    select: "DISTINCT taxonomy_term_id, taxonomy_term",
    order: "taxonomy_term ASC",
  });

  const { data, error, isLoading } = useSWR<SFTaxonomy[]>(
    "sf-top-level-categories",
    () => fetcher<SFTaxonomy[]>(url),
    {
      ...SF_OPEN_DATA_SWR_CONFIG,
      // Categories are relatively static, cache longer
      refreshInterval: 1000 * 60 * 60, // 1 hour
    }
  );

  return {
    data: data ?? null,
    error,
    isLoading,
  };
}

/**
 * Fetch subcategories for a given parent category
 */
export function useSubcategories(
  parentId: string | null
): SFOpenDataHookResult<SFTaxonomy[]> {
  const url =
    parentId &&
    buildSoQLUrl(SF_OPEN_DATA_ENDPOINTS.taxonomy, {
      where: combineFilters([
        buildEqualityFilter("link_type", "our415_categories"),
        buildEqualityFilter("parent_id", parentId),
      ]),
      select: "DISTINCT taxonomy_term_id, taxonomy_term, parent_id",
      order: "taxonomy_term ASC",
    });

  const { data, error, isLoading } = useSWR<SFTaxonomy[]>(
    parentId ? `sf-subcategories-${parentId}` : null,
    () => (url ? fetcher<SFTaxonomy[]>(url) : Promise.resolve([])),
    {
      ...SF_OPEN_DATA_SWR_CONFIG,
      refreshInterval: 1000 * 60 * 60, // 1 hour
    }
  );

  return {
    data: data ?? null,
    error,
    isLoading,
  };
}

/**
 * Fetch all unique eligibility terms
 */
export function useAllEligibilities(): SFOpenDataHookResult<SFTaxonomy[]> {
  const url = buildSoQLUrl(SF_OPEN_DATA_ENDPOINTS.taxonomy, {
    where: buildEqualityFilter("link_type", "our415_tags_services"),
    select: "DISTINCT taxonomy_term_id, taxonomy_term",
    order: "taxonomy_term ASC",
  });

  const { data, error, isLoading } = useSWR<SFTaxonomy[]>(
    "sf-all-eligibilities",
    () => fetcher<SFTaxonomy[]>(url),
    {
      ...SF_OPEN_DATA_SWR_CONFIG,
      refreshInterval: 1000 * 60 * 60, // 1 hour
    }
  );

  return {
    data: data ?? null,
    error,
    isLoading,
  };
}
