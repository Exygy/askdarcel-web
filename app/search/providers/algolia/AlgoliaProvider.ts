import { liteClient as createLiteClient } from "algoliasearch/lite";
import { searchClient as createSearchClient } from "@algolia/client-search";
import config from "../../../config";
import type {
  ISearchProvider,
  SearchConfig,
  SearchResults,
  RefinementItem,
  SearchState,
  SearchHit,
} from "../../types";

/**
 * Algolia-specific implementation of the search provider interface
 * Wraps all Algolia/InstantSearch logic to isolate it from the rest of the app
 */
export class AlgoliaProvider implements ISearchProvider {
  private liteClient: ReturnType<typeof createLiteClient>;
  private fullClient: ReturnType<typeof createSearchClient>;
  private indexName: string;
  private state: SearchState;
  private listeners: Set<(state: SearchState) => void>;

  constructor() {
    this.liteClient = createLiteClient(
      config.ALGOLIA_APPLICATION_ID,
      config.ALGOLIA_READ_ONLY_API_KEY
    );

    this.fullClient = createSearchClient(
      config.ALGOLIA_APPLICATION_ID,
      config.ALGOLIA_READ_ONLY_API_KEY
    );

    this.indexName = `${config.ALGOLIA_INDEX_PREFIX}_services_search`;

    this.state = {
      query: "",
      results: null,
      isSearching: false,
      error: null,
      pagination: {
        currentPage: 0,
        nbPages: 0,
        isFirstPage: true,
        isLastPage: true,
      },
      refinements: {},
    };

    this.listeners = new Set();
  }

  /**
   * Get the lite client for InstantSearch usage
   * This is the client that should be passed to <InstantSearch> component
   */
  getLiteClient() {
    return this.liteClient;
  }

  /**
   * Get the full client for direct API calls
   * Used for operations not supported by InstantSearch
   */
  getFullClient() {
    return this.fullClient;
  }

  /**
   * Get the index name
   */
  getIndexName(): string {
    return this.indexName;
  }

  async search(searchConfig: SearchConfig): Promise<SearchResults> {
    this.updateState({ isSearching: true, error: null });

    try {
      const response = await this.liteClient.search([
        {
          indexName: this.indexName,
          params: this.buildAlgoliaParams(searchConfig),
        },
      ]);

      const result = response.results[0];

      // Type guard to ensure we have a search response, not a facet values response
      if (!("hits" in result)) {
        throw new Error("Invalid search response");
      }

      const searchResults: SearchResults = {
        hits: result.hits as unknown as SearchHit[],
        nbHits: result.nbHits ?? 0,
        page: result.page ?? 0,
        nbPages: result.nbPages ?? 0,
        hitsPerPage: result.hitsPerPage ?? 40,
        processingTimeMS: result.processingTimeMS ?? 0,
        query: result.query,
        facets: result.facets,
      };

      this.updateState({
        results: searchResults,
        isSearching: false,
        query: searchConfig.query || "",
        pagination: {
          currentPage: result.page ?? 0,
          nbPages: result.nbPages ?? 0,
          isFirstPage: (result.page ?? 0) === 0,
          isLastPage: (result.page ?? 0) === (result.nbPages ?? 0) - 1,
        },
      });

      return searchResults;
    } catch (error) {
      this.updateState({
        isSearching: false,
        error: error as Error,
      });
      throw error;
    }
  }

  private buildAlgoliaParams(
    searchConfig: SearchConfig
  ): Record<string, unknown> {
    const params: Record<string, unknown> = {};

    if (searchConfig.query !== undefined) params.query = searchConfig.query;
    if (searchConfig.filters) params.filters = searchConfig.filters;
    if (searchConfig.page !== undefined) params.page = searchConfig.page;
    if (searchConfig.hitsPerPage) params.hitsPerPage = searchConfig.hitsPerPage;
    if (searchConfig.aroundLatLng)
      params.aroundLatLng = searchConfig.aroundLatLng;
    if (searchConfig.aroundRadius !== undefined)
      params.aroundRadius = searchConfig.aroundRadius;
    if (searchConfig.aroundPrecision)
      params.aroundPrecision = searchConfig.aroundPrecision;
    if (searchConfig.insideBoundingBox)
      params.insideBoundingBox = searchConfig.insideBoundingBox;
    if (searchConfig.facets) params.facets = searchConfig.facets;
    if (searchConfig.minimumAroundRadius)
      params.minimumAroundRadius = searchConfig.minimumAroundRadius;

    return params;
  }

  getRefinements(attribute: string): RefinementItem[] {
    // This will be populated by InstantSearch hooks in the context
    // For now, return empty array - full implementation in Phase 3
    // Attribute will be used in Phase 3: ${attribute}
    return [];
  }

  refine(attribute: string, value: string): void {
    // Implemented through InstantSearch hooks in context
    // Will be used in Phase 3: ${attribute}, ${value}
  }

  clearRefinements(): void {
    // Implemented through InstantSearch hooks in context
    this.updateState({ refinements: {} });
  }

  clearRefinement(attribute: string): void {
    // Implemented through InstantSearch hooks in context
    const newRefinements = { ...this.state.refinements };
    delete newRefinements[attribute];
    this.updateState({ refinements: newRefinements });
  }

  goToPage(page: number): void {
    this.updateState({
      pagination: {
        ...this.state.pagination,
        currentPage: page,
      },
    });
  }

  getState(): SearchState {
    return { ...this.state };
  }

  subscribe(listener: (state: SearchState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private updateState(updates: Partial<SearchState>): void {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach((listener) => listener(this.state));
  }
}

// Singleton instance
let algoliaProviderInstance: AlgoliaProvider | null = null;

export function getAlgoliaProvider(): AlgoliaProvider {
  if (!algoliaProviderInstance) {
    algoliaProviderInstance = new AlgoliaProvider();
  }
  return algoliaProviderInstance;
}
