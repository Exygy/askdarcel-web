import { useMemo } from "react";
import { useService } from "./useServices";
import { useOrganization } from "./useOrganizations";
import { useServiceLocations } from "./useServiceAtLocation";
import { useLocationsByIds } from "./useLocations";
import {
  useCategories,
  useEligibilities,
  useParentTaxonomyTerms,
} from "./useTaxonomy";
import { useServiceSchedules } from "./useSchedules";
import {
  SFServiceWithDetails,
  SFOpenDataHookResult,
  SFTaxonomy,
} from "./types";

interface UseServiceDetailsResult
  extends SFOpenDataHookResult<SFServiceWithDetails> {
  isLoadingRelated: boolean;
}

/**
 * Composite hook that fetches a service along with all its related data:
 * - Organization
 * - Locations (via service_at_location join)
 * - Categories
 * - Eligibilities
 * - Schedules
 *
 * This performs multiple parallel API calls and combines the results.
 */
export function useServiceDetails(
  serviceId: string | null
): UseServiceDetailsResult {
  // Fetch the main service
  const {
    data: service,
    error: serviceError,
    isLoading: isLoadingService,
  } = useService(serviceId);

  // Fetch the organization (depends on service)
  const {
    data: organization,
    error: orgError,
    isLoading: isLoadingOrg,
  } = useOrganization(service?.organization_id ?? null);

  // Fetch service-location mappings
  const {
    data: serviceLocationMappings,
    error: mappingsError,
    isLoading: isLoadingMappings,
  } = useServiceLocations(serviceId);

  // Extract location IDs from mappings
  const locationIds = useMemo(
    () => serviceLocationMappings?.map((m) => m.location_id) ?? null,
    [serviceLocationMappings]
  );

  // Fetch actual locations
  const {
    data: locations,
    error: locationsError,
    isLoading: isLoadingLocations,
  } = useLocationsByIds(locationIds);

  // Fetch service's own categories
  const {
    data: serviceCategories,
    error: categoriesError,
    isLoading: isLoadingCategories,
  } = useCategories(serviceId, "service");

  // Fetch parent org's categories as fallback (mirrors search index inheritance)
  const orgIdForFallback = service?.organization_id ?? null;
  const {
    data: orgCategories,
    error: orgCategoriesError,
    isLoading: isLoadingOrgCategories,
  } = useCategories(orgIdForFallback, "organization");

  // Resolve raw categories: use the service's own if non-empty, otherwise inherit from org.
  const rawCategories: SFTaxonomy[] | null =
    serviceCategories && serviceCategories.length > 0
      ? serviceCategories
      : orgCategories ?? serviceCategories;

  // Find parent_id values referenced by subcategories that are not present as their
  // own taxonomy_term_id entries in the resolved list.
  const missingParentIds = useMemo(() => {
    if (!rawCategories || rawCategories.length === 0) return null;
    const presentTermIds = new Set(
      rawCategories.map((c) => c.taxonomy_term_id)
    );
    const missing = rawCategories
      .filter((c) => c.parent_id && !presentTermIds.has(c.parent_id))
      .map((c) => c.parent_id as string);
    const unique = [...new Set(missing)];
    return unique.length > 0 ? unique : null;
  }, [rawCategories]);

  // Look up the term name for each missing parent ID across the full taxonomy dataset.
  const {
    data: parentCategoryTerms,
    error: parentCategoryTermsError,
    isLoading: isLoadingParentCategoryTerms,
  } = useParentTaxonomyTerms(missingParentIds);

  // Inject resolved parent terms as top-level category entries.
  const categories = useMemo((): SFTaxonomy[] | null => {
    if (!rawCategories) return null;
    if (!parentCategoryTerms || parentCategoryTerms.length === 0)
      return rawCategories;
    const presentTermIds = new Set(
      rawCategories.map((c) => c.taxonomy_term_id)
    );
    const newParents = parentCategoryTerms
      .filter((t) => !presentTermIds.has(t.taxonomy_term_id))
      .map(
        (t): SFTaxonomy => ({
          id: "",
          link_id: "",
          link_type: "our415_categories",
          link_entity: "service",
          taxonomy_term_id: t.taxonomy_term_id,
          taxonomy_term: t.taxonomy_term,
          parent_id: null,
        })
      );
    return newParents.length > 0
      ? [...rawCategories, ...newParents]
      : rawCategories;
  }, [rawCategories, parentCategoryTerms]);

  // Fetch service's own eligibilities
  const {
    data: serviceEligibilities,
    error: eligibilitiesError,
    isLoading: isLoadingEligibilities,
  } = useEligibilities(serviceId, "service");

  // Fetch parent org's eligibilities as fallback (mirrors search index inheritance)
  const {
    data: orgEligibilities,
    error: orgEligibilitiesError,
    isLoading: isLoadingOrgEligibilities,
  } = useEligibilities(orgIdForFallback, "organization");

  // Resolve eligibilities: use the service's own if non-empty, otherwise inherit from org.
  const eligibilities =
    serviceEligibilities && serviceEligibilities.length > 0
      ? serviceEligibilities
      : orgEligibilities ?? serviceEligibilities;

  // Fetch schedules
  const {
    data: schedules,
    error: schedulesError,
    isLoading: isLoadingSchedules,
  } = useServiceSchedules(serviceId);

  // Combine all data into enriched service object
  const data = useMemo<SFServiceWithDetails | null>(() => {
    if (!service) return null;

    return {
      ...service,
      organization: organization ?? undefined,
      locations: locations ?? undefined,
      categories: categories ?? undefined,
      eligibilities: eligibilities ?? undefined,
      schedules: schedules ?? undefined,
    };
  }, [service, organization, locations, categories, eligibilities, schedules]);

  // Aggregate errors (return the first one encountered)
  const error =
    serviceError ||
    orgError ||
    mappingsError ||
    locationsError ||
    categoriesError ||
    orgCategoriesError ||
    parentCategoryTermsError ||
    eligibilitiesError ||
    orgEligibilitiesError ||
    schedulesError;

  // Primary loading state (just the service itself)
  const isLoading = isLoadingService;

  // Secondary loading state (related data)
  const isLoadingRelated =
    isLoadingOrg ||
    isLoadingMappings ||
    isLoadingLocations ||
    isLoadingCategories ||
    isLoadingOrgCategories ||
    isLoadingParentCategoryTerms ||
    isLoadingEligibilities ||
    isLoadingOrgEligibilities ||
    isLoadingSchedules;

  return {
    data,
    error,
    isLoading,
    isLoadingRelated,
  };
}

/**
 * Lightweight version that only fetches service + organization
 * Use this when you don't need all the related data
 */
export function useServiceWithOrganization(serviceId: string | null): {
  data: {
    service: SFServiceWithDetails | null;
    organizationName?: string;
  } | null;
  error?: Error;
  isLoading: boolean;
} {
  const {
    data: service,
    error: serviceError,
    isLoading: isLoadingService,
  } = useService(serviceId);
  const {
    data: organization,
    error: orgError,
    isLoading: isLoadingOrg,
  } = useOrganization(service?.organization_id ?? null);

  const data = useMemo(() => {
    if (!service) return null;
    return {
      service: { ...service, organization: organization ?? undefined },
      organizationName: organization?.name,
    };
  }, [service, organization]);

  return {
    data,
    error: serviceError || orgError,
    isLoading: isLoadingService || isLoadingOrg,
  };
}
