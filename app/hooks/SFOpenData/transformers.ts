/**
 * Transformers to convert SF Open Data API responses to internal model types
 */

import {
  SFOrganization,
  SFService,
  SFLocation,
  SFSchedule,
  SFTaxonomy,
  SFServiceWithDetails,
} from "./types";
import { Organization, DetailAction } from "../../models/Organization";
import { Service } from "../../models/Service";
import { Address, Category, Eligibility, LocationDetails } from "../../models/Meta";
import {
  DAY_TO_INT,
  DAYS_IN_WEEK,
  RecurringSchedule,
  RecurringInterval,
  RecurringTime,
} from "../../models/RecurringSchedule";

/**
 * Parse time string (e.g., "12:30:00") into hour and minute
 */
function parseTimeString(timeStr: string | undefined): { hour: number; minute: number } | null {
  if (!timeStr) return null;
  const parts = timeStr.split(":");
  if (parts.length < 2) return null;
  const hour = parseInt(parts[0], 10);
  const minute = parseInt(parts[1], 10);
  if (isNaN(hour) || isNaN(minute)) return null;
  return { hour, minute };
}

/**
 * Parse day string (e.g., "Monday") to day number
 */
function parseDayString(dayStr: string | undefined): number | null {
  if (!dayStr) return null;
  const day = DAY_TO_INT[dayStr as keyof typeof DAY_TO_INT];
  return day !== undefined ? day : null;
}

/**
 * Transform SF Open Data schedules to RecurringSchedule
 */
export function transformSchedules(schedules: SFSchedule[] | undefined): RecurringSchedule {
  if (!schedules || schedules.length === 0) {
    return new RecurringSchedule({ intervals: [], hoursKnown: false });
  }

  const intervals: RecurringInterval[] = [];

  for (const schedule of schedules) {
    const day = parseDayString(schedule.byday);
    const opensAt = parseTimeString(schedule.opens_at);
    const closesAt = parseTimeString(schedule.closes_at);

    if (day === null || !opensAt || !closesAt) continue;

    const opensAtMinutes = opensAt.hour * 60 + opensAt.minute;
    const closesAtMinutes = closesAt.hour * 60 + closesAt.minute;

    intervals.push(
      new RecurringInterval({
        opensAt: new RecurringTime({ day, hour: opensAt.hour, minute: opensAt.minute }),
        closesAt: new RecurringTime({
          day: (day + (closesAtMinutes < opensAtMinutes ? 1 : 0)) % DAYS_IN_WEEK,
          hour: closesAt.hour,
          minute: closesAt.minute,
        }),
      })
    );
  }

  return new RecurringSchedule({ intervals, hoursKnown: intervals.length > 0 });
}

/**
 * Transform SF Open Data location to internal Address format
 */
export function transformLocationToAddress(location: SFLocation): Address {
  return {
    id: parseInt(location.id, 10) || 0,
    attention: null,
    name: location.name || null,
    address_1: location.address_1 || "",
    address_2: location.address_2 || null,
    address_3: null,
    address_4: null,
    city: location.city || "",
    state_province: location.state_province || "CA",
    postal_code: location.postal_code || "",
    latitude: location.latitude || "",
    longitude: location.longitude || "",
  };
}

/**
 * Transform SF Open Data taxonomy to internal Category format
 */
export function transformTaxonomyToCategory(taxonomy: SFTaxonomy): Category {
  return {
    id: parseInt(taxonomy.taxonomy_term_id, 10) || 0,
    name: taxonomy.taxonomy_term,
    top_level: taxonomy.parent_id === null || taxonomy.parent_id === undefined,
    featured: false,
  };
}

/**
 * Transform SF Open Data taxonomy to internal Eligibility format
 */
export function transformTaxonomyToEligibility(taxonomy: SFTaxonomy): Eligibility {
  return {
    id: parseInt(taxonomy.taxonomy_term_id, 10) || 0,
    name: taxonomy.taxonomy_term,
    feature_rank: null,
  };
}

/**
 * Transform SF Open Data organization to internal Organization format
 */
export function transformOrganization(
  org: SFOrganization,
  options?: {
    locations?: SFLocation[];
    categories?: SFTaxonomy[];
    services?: SFService[];
    schedules?: SFSchedule[];
  }
): Organization {
  const { locations = [], categories = [], services = [], schedules = [] } = options || {};

  const recurringSchedule = transformSchedules(schedules);
  const addresses = locations.map(transformLocationToAddress);

  return {
    id: parseInt(org.id, 10) || 0,
    name: org.name,
    addresses,
    alternate_name: null,
    categories: categories.map(transformTaxonomyToCategory),
    certified_at: null,
    certified: false,
    email: org.email || null,
    featured: false,
    internal_note: null,
    legal_status: null,
    long_description: org.description || null,
    notes: [],
    phones: [],
    recurringSchedule,
    schedule: {
      id: 0,
      hours_known: recurringSchedule.hoursKnown,
      schedule_days: [],
    },
    services: services.map((s) => transformServiceBasic(s)),
    short_description: org.description?.substring(0, 200) || null,
    source_attribution: "SF Open Data",
    status: "approved",
    updated_at: new Date().toISOString(),
    verified_at: null,
    website: org.website || null,
  };
}

