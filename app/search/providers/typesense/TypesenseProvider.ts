import Typesense, { type Client } from "typesense";
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter";
import config from "../../../config";
import type {
  ISearchProvider,
  SearchHit,
  SearchCoordinates,
} from "../../types";

/**
 * Typesense-specific implementation of the search provider interface
 * Works with React InstantSearch via the TypesenseInstantSearchAdapter
 *
 * Note: Search queries go through React InstantSearch directly to Typesense,
 * bypassing the search() method. The provider mainly handles:
 * - InstantSearch adapter initialization (getLiteClient)
 * - Individual document retrieval (getDocument)
 * - Provider capabilities reporting (getCapabilities)
 */
export class TypesenseProvider implements ISearchProvider {
  private client: Client;
  private instantSearchAdapter: TypesenseInstantSearchAdapter;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private cachedSearchClient: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private lastRequestHash: string | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private lastRequestResult: any = null;

  constructor() {
    this.client = new Typesense.Client({
      nodes: [
        {
          host: config.TYPESENSE_HOST || "localhost",
          port: parseInt(config.TYPESENSE_PORT || "8108", 10),
          protocol: config.TYPESENSE_PROTOCOL || "http",
        },
      ],
      apiKey: config.TYPESENSE_API_KEY,
      connectionTimeoutSeconds: 2,
    });

    // Initialize InstantSearch adapter for React InstantSearch compatibility
    this.instantSearchAdapter = new TypesenseInstantSearchAdapter({
      server: {
        apiKey: config.TYPESENSE_API_KEY,
        nodes: [
          {
            host: config.TYPESENSE_HOST || "localhost",
            port: parseInt(config.TYPESENSE_PORT || "8108", 10),
            protocol: config.TYPESENSE_PROTOCOL || "http",
          },
        ],
        // Send API key as header instead of query parameter
        sendApiKeyAsQueryParam: false,
      },
      additionalSearchParameters: {
        query_by: "name,description,organization_name",
      },
      geoLocationField: "locations",
    });
  }

  /**
   * Get the current index/collection name
   */
  getIndexName(): string {
    return "resources";
  }

  /**
   * Get the InstantSearch-compatible client for React InstantSearch
   * React InstantSearch uses this to make search requests directly to Typesense
   *
   * We wrap the adapter's searchClient to normalize empty responses and prevent
   * infinite loops when no results are found.
   *
   * IMPORTANT: The wrapper is cached and reused. If we create a new wrapper on each call,
   * React InstantSearch sees a different client object each render and retries excessively.
   */
  getLiteClient() {
    // Return cached wrapper if already created
    if (this.cachedSearchClient !== null) {
      return this.cachedSearchClient;
    }

    const baseSearchClient = this.instantSearchAdapter.searchClient;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.cachedSearchClient = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      search: async (requests: any[]) => {
        // Create a hash of the request to detect duplicates
        const requestHash = JSON.stringify(requests);

        // If this is the exact same request as the last one, return cached result immediately
        if (
          requestHash === this.lastRequestHash &&
          this.lastRequestResult !== null
        ) {
          return this.lastRequestResult;
        }

        const responses = await baseSearchClient.search(requests);

        // Normalize responses to ensure all required fields are present
        // This prevents infinite loops when results are empty
        // eslint-disable-next-line @typescript-eslint/no-explicit-any

        const normalizedResults = responses.results.map((result: any) => {
          // Transform hits to add locations field from _geoloc
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          console.log("Raw Typesense hit:", result.hits);
          const transformedHits = (result.hits || []).map(
            (hit: any, index: number) => {
              // Compute locations from _geoloc
              const locations = this.extractLocationsFromGeoloc(
                hit.locations,
                index + 1
              );
              return {
                ...hit,
                locations,
              };
            }
          );

          // Ensure required fields exist even when empty
          return {
            ...result,
            hits: transformedHits,
            nbHits: result.nbHits ?? result.found ?? 0,
            nbPages: Math.ceil(
              (result.nbHits ?? result.found ?? 0) / (result.per_page ?? 20)
            ),
            page: result.page ?? 0,
            processingTimeMS: result.processingTimeMS ?? 0,
          };
        });

        const result = {
          results: normalizedResults,
        };

        // Cache this request and result for deduplication
        this.lastRequestHash = requestHash;
        this.lastRequestResult = result;

        return result;
      },
    };

    return this.cachedSearchClient;
  }

  /**
   * Get provider capabilities
   * Defines which features are currently available in Typesense
   */
  getCapabilities() {
    return {
      facetableFields: [] as string[],
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
      const resourceCollection = this.client.collections("resources");
      const resourceDocuments = resourceCollection.documents();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const doc: any = await (resourceDocuments as any).retrieve(id);

      if (!doc) {
        return null;
      }

      // Extract first coordinate as primary geoloc
      let geoloc: SearchCoordinates = { lat: 0, lng: 0 };
      if (doc._geoloc && Array.isArray(doc._geoloc) && doc._geoloc.length > 0) {
        const [lat, lng] = doc._geoloc[0];
        geoloc = { lat, lng };
      }

      // Return the document with computed fields
      return {
        ...doc,
        _geoloc: geoloc,
        locations: this.extractLocationsFromGeoloc(doc._geoloc, 1),
      } as SearchHit;
    } catch {
      // Document not found or other error
      return null;
    }
  }

  /**
   * Extract locations from Typesense _geoloc field
   * Typesense stores geopoints as array of coordinate pairs: [[lat, lng], [lat, lng], ...]
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private extractLocationsFromGeoloc(locationsField: any, resultIndex: number) {
    if (!Array.isArray(locationsField) || locationsField.length === 0) {
      return [];
    }

    const locations = [];

    // Process each [lat, lng] pair from Typesense
    for (let i = 0; i < locationsField.length; i++) {
      const coord = locationsField[i];
      if (Array.isArray(coord) && coord.length >= 2) {
        const [lat, lng] = coord;
        locations.push({
          id: `${resultIndex}-${i}`,
          lat: lat.toString(),
          long: lng.toString(),
          label: i === 0 ? resultIndex.toString() : `${resultIndex}.${i + 1}`,
        });
      }
    }

    return locations;
  }
}

// Singleton instance
let typesenseProviderInstance: TypesenseProvider | null = null;

export function getTypesenseProvider(): TypesenseProvider {
  if (!typesenseProviderInstance) {
    typesenseProviderInstance = new TypesenseProvider();
  }
  return typesenseProviderInstance;
}
