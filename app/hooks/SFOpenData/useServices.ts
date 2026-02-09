import useSWR from "swr";
import fetcher from "../../utils/fetcher";
import { SF_OPEN_DATA_ENDPOINTS, SF_OPEN_DATA_SWR_CONFIG } from "./constants";
import { SFService, SFOpenDataHookResult, SFServiceFilters } from "./types";
import {
  buildSoQLUrl,
  buildIdFilter,
  buildTextSearchFilter,
  buildEqualityFilter,
  combineFilters,
} from "./soqlUtils";

/**
 * Fetch a single service by ID
 */
export function useService(id: string | null): SFOpenDataHookResult<SFService> {
  const url =
    id &&
    buildSoQLUrl(SF_OPEN_DATA_ENDPOINTS.services, {
      where: buildIdFilter(id),
      limit: 1,
    });

  const { data, error, isLoading } = useSWR<SFService[]>(
    id ? `sf-service-${id}` : null,
    () => (url ? fetcher<SFService[]>(url) : Promise.resolve([])),
    SF_OPEN_DATA_SWR_CONFIG
  );

  return {
    data: data?.[0] ?? null,
    error,
    isLoading,
  };
}

/**
 * Fetch services with optional filters
 */
export function useServices(
  filters: SFServiceFilters = {},
  limit = 100
): SFOpenDataHookResult<SFService[]> {
  const { organizationId, searchQuery } = filters;

  const whereConditions = [
    organizationId && buildEqualityFilter("organization_id", organizationId),
    searchQuery && buildTextSearchFilter("name", searchQuery),
  ];

  const where = combineFilters(whereConditions) || undefined;

  const url = buildSoQLUrl(SF_OPEN_DATA_ENDPOINTS.services, {
    where,
    limit,
    order: "name ASC",
  });

  const cacheKey = `sf-services-${organizationId ?? "all"}-${
    searchQuery ?? "none"
  }-${limit}`;

  const { data, error, isLoading } = useSWR<SFService[]>(
    cacheKey,
    () => fetcher<SFService[]>(url),
    SF_OPEN_DATA_SWR_CONFIG
  );

  return {
    data: data ?? null,
    error,
    isLoading,
  };
}

/**
 * Fetch all services for a specific organization
 */
export function useOrganizationServices(
  organizationId: string | null,
  limit = 100
): SFOpenDataHookResult<SFService[]> {
  const url =
    organizationId &&
    buildSoQLUrl(SF_OPEN_DATA_ENDPOINTS.services, {
      where: buildEqualityFilter("organization_id", organizationId),
      limit,
      order: "name ASC",
    });

  const { data, error, isLoading } = useSWR<SFService[]>(
    organizationId ? `sf-org-services-${organizationId}-${limit}` : null,
    () => (url ? fetcher<SFService[]>(url) : Promise.resolve([])),
    SF_OPEN_DATA_SWR_CONFIG
  );

  return {
    data: data ?? null,
    error,
    isLoading,
  };
}