/**
 * Transform basic SF service without related data
 */
function transformServiceBasic(service: SFService): Service {
  const emptySchedule = new RecurringSchedule({ intervals: [], hoursKnown: false });

  return {
    id: parseInt(service.id, 10) || 0,
    name: service.name,
    addresses: [],
    alsoNamed: "",
    alternate_name: null,
    application_process: null,
    categories: [],
    certified_at: null,
    certified: false,
    documents: [],
    eligibilities: [],
    email: null,
    featured: null,
    fee: null,
    instructions: [],
    internal_note: null,
    interpretation_services: null,
    long_description: service.description || null,
    notes: [],
    program: null,
    recurringSchedule: emptySchedule,
    required_documents: null,
    resource: {} as Organization, // Will be filled in when transforming full service
    schedule: {
      id: 0,
      hours_known: false,
      schedule_days: [],
    },
    short_description: service.description?.substring(0, 200) || "",
    source_attribution: "SF Open Data",
    status: "approved",
    updated_at: new Date().toISOString(),
    url: service.url || null,
    verified_at: null,
    wait_time: null,
  };
}

/**
 * Transform SF Open Data service with all related data to internal Service format
 */
export function transformService(serviceWithDetails: SFServiceWithDetails): Service {
  const {
    organization,
    locations = [],
    categories = [],
    eligibilities = [],
    schedules = [],
  } = serviceWithDetails;

  const recurringSchedule = transformSchedules(schedules);
  const addresses = locations.map(transformLocationToAddress);

  // Build a minimal organization object for the service
  const resourceOrg: Organization = organization
    ? transformOrganization(organization)
    : {
        id: 0,
        name: "Unknown Organization",
        addresses,
        alternate_name: null,
        categories: [],
        certified_at: null,
        certified: false,
        email: null,
        featured: false,
        internal_note: null,
        legal_status: null,
        long_description: null,
        notes: [],
        phones: [],
        recurringSchedule,
        schedule: { id: 0, hours_known: false, schedule_days: [] },
        services: [],
        short_description: null,
        source_attribution: "SF Open Data",
        status: "approved",
        updated_at: new Date().toISOString(),
        verified_at: null,
        website: null,
      };

  return {
    id: parseInt(serviceWithDetails.id, 10) || 0,
    name: serviceWithDetails.name,
    addresses,
    alsoNamed: "",
    alternate_name: null,
    application_process: null,
    categories: categories.map(transformTaxonomyToCategory),
    certified_at: null,
    certified: false,
    documents: [],
    eligibilities: eligibilities.map(transformTaxonomyToEligibility),
    email: null,
    featured: null,
    fee: null,
    instructions: [],
    internal_note: null,
    interpretation_services: null,
    long_description: serviceWithDetails.description || null,
    notes: [],
    program: null,
    recurringSchedule,
    required_documents: null,
    resource: resourceOrg,
    schedule: {
      id: 0,
      hours_known: recurringSchedule.hoursKnown,
      schedule_days: [],
    },
    short_description: serviceWithDetails.description?.substring(0, 200) || "",
    source_attribution: "SF Open Data",
    status: "approved",
    updated_at: new Date().toISOString(),
    url: serviceWithDetails.url || null,
    verified_at: null,
    wait_time: null,
  };
}

/**
 * Transform locations to LocationDetails format for map display
 */
export function transformLocationsToLocationDetails(
  locations: SFLocation[],
  name: string,
  recurringSchedule: RecurringSchedule
): LocationDetails[] {
  return locations.map((loc) => ({
    id: parseInt(loc.id, 10) || 0,
    address: transformLocationToAddress(loc),
    name,
    recurringSchedule,
  }));
}

/**
 * Build detail actions from organization data
 */
export function buildDetailActions(org: {
  phones?: { number: string }[];
  addresses?: Address[];
}): DetailAction[] {
  const actions: DetailAction[] = [{ name: "Print", icon: "print" }];

  const phoneNumber = org.phones?.[0]?.number;
  if (phoneNumber) {
    actions.push({ name: "Call", icon: "phone", link: `tel:${phoneNumber}` });
  }

  const latitude = org.addresses?.[0]?.latitude;
  const longitude = org.addresses?.[0]?.longitude;
  if (latitude && longitude) {
    actions.push({
      name: "Directions",
      icon: "directions",
      link: `http://google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
    });
  }

  return actions;
}
