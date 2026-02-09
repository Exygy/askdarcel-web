import { useMemo } from "react";
import { useOrganization } from "./useOrganizations";
import { useOrganizationServices } from "./useServices";
import { useOrganizationLocations } from "./useLocations";
import { useCategories } from "./useTaxonomy";
import {
  SFOrganization,
  SFService,
  SFLocation,
  SFTaxonomy,
  SFOpenDataHookResult,
} from "./types";

export interface SFOrganizationWithDetails extends SFOrganization {
  services?: SFService[];
  locations?: SFLocation[];
  categories?: SFTaxonomy[];
}

interface UseOrganizationDetailsResult
  extends SFOpenDataHookResult<SFOrganizationWithDetails> {
  isLoadingRelated: boolean;
}

/**
 * Composite hook that fetches an organization along with all its related data:
 * - Services
 * - Locations
 * - Categories
 *
 * This performs multiple parallel API calls and combines the results.
 */
export function useOrganizationDetails(
  organizationId: string | null
): UseOrganizationDetailsResult {
  // Fetch the main organization
  const {
    data: organization,
    error: orgError,
    isLoading: isLoadingOrg,
  } = useOrganization(organizationId);

  // Fetch services for this organization
  const {
    data: services,
    error: servicesError,
    isLoading: isLoadingServices,
  } = useOrganizationServices(organizationId);

  // Fetch locations for this organization
  const {
    data: locations,
    error: locationsError,
    isLoading: isLoadingLocations,
  } = useOrganizationLocations(organizationId);

  // Fetch categories for this organization
  const {
    data: categories,
    error: categoriesError,
    isLoading: isLoadingCategories,
  } = useCategories(organizationId, "organization");

  // Combine all data into enriched organization object
  const data = useMemo<SFOrganizationWithDetails | null>(() => {
    if (!organization) return null;

    return {
      ...organization,
      services: services ?? undefined,
      locations: locations ?? undefined,
      categories: categories ?? undefined,
    };
  }, [organization, services, locations, categories]);

  // Aggregate errors (return the first one encountered)
  const error = orgError || servicesError || locationsError || categoriesError;

  // Primary loading state (just the organization itself)
  const isLoading = isLoadingOrg;

  // Secondary loading state (related data)
  const isLoadingRelated =
    isLoadingServices || isLoadingLocations || isLoadingCategories;

  return {
    data,
    error,
    isLoading,
    isLoadingRelated,
  };
}
