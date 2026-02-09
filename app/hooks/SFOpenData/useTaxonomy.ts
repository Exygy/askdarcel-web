import useSWR from "swr";
import fetcher from "../../utils/fetcher";
import { SF_OPEN_DATA_ENDPOINTS, SF_OPEN_DATA_SWR_CONFIG } from "./constants";
import {
  SFTaxonomy,
  SFOpenDataHookResult,
  SFTaxonomyLinkEntity,
} from "./types";
import { buildSoQLUrl, buildEqualityFilter, combineFilters } from "./soqlUtils";

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
 * Fetch eligibilities for a service (organizations don't have eligibilities)
 */
export function useEligibilities(
  serviceId: string | null
): SFOpenDataHookResult<SFTaxonomy[]> {
  const url =
    serviceId &&
    buildSoQLUrl(SF_OPEN_DATA_ENDPOINTS.taxonomy, {
      where: combineFilters([
        buildEqualityFilter("link_id", serviceId),
        buildEqualityFilter("link_entity", "service"),
        buildEqualityFilter("link_type", "our415_tags_services"),
      ]),
    });

  const { data, error, isLoading } = useSWR<SFTaxonomy[]>(
    serviceId ? `sf-eligibilities-${serviceId}` : null,
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
