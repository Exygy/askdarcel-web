/**
 * Provider-agnostic search types and interfaces
 * These interfaces abstract away search provider specifics (Algolia, Typesense, etc.)
 */

export interface SearchCoordinates {
  lat: number;
  lng: number;
}

export interface SearchBoundingBox {
  topLeft: SearchCoordinates;
  bottomRight: SearchCoordinates;
}

export interface PhoneNumber {
  number: string;
  service_type?: string;
  country_code?: string;
}

export interface Address {
  id?: number;
  address_1: string;
  address_2?: string;
  city: string;
  state_province: string;
  postal_code?: string;
  country?: string;
  latitude: string;
  longitude: string;
}

export interface Location {
  id: string;
  lat: string;
  long: string;
  label: string;
  address?: Address;
}

/**
 * Complete SearchHit with all display fields
 * Providers are responsible for populating these fields
 */
export interface SearchHit {
  // Core identification
  id: string;
  name: string;
  type: "service" | "resource";

  // IDs for routing
  service_id?: number;
  resource_id?: number;

  // Location data
  _geoloc: SearchCoordinates;
  addresses?: Address[];

  // Contact information
  phones?: PhoneNumber[];
  email?: string;
  url?: string;
  website?: string;

  // Descriptions
  description?: string;
  long_description?: string;
  alternate_name?: string;

  // Organization fields (for services)
  organization_id?: string;
  organization_name?: string;
  organization_description?: string;
  organization_email?: string;
  organization_website?: string;

  // Service-specific fields
  application_process?: string;
  fees_description?: string;
  interpretation_services?: string;
  service_of?: string;

  // Flags and metadata
  is_mohcd_funded?: boolean;
  certified?: boolean;
  certified_at?: string;
  featured?: boolean;
  internal_note?: string;
  notes?: string;
  short_description?: string;
  source_attribution?: string;
  instructions?: unknown[];
  updated_at?: string;
  verified_at?: string;
  legal_status?: string;
  objectID?: string;

  // Categories and eligibilities
  categories?: unknown[];
  eligibilities?: unknown[];
  services?: unknown[];

  // Status
  status?: string;

  // Schedule information (use unknown to avoid circular dependency with models)
  schedule?: unknown[];
  resource_schedule?: unknown[];
  recurringSchedule?: unknown | null;

  // Computed display fields (populated by provider)
  resultListIndexDisplay?: string;
  longDescription?: string;
  path?: string;
  headline?: string;
  geoLocPath?: string;
  phoneNumber?: string | null;
  websiteUrl?: string | null;
  locations?: Location[];
  addressDisplay?: string;

  // Search metadata
  _highlightResult?: unknown;
  _rankingInfo?: unknown;
}

export interface SearchResults<T = SearchHit> {
  hits: T[];
  nbHits: number;
  page: number;
  nbPages: number;
  hitsPerPage: number;
  processingTimeMS: number;
  query: string;
  facets?: Record<string, Record<string, number>>;
}

export interface RefinementItem {
  label: string;
  value: string;
  count: number;
  isRefined: boolean;
}

export interface SearchConfig {
  query?: string;
  filters?: string;
  page?: number;
  hitsPerPage?: number;
  aroundLatLng?: string;
  aroundRadius?: number;
  aroundPrecision?: number;
  insideBoundingBox?: number[][];
  facets?: string[];
  minimumAroundRadius?: number;
}

export interface PaginationState {
  currentPage: number;
  nbPages: number;
  isFirstPage: boolean;
  isLastPage: boolean;
}

export interface SearchState {
  query: string;
  results: SearchResults | null;
  isSearching: boolean;
  error: Error | null;
  pagination: PaginationState;
  refinements: Record<string, string[]>;
}

/**
 * Provider capabilities - defines which features are available
 * This allows providers to declare what they support
 */
export interface ProviderCapabilities {
  /** Facetable fields available for refinements */
  facetableFields: string[];
  /** Sortable fields */
  sortableFields: string[];
  /** Supports geographic search */
  supportsGeoSearch: boolean;
  /** Supports text highlighting */
  supportsHighlighting: boolean;
}

/**
 * Base interface for search provider implementations
 */
export interface ISearchProvider {
  /** Get a single document by ID */
  getDocument(id: string): Promise<SearchHit | null>;

  /** Get the index/collection name */
  getIndexName(): string;

  /** Get InstantSearch-compatible client for React InstantSearch */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getLiteClient(): any;

  /** Get provider capabilities */
  getCapabilities(): ProviderCapabilities;
}
