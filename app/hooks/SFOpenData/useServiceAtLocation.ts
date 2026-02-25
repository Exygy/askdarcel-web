import useSWR from "swr";
import fetcher from "../../utils/fetcher";
import { SF_OPEN_DATA_ENDPOINTS, SF_OPEN_DATA_SWR_CONFIG } from "./constants";
import { SFServiceAtLocation, SFOpenDataHookResult } from "./types";
import { buildSoQLUrl, buildEqualityFilter } from "./soqlUtils";

/**
 * Fetch service-location mappings for a specific service
 * Use this to find which locations offer a particular service
 */
export function useServiceLocations(
  serviceId: string | null
): SFOpenDataHookResult<SFServiceAtLocation[]> {
  const url =
    serviceId &&
    buildSoQLUrl(SF_OPEN_DATA_ENDPOINTS.serviceAtLocation, {
      where: buildEqualityFilter("service_id", serviceId),
    });

  const { data, error, isLoading } = useSWR<SFServiceAtLocation[]>(
    serviceId ? `sf-service-locations-${serviceId}` : null,
    () => (url ? fetcher<SFServiceAtLocation[]>(url) : Promise.resolve([])),
    SF_OPEN_DATA_SWR_CONFIG
  );

  return {
    data: data ?? null,
    error,
    isLoading,
  };
}

/**
 * Fetch service-location mappings for a specific location
 * Use this to find which services are available at a location
 */
export function useLocationServices(
  locationId: string | null
): SFOpenDataHookResult<SFServiceAtLocation[]> {
  const url =
    locationId &&
    buildSoQLUrl(SF_OPEN_DATA_ENDPOINTS.serviceAtLocation, {
      where: buildEqualityFilter("location_id", locationId),
    });

  const { data, error, isLoading } = useSWR<SFServiceAtLocation[]>(
    locationId ? `sf-location-services-${locationId}` : null,
    () => (url ? fetcher<SFServiceAtLocation[]>(url) : Promise.resolve([])),
    SF_OPEN_DATA_SWR_CONFIG
  );

  return {
    data: data ?? null,
    error,
    isLoading,
  };
}
