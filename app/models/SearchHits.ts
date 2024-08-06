import {
  Hit,
  SearchResults as SearchResultsType,
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

/**
 * Transform Algolia search hits such that each hit has a recurringSchedule that
 * uses the time helper classes.
 */
export const getRecurringScheduleForSeachHit = (hit: SearchHit) => {
  let result = null;

  if (hit.type === "resource") {
    result = {
      recurringSchedule: hit.schedule?.length
        ? parseAlgoliaSchedule(hit.schedule)
        : null,
    };
  }

  if (hit.type === "service") {
    const schedule = hit.schedule || hit.resource_schedule;

    result = {
      recurringSchedule: schedule?.length
        ? parseAlgoliaSchedule(schedule)
        : null,
    };
  }

  return result;
};

export type TransformedSearchHit = Hit<
  SearchHit & {
    recurringSchedule: string;
    resultIndex: string;
    markerTag: string;
    long_description: string;
    path: string;
    headline: string;
    resource_path: string;
    geoLocPath: string;
    lat: string;
    phoneNumber: string;
    url: string;
  }
>;
export interface SearchMapHitData
  extends SearchResultsType<TransformedSearchHit> {
  hits: TransformedSearchHit[];
}

export function transformSearchResults(
  searchResults: SearchResultsType
): SearchMapHitData {
  const currentPage = searchResults.page ?? 0;
  const hitsPerPage = searchResults.hitsPerPage ?? 20;

  const transformedHits = searchResults.hits.reduce((acc, hit, index) => {
    // TODO: Would these values ever not be set?
    const resultIndex = `${currentPage * hitsPerPage + index + 1}`;
    let markerTag = resultIndex;

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
      resultIndex,
      markerTag,
      long_description: hit.long_description || "No description, yet...",
      path: `/${basePath}/${entryId}`,
      headline: `${markerTag}. ${hit.name}`,
      resource_path: hit.resource_id ? `/organizations/${hit.resource_id}` : "",
      geoLocPath: `http://google.com/maps/dir/?api=1&destination=${hit._geoloc.lat},${hit._geoloc.lng}`,
      phoneNumber,
      url,
    };

    acc.push(nextHit);
    return acc;
  }, []);

  return {
    ...searchResults,
    hits: transformedHits,
  };
}
