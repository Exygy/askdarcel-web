import { useMemo } from "react";
import { useService } from "./useServices";
import { useOrganization } from "./useOrganizations";
import { useServiceLocations } from "./useServiceAtLocation";
import { useLocationsByIds } from "./useLocations";
import { useCategories, useEligibilities } from "./useTaxonomy";
import { useServiceSchedules } from "./useSchedules";
import { SFServiceWithDetails, SFOpenDataHookResult } from "./types";

interface UseServiceDetailsResult extends SFOpenDataHookResult<SFServiceWithDetails> {
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

  // Fetch categories
  const {
    data: categories,
    error: categoriesError,
    isLoading: isLoadingCategories,
  } = useCategories(serviceId, "service");

  // Fetch eligibilities
  const {
    data: eligibilities,
    error: eligibilitiesError,
    isLoading: isLoadingEligibilities,
  } = useEligibilities(serviceId);

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
    eligibilitiesError ||
    schedulesError;

  // Primary loading state (just the service itself)
  const isLoading = isLoadingService;

  // Secondary loading state (related data)
  const isLoadingRelated =
    isLoadingOrg ||
    isLoadingMappings ||
    isLoadingLocations ||
    isLoadingCategories ||
    isLoadingEligibilities ||
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
  data: { service: SFServiceWithDetails | null; organizationName?: string } | null;
  error?: Error;
  isLoading: boolean;
} {
  const { data: service, error: serviceError, isLoading: isLoadingService } = useService(serviceId);
  const { data: organization, error: orgError, isLoading: isLoadingOrg } = useOrganization(
    service?.organization_id ?? null
  );

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
