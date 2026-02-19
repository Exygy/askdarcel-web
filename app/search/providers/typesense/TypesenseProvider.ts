import Typesense, { type Client } from "typesense";
import TypesenseInstantSearchAdapter from "typesense-instantsearch-adapter";
import config from "../../../config";
import type {
  ISearchProvider,
  SearchHit,
  SearchCoordinates,
  Address,
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
  // Dedup: store the last request key and response Promise so identical
  // consecutive searches return the exact same Promise object reference,
  // avoiding redundant network requests.
  private lastRequestKey = "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private lastResponsePromise: Promise<any> | null = null;

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
        // For wildcard (q=*) queries every document ties on _text_match,
        // so the secondary sort (name:asc) controls ordering. This gives
        // alphabetical A→Z results which naturally distributes different
        // service types across the result set instead of clustering
        // duplicates (e.g. many Zumba classes) together.
        // sort_by: "_text_match:desc,name:asc",
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
      search: (requests: any[]): Promise<any> => {
        // Strip geo params from requests that have no category filter.
        // When navigating from a browse page (which uses geo filtering) to
        // the text search page, InstantSearch's helper retains stale geo
        // params (insideBoundingBox, aroundLatLng, etc.) across page
        // transitions. On a fresh page load these params are never set,
        // so we replicate that clean state here.
        const cleanedRequests = requests.map((req: any) => {
          const params = req.params || req;
          const filters = params.filters;
          const query = params.query;

          // Strip geo params from text-query requests with no category
          // filter to prevent stale geo constraints from browse pages.
          if (!filters && query) {
            const {
              insideBoundingBox,
              aroundLatLng: _aroundLatLng,
              aroundRadius,
              aroundPrecision,
              minimumAroundRadius,
              ...cleanParams
            } = params;
            return req.params ? { ...req, params: cleanParams } : cleanParams;
          }

          return req;
        });

        // TODO: Dynamic sort_by for discovery queries (randomization).
        // Uncomment to use random sort for wildcard queries (q=* or empty)
        // so users see a varied mix of services instead of strict A→Z.
        // The adapter reads sort_by from additionalSearchParameters
        // internally (not from per-request params), so we mutate it directly.
        //
        // const firstParams =
        //   cleanedRequests[0]?.params || cleanedRequests[0] || {};
        // const queryStr = ((firstParams.query as string) ?? "").trim();
        // const isWildcard = queryStr === "" || queryStr === "*";
        // // eslint-disable-next-line @typescript-eslint/no-explicit-any
        // const adapterConfig = (this.instantSearchAdapter as any).configuration;
        // adapterConfig.additionalSearchParameters.sort_by = isWildcard
        //   ? "_rand(42):asc"
        //   : "_text_match:desc,name:asc";

        // Return the exact same Promise for identical consecutive requests.
        // Because the function is NOT async, we return the same Promise
        // object reference, avoiding redundant network requests.
        const requestKey = JSON.stringify(cleanedRequests);
        if (requestKey === this.lastRequestKey && this.lastResponsePromise) {
          return this.lastResponsePromise;
        }

        // Build the response promise and cache it.
        const responsePromise = baseSearchClient.search(cleanedRequests).then(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (responses: any) => {
            // Normalize responses to ensure all required fields are present
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const normalizedResults = responses.results.map((result: any) => {
              // Transform hits to add locations field from _geoloc
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const transformedHits = (result.hits || []).map(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (hit: any, index: number) => {
                  const locations = this.extractLocationsFromGeoloc(
                    hit.locations,
                    index + 1,
                    hit.addresses
                  );
                  return {
                    ...hit,
                    locations,
                    addressDisplay: this.computeAddressDisplay(hit),
                  };
                }
              );

              return {
                ...result,
                hits: transformedHits,
                nbHits: result.nbHits ?? result.found ?? 0,
                nbPages: Math.ceil(
                  (result.nbHits ?? result.found ?? 0) /
                    (result.hitsPerPage || 20)
                ),
                page: result.page ?? 0,
                processingTimeMS: result.processingTimeMS ?? 0,
              };
            });

            return { results: normalizedResults };
          }
        );

        this.lastRequestKey = requestKey;
        this.lastResponsePromise = responsePromise;
        return responsePromise;
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
      facetableFields: ["eligibilities"],
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
        locations: this.extractLocationsFromGeoloc(
          doc._geoloc,
          1,
          doc.addresses
        ),
        addressDisplay: this.computeAddressDisplay(doc),
      } as SearchHit;
    } catch {
      // Document not found or other error
      return null;
    }
  }

  /**
   * Compute a display string for the address based on the addresses array.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private computeAddressDisplay(hit: any): string {
    const addresses: Address[] | undefined = hit.addresses;
    if (!addresses || addresses.length === 0) {
      return "No address found";
    }
    if (addresses.length > 1) {
      return "This service has multiple locations";
    }
    return addresses[0].address_1 || "No address found";
  }

  /**
   * Extract locations from Typesense _geoloc field
   * Typesense stores geopoints as array of coordinate pairs: [[lat, lng], [lat, lng], ...]
   * Optionally attaches the corresponding address to each location (index-aligned).
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private extractLocationsFromGeoloc(
    locationsField: any,
    resultIndex: number,
    addresses?: Address[]
  ) {
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
          address: addresses?.[i] || undefined,
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
