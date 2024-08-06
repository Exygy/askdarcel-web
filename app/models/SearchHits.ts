import {
  Hit,
  SearchResults as AlogliaSearchResultsType,
} from "react-instantsearch/connectors";
import { Service } from "./Service";
import { Organization } from "./Organization";
import { ScheduleDay, parseAlgoliaSchedule } from "./Schedule";
import { PhoneNumber } from "./Meta";
import { RecurringSchedule } from "./RecurringSchedule";

interface BaseHit {
  _geoloc: { lat: number; lng: number };
  is_mohcd_funded: boolean;
  resource_id: number;
}

export interface ServiceHit
  extends Omit<Service, "schedule" | "recurringSchedule" | "instructions">,
    BaseHit {
  type: "service";
  instructions: string[];
  phones: PhoneNumber[];
  recurringSchedule: RecurringSchedule | null;
  resource_schedule: ScheduleDay[];
  schedule: ScheduleDay[];
  service_id: number;
  service_of: string;
}
export interface OrganizationHit
  extends Omit<Organization, "schedule" | "recurringSchedule">,
    BaseHit {
  type: "resource";
  schedule: ScheduleDay[];
  recurringSchedule: RecurringSchedule | null;
}
export type SearchHit = ServiceHit | OrganizationHit;
export type SearchResultsResponse = AlogliaSearchResultsType<SearchHit>;
export type TransformedSearchHit = Hit<
  SearchHit & {
    recurringSchedule: RecurringSchedule | null;
    resultIndexDisplay: string;
    markerTag: string;
    longDescription: string;
    path: string;
    headline: string;
    resource_path: string;
    geoLocPath: string;
    phoneNumber: string;
    url: string;
  }
>;
export interface SearchMapHitData
  extends AlogliaSearchResultsType<TransformedSearchHit> {
  hits: TransformedSearchHit[];
}

// TODO: Determine if we need this code
export const getRecurringScheduleForSeachHit = (
  hit: SearchHit
): RecurringSchedule | null => {
  let result = null;

  if (hit.type === "resource") {
    result = hit.schedule?.length ? parseAlgoliaSchedule(hit.schedule) : null;
  }

  if (hit.type === "service") {
    const schedule = hit.schedule || hit.resource_schedule;

    result = schedule?.length ? parseAlgoliaSchedule(schedule) : null;
  }

  return result;
};

//
export function transformSearchResults(
  searchResults: SearchResultsResponse
): SearchMapHitData {
  // Algolia's api response types these properties as optional, although in practice they always appear
  // in results in our searches
  const currentPage = searchResults.page ?? 0;
  const hitsPerPage = searchResults.hitsPerPage ?? 20;

  const transformedHits = searchResults.hits.reduce((acc, hit, index) => {
    const resultIndexDisplay = `${currentPage * hitsPerPage + index + 1}`;
    let markerTag = resultIndexDisplay;

    if (index > 0) {
      const alphabeticalIndex = (index + 9).toString(36).toUpperCase();
      markerTag += alphabeticalIndex;
    }
    const phoneNumber = hit?.phones?.[0]?.number;
    const url = hit.type === "service" ? hit.url : hit.website;
    const basePath = hit.type === "service" ? `services` : `organizations`;
    // handle resources and services slightly differently.
    let entryId = hit.resource_id;
    if (hit.type === "service") {
      entryId = hit.service_id;
    }

    const nextHit = {
      ...hit,
      recurringSchedule: getRecurringScheduleForSeachHit(hit),
      resultIndexDisplay,
      markerTag,
      longDescription: hit.long_description || "No description, yet...",
      path: `/${basePath}/${entryId}`,
      headline: `${markerTag}. ${hit.name}`,
      resource_path: hit.resource_id ? `/organizations/${hit.resource_id}` : "",
      geoLocPath: `http://google.com/maps/dir/?api=1&destination=${hit._geoloc.lat},${hit._geoloc.lng}`,
      phoneNumber,
      url,
    };

    acc.push(nextHit);
    return acc;
  }, [] as TransformedSearchHit[]);

  return {
    ...searchResults,
    hits: transformedHits,
  };
}
