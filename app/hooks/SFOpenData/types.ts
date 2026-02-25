/**
 * Type definitions for SF Open Data API (data.sfgov.org)
 * These types represent the raw API responses from the SF social services directory.
 */

// Base API response types
export interface SFOpenDataPoint {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

// Organization from /resource/ddhd-yzyc.json
export interface SFOrganization {
  id: string;
  name: string;
  email?: string;
  website?: string;
  description?: string;
}

// Service from /resource/ga45-xynq.json
export interface SFService {
  id: string;
  name: string;
  description?: string;
  organization_id: string;
  url?: string;
}

// Location from /resource/rwbr-kbhe.json
export interface SFLocation {
  id: string;
  organization_id?: string;
  name?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  latitude?: string;
  longitude?: string;
  point?: SFOpenDataPoint;
  analysis_neighborhood?: string;
  supervisor_district?: string;
}

// Service↔Location join table from /resource/my66-wiiw.json
export interface SFServiceAtLocation {
  id: string;
  location_id: string;
  service_id: string;
}

// Taxonomy from /resource/r7ep-tutk.json
export type SFTaxonomyLinkType = "our415_categories" | "our415_tags_services";
export type SFTaxonomyLinkEntity = "service" | "organization";

export interface SFTaxonomy {
  id: string;
  link_id: string;
  link_type: SFTaxonomyLinkType;
  link_entity: SFTaxonomyLinkEntity;
  taxonomy_term_id: string;
  taxonomy_term: string;
  parent_id?: string | null;
}

// Schedule from /resource/etrb-d3bg.json
export interface SFSchedule {
  id: string;
  service_id: string;
  timezone?: string;
  freq?: string;
  interval?: string;
  byday?: string;
  opens_at?: string;
  closes_at?: string;
}

// Hook result types
export interface SFOpenDataHookResult<T> {
  data: T | null;
  error?: Error;
  isLoading: boolean;
}

// Query filter types
export interface SFServiceFilters {
  organizationId?: string;
  searchQuery?: string;
}

export interface SFLocationFilters {
  organizationId?: string;
  ids?: string[];
}

export interface SFTaxonomyFilters {
  linkId: string;
  linkEntity: SFTaxonomyLinkEntity;
  linkType: SFTaxonomyLinkType;
}

// Composite types for enriched data
export interface SFServiceWithDetails extends SFService {
  organization?: SFOrganization;
  locations?: SFLocation[];
  categories?: SFTaxonomy[];
  eligibilities?: SFTaxonomy[];
  schedules?: SFSchedule[];
}
