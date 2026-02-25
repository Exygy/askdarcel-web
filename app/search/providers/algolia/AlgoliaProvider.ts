import { liteClient as createLiteClient } from "algoliasearch/lite";
import { searchClient as createSearchClient } from "@algolia/client-search";
import config from "../../../config";
import type { ISearchProvider, SearchHit } from "../../types";

/**
 * Algolia-specific implementation of the search provider interface
 * Wraps Algolia's lite client for use with React InstantSearch
 *
 * Note: This provider only implements methods directly used by the app.
 * React InstantSearch bypasses provider.search() entirely and talks directly
 * to the search backend through the lite client. State management, refinements,
 * and pagination are all handled by React InstantSearch's built-in hooks.
 */
export class AlgoliaProvider implements ISearchProvider {
  private liteClient: ReturnType<typeof createLiteClient>;
  private fullClient: ReturnType<typeof createSearchClient>;

  constructor() {
    this.liteClient = createLiteClient(
      config.ALGOLIA_APPLICATION_ID,
      config.ALGOLIA_READ_ONLY_API_KEY
    );

    this.fullClient = createSearchClient(
      config.ALGOLIA_APPLICATION_ID,
      config.ALGOLIA_READ_ONLY_API_KEY
    );
  }

  /**
   * Get the lite client for InstantSearch usage
   * React InstantSearch uses this to make search requests directly to Algolia
   */
  getLiteClient() {
    return this.liteClient;
  }

  /**
   * Get the index name
   */
  getIndexName(): string {
    return `${config.ALGOLIA_INDEX_PREFIX}_services_search`;
  }

  /**
   * Get provider capabilities
   * Algolia supports full feature set
   */
  getCapabilities() {
    return {
      facetableFields: ["categories", "eligibilities", "open_times"],
      sortableFields: ["name"],
      supportsGeoSearch: true,
      supportsHighlighting: true,
    };
  }

  /**
   * Retrieve a single document by ID
   * Used by ServiceDetailPage as a fallback when the full record isn't loaded
   */
  async getDocument(id: string): Promise<SearchHit | null> {
    try {
      const indexName = `${config.ALGOLIA_INDEX_PREFIX}_services_search`;
      const result = await this.fullClient.getObject({
        indexName,
        objectID: id,
      });

      // Algolia objects are already in SearchHit format
      return result as unknown as SearchHit;
    } catch {
      // Document not found or other error
      return null;
    }
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
