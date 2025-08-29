import useSWR from "swr";
import fetcher from "../utils/fetcher";

// Interface for the SF Gov API data structure
export interface SFGovEvent {
  id: string;
  org_name: string;
  event_name: string;
  event_description: string;
  event_start_date: string;
  event_end_date: string;
  start_time: string;
  end_time: string;
  more_info: string;
  fee: boolean;
  site_location_name: string;
  event_photo?: {
    url: string;
  };
  category: string;
  subcategory: string;
  age_group_eligibility_tags: string;
  site_address: string;
  site_phone: string;
  site_email: string;
  latitude: string;
  longitude: string;
  point: {
    type: string;
    coordinates: [number, number];
  };
  analysis_neighborhood: string;
  supervisor_district: string;
  data_as_of: string;
  data_loaded_at: string;
}

interface SFGovEventsHookResult {
  data: SFGovEvent[] | null;
  error?: Error;
  isLoading: boolean;
}

/**
 * Hook to fetch all events from SF Gov Open Data API
 * Shows all events regardless of date
 */
export function useAllSFGovEvents(limit = 1000): SFGovEventsHookResult {
  const url = `https://data.sfgov.org/resource/8i3s-ih2a.json`;

  const { data, error, isLoading } = useSWR<SFGovEvent[]>(
    `sfgov-all-events-${limit}`,
    () => fetcher<SFGovEvent[]>(url),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 1000 * 60 * 30, // Refresh every 30 minutes
    }
  );

  return {
    data: data || null,
    error,
    isLoading,
  };
}
