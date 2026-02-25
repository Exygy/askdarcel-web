import useSWR from "swr";
import fetcher from "../../utils/fetcher";
import { SF_OPEN_DATA_ENDPOINTS, SF_OPEN_DATA_SWR_CONFIG } from "./constants";
import { SFSchedule, SFOpenDataHookResult } from "./types";
import { buildSoQLUrl, buildEqualityFilter } from "./soqlUtils";

/**
 * Fetch schedules for a specific service
 */
export function useServiceSchedules(
  serviceId: string | null
): SFOpenDataHookResult<SFSchedule[]> {
  const url =
    serviceId &&
    buildSoQLUrl(SF_OPEN_DATA_ENDPOINTS.schedules, {
      where: buildEqualityFilter("service_id", serviceId),
    });

  const { data, error, isLoading } = useSWR<SFSchedule[]>(
    serviceId ? `sf-schedules-${serviceId}` : null,
    () => (url ? fetcher<SFSchedule[]>(url) : Promise.resolve([])),
    SF_OPEN_DATA_SWR_CONFIG
  );

  return {
    data: data ?? null,
    error,
    isLoading,
  };
}
