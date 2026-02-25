import useSWR from "swr";
import fetcher from "../../utils/fetcher";
import { SF_OPEN_DATA_ENDPOINTS, SF_OPEN_DATA_SWR_CONFIG } from "./constants";
import { SFLocation, SFOpenDataHookResult } from "./types";
import {
  buildSoQLUrl,
  buildIdFilter,
  buildIdsFilter,
  buildEqualityFilter,
} from "./soqlUtils";

/**
 * Fetch a single location by ID
 */
export function useLocation(
  id: string | null
): SFOpenDataHookResult<SFLocation> {
  const url =
    id &&
    buildSoQLUrl(SF_OPEN_DATA_ENDPOINTS.locations, {
      where: buildIdFilter(id),
      limit: 1,
    });

  const { data, error, isLoading } = useSWR<SFLocation[]>(
    id ? `sf-location-${id}` : null,
    () => (url ? fetcher<SFLocation[]>(url) : Promise.resolve([])),
    SF_OPEN_DATA_SWR_CONFIG
  );

  return {
    data: data?.[0] ?? null,
    error,
    isLoading,
  };
}

/**
 * Fetch multiple locations by IDs
 */
export function useLocationsByIds(
  ids: string[] | null
): SFOpenDataHookResult<SFLocation[]> {
  const hasIds = ids && ids.length > 0;

  const url =
    hasIds &&
    buildSoQLUrl(SF_OPEN_DATA_ENDPOINTS.locations, {
      where: buildIdsFilter(ids),
      limit: ids.length,
    });

  const cacheKey = hasIds ? `sf-locations-ids-${ids.sort().join(",")}` : null;

  const { data, error, isLoading } = useSWR<SFLocation[]>(
    cacheKey,
    () => (url ? fetcher<SFLocation[]>(url) : Promise.resolve([])),
    SF_OPEN_DATA_SWR_CONFIG
  );

  return {
    data: data ?? null,
    error,
    isLoading,
  };
}

/**
 * Fetch all locations for an organization
 */
export function useOrganizationLocations(
  organizationId: string | null,
  limit = 100
): SFOpenDataHookResult<SFLocation[]> {
  const url =
    organizationId &&
    buildSoQLUrl(SF_OPEN_DATA_ENDPOINTS.locations, {
      where: buildEqualityFilter("organization_id", organizationId),
      limit,
    });

  const { data, error, isLoading } = useSWR<SFLocation[]>(
    organizationId ? `sf-org-locations-${organizationId}-${limit}` : null,
    () => (url ? fetcher<SFLocation[]>(url) : Promise.resolve([])),
    SF_OPEN_DATA_SWR_CONFIG
  );

  return {
    data: data ?? null,
    error,
    isLoading,
  };
}

/**
 * Fetch all locations with pagination
 */
export function useLocations(
  limit = 100,
  offset = 0
): SFOpenDataHookResult<SFLocation[]> {
  const url = buildSoQLUrl(SF_OPEN_DATA_ENDPOINTS.locations, {
    limit,
    offset,
  });

  const { data, error, isLoading } = useSWR<SFLocation[]>(
    `sf-locations-${limit}-${offset}`,
    () => fetcher<SFLocation[]>(url),
    SF_OPEN_DATA_SWR_CONFIG
  );

  return {
    data: data ?? null,
    error,
    isLoading,
  };
}
