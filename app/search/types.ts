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

export interface SearchHit {
  id: string;
  name: string;
  type: "service" | "resource";
  _geoloc: SearchCoordinates;
  [key: string]: unknown;
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
  aroundRadius?: number | "all";
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
 * Base interface for search provider implementations
 */
export interface ISearchProvider {
  /** Execute a search query */
  search(config: SearchConfig): Promise<SearchResults>;

  /** Get refinement/facet data for an attribute */
  getRefinements(attribute: string): RefinementItem[];

  /** Apply a refinement filter */
  refine(attribute: string, value: string): void;

  /** Clear all refinements */
  clearRefinements(): void;

  /** Clear specific refinements for an attribute */
  clearRefinement(attribute: string): void;

  /** Navigate to a specific page */
  goToPage(page: number): void;

  /** Get current search state */
  getState(): SearchState;

  /** Subscribe to state changes */
  subscribe(listener: (state: SearchState) => void): () => void;
}
