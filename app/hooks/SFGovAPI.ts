import useSWR from "swr";
import { SF_OPEN_DATA_BASE_URL } from "./SFOpenData/constants";

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
  events_category: string;
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
  days_of_week?: string; // Optional field for specifying which days of the week the event occurs
}

interface SFGovEventsHookResult {
  data: SFGovEvent[] | null;
  error?: Error;
  isLoading: boolean;
}

// Unlike the shared fetcher, treat HTTP errors and non-array bodies (e.g. a
// Socrata error object) as failures so callers can show an error state
async function fetchEvents(url: string): Promise<SFGovEvent[]> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Events request failed with status ${res.status}`);
  }
  const body = await res.json();
  if (!Array.isArray(body)) {
    throw new Error("Events response was not a list");
  }
  return body;
}

/**
 * Hook to fetch all events from SF Gov Open Data API
 * Shows all events regardless of date
 */
export function useAllSFGovEvents(limit = 1000): SFGovEventsHookResult {
  const url = `${SF_OPEN_DATA_BASE_URL}/8i3s-ih2a.json`;

  const { data, error, isLoading } = useSWR<SFGovEvent[]>(
    `sfgov-all-events-${limit}`,
    () => fetchEvents(url),
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
