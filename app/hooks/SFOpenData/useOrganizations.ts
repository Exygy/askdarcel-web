import useSWR from "swr";
import fetcher from "../../utils/fetcher";
import { SF_OPEN_DATA_ENDPOINTS, SF_OPEN_DATA_SWR_CONFIG } from "./constants";
import { SFOrganization, SFOpenDataHookResult } from "./types";
import {
  buildSoQLUrl,
  buildIdFilter,
  buildTextSearchFilter,
} from "./soqlUtils";

/**
 * Fetch a single organization by ID
 */
export function useOrganization(
  id: string | null
): SFOpenDataHookResult<SFOrganization> {
  const url =
    id &&
    buildSoQLUrl(SF_OPEN_DATA_ENDPOINTS.organizations, {
      where: buildIdFilter(id),
      limit: 1,
    });

  const { data, error, isLoading } = useSWR<SFOrganization[]>(
    id ? `sf-org-${id}` : null,
    () => (url ? fetcher<SFOrganization[]>(url) : Promise.resolve([])),
    SF_OPEN_DATA_SWR_CONFIG
  );

  return {
    data: data?.[0] ?? null,
    error,
    isLoading,
  };
}

/**
 * Fetch all organizations with optional search
 */
export function useOrganizations(
  searchQuery?: string,
  limit = 100
): SFOpenDataHookResult<SFOrganization[]> {
  const where = searchQuery
    ? buildTextSearchFilter("name", searchQuery)
    : undefined;

  const url = buildSoQLUrl(SF_OPEN_DATA_ENDPOINTS.organizations, {
    where,
    limit,
    order: "name ASC",
  });

  const cacheKey = searchQuery
    ? `sf-orgs-search-${searchQuery}-${limit}`
    : `sf-orgs-all-${limit}`;

  const { data, error, isLoading } = useSWR<SFOrganization[]>(
    cacheKey,
    () => fetcher<SFOrganization[]>(url),
    SF_OPEN_DATA_SWR_CONFIG
  );

  return {
    data: data ?? null,
    error,
    isLoading,
  };
}
