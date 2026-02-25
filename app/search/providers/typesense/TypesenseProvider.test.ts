/**
 * Tests for TypesenseProvider's search client wrapper.
 *
 * These tests validate the core search interaction flows without hitting
 * Typesense. We mock the underlying adapter and verify that the wrapper
 * correctly strips geo params, deduplicates requests, and normalizes hits.
 */

// --- Mocks (must be before imports) ---

const mockAdapterSearch = jest.fn();

jest.mock("typesense-instantsearch-adapter", () => {
  return jest.fn().mockImplementation(() => ({
    searchClient: {
      search: mockAdapterSearch,
    },
    // configuration: {
    //   additionalSearchParameters: {
    //     sort_by: "_text_match:desc,name:asc",
    //   },
    // },
  }));
});

jest.mock("typesense", () => ({
  Client: jest.fn().mockImplementation(() => ({
    collections: jest.fn(),
  })),
}));

jest.mock("../../../config", () => ({
  __esModule: true,
  default: {
    TYPESENSE_HOST: "localhost",
    TYPESENSE_PORT: "8108",
    TYPESENSE_PROTOCOL: "http",
    TYPESENSE_API_KEY: "test-key",
  },
}));

// eslint-disable-next-line import/first
import { TypesenseProvider } from "./TypesenseProvider";

// Helper: create a minimal adapter response
function makeAdapterResponse(
  hits: any[] = [],
  nbHits = 0,
  extras: Record<string, any> = {}
) {
  return {
    results: [
      {
        hits,
        nbHits,
        page: 0,
        processingTimeMS: 1,
        ...extras,
      },
    ],
  };
}

describe("TypesenseProvider – getLiteClient().search()", () => {
  let provider: TypesenseProvider;
  let searchClient: ReturnType<TypesenseProvider["getLiteClient"]>;

  beforeEach(() => {
    mockAdapterSearch.mockReset();
    mockAdapterSearch.mockResolvedValue(makeAdapterResponse());
    // Create a fresh provider for each test
    provider = new TypesenseProvider();
    searchClient = provider.getLiteClient();
  });

  // ---------------------------------------------------------------
  // Flow: Text search – geo params are now preserved (no stripping)
  // Each page manages its own geo params via <Configure>.
  // ---------------------------------------------------------------
  describe("geo-param preservation (text search – has query, no filters)", () => {
    it("does not strip geo params from requests with query and no filters", async () => {
      const request = {
        params: {
          query: "food",
          hitsPerPage: 40,
          insideBoundingBox: [[37.8, -122.5, 37.7, -122.4]],
          aroundLatLng: "37.78,-122.42",
          aroundRadius: 1600,
          aroundPrecision: 100,
          minimumAroundRadius: 500,
        },
      };

      await searchClient.search([request]);

      const sentRequests = mockAdapterSearch.mock.calls[0][0];
      const sentParams = sentRequests[0].params;

      // Geo params should be preserved
      expect(sentParams.insideBoundingBox).toEqual([
        [37.8, -122.5, 37.7, -122.4],
      ]);
      expect(sentParams.aroundLatLng).toBe("37.78,-122.42");
      expect(sentParams.aroundRadius).toBe(1600);
      expect(sentParams.aroundPrecision).toBe(100);
      expect(sentParams.minimumAroundRadius).toBe(500);

      // Non-geo params should also be preserved
      expect(sentParams.query).toBe("food");
      expect(sentParams.hitsPerPage).toBe(40);
    });

    it("does not strip geo params when query is present and filters is empty string", async () => {
      const request = {
        params: {
          query: "shelter",
          filters: "",
          aroundLatLng: "37.78,-122.42",
        },
      };

      await searchClient.search([request]);

      const sentParams = mockAdapterSearch.mock.calls[0][0][0].params;
      // Geo params should be preserved even with empty filters
      expect(sentParams.aroundLatLng).toBe("37.78,-122.42");
      expect(sentParams.query).toBe("shelter");
    });
  });

  // ---------------------------------------------------------------
  // Flow: All Services = geo preserved (no query, no filters)
  // ---------------------------------------------------------------
  describe("geo-param preservation (All Services – no query, no filters)", () => {
    it("preserves geo params when request has no query and no filters", async () => {
      const request = {
        params: {
          query: "",
          hitsPerPage: 40,
          aroundLatLng: "37.78,-122.42",
          aroundRadius: 1600,
          aroundPrecision: 100,
          minimumAroundRadius: 500,
        },
      };

      await searchClient.search([request]);

      const sentParams = mockAdapterSearch.mock.calls[0][0][0].params;

      // Geo params should be preserved for All Services
      expect(sentParams.aroundLatLng).toBe("37.78,-122.42");
      expect(sentParams.aroundRadius).toBe(1600);
      expect(sentParams.aroundPrecision).toBe(100);
      expect(sentParams.minimumAroundRadius).toBe(500);
      expect(sentParams.query).toBe("");
    });

    it("preserves geo params when query is undefined and no filters", async () => {
      const request = {
        params: {
          hitsPerPage: 40,
          aroundLatLng: "37.78,-122.42",
          aroundRadius: 1600,
        },
      };

      await searchClient.search([request]);

      const sentParams = mockAdapterSearch.mock.calls[0][0][0].params;
      expect(sentParams.aroundLatLng).toBe("37.78,-122.42");
      expect(sentParams.aroundRadius).toBe(1600);
    });
  });

  // ---------------------------------------------------------------
  // Flow: Category + Eligibility = combined (geo params preserved)
  // ---------------------------------------------------------------
  describe("geo-param preservation (browse page – has filters)", () => {
    it("preserves geo params when request has filters", async () => {
      const request = {
        params: {
          query: "",
          filters: "categories:Housing",
          hitsPerPage: 40,
          insideBoundingBox: [[37.8, -122.5, 37.7, -122.4]],
          aroundLatLng: "37.78,-122.42",
          aroundRadius: 1600,
        },
      };

      await searchClient.search([request]);

      const sentParams = mockAdapterSearch.mock.calls[0][0][0].params;

      // ALL params should be preserved when filters is present
      expect(sentParams.insideBoundingBox).toEqual([
        [37.8, -122.5, 37.7, -122.4],
      ]);
      expect(sentParams.aroundLatLng).toBe("37.78,-122.42");
      expect(sentParams.aroundRadius).toBe(1600);
      expect(sentParams.filters).toBe("categories:Housing");
    });
  });

  // ---------------------------------------------------------------
  // Request deduplication
  // ---------------------------------------------------------------
  describe("request deduplication", () => {
    it("returns the same response object for identical consecutive requests", async () => {
      const request = { params: { query: "food" } };

      const response1 = await searchClient.search([request]);
      const response2 = await searchClient.search([request]);

      // Same object reference – prevents InstantSearch re-render loops
      expect(response1).toBe(response2);
      // Adapter should only be called once
      expect(mockAdapterSearch).toHaveBeenCalledTimes(1);
    });

    it("returns a new response for different requests", async () => {
      mockAdapterSearch
        .mockResolvedValueOnce(makeAdapterResponse([], 0))
        .mockResolvedValueOnce(makeAdapterResponse([], 5));

      const response1 = await searchClient.search([
        { params: { query: "food" } },
      ]);
      const response2 = await searchClient.search([
        { params: { query: "shelter" } },
      ]);

      expect(response1).not.toBe(response2);
      expect(mockAdapterSearch).toHaveBeenCalledTimes(2);
    });
  });

  // ---------------------------------------------------------------
  // Hit normalization
  // ---------------------------------------------------------------
  describe("hit normalization", () => {
    it("computes addressDisplay for single address", async () => {
      mockAdapterSearch.mockResolvedValueOnce(
        makeAdapterResponse(
          [
            {
              id: "1",
              name: "Food Bank",
              addresses: [{ address_1: "123 Main St" }],
              locations: [],
            },
          ],
          1
        )
      );

      const response = await searchClient.search([
        { params: { query: "food" } },
      ]);

      expect(response.results[0].hits[0].addressDisplay).toBe("123 Main St");
    });

    it("computes addressDisplay for multiple addresses", async () => {
      mockAdapterSearch.mockResolvedValueOnce(
        makeAdapterResponse(
          [
            {
              id: "2",
              name: "Multi Location",
              addresses: [
                { address_1: "123 Main St" },
                { address_1: "456 Oak Ave" },
              ],
              locations: [],
            },
          ],
          1
        )
      );

      const response = await searchClient.search([
        { params: { query: "multi" } },
      ]);

      expect(response.results[0].hits[0].addressDisplay).toBe(
        "This service has multiple locations"
      );
    });

    it("computes addressDisplay when no addresses exist", async () => {
      mockAdapterSearch.mockResolvedValueOnce(
        makeAdapterResponse([{ id: "3", name: "No Address", locations: [] }], 1)
      );

      const response = await searchClient.search([
        { params: { query: "none" } },
      ]);

      expect(response.results[0].hits[0].addressDisplay).toBe(
        "No address found"
      );
    });

    it("extracts locations from coordinate pairs", async () => {
      mockAdapterSearch.mockResolvedValueOnce(
        makeAdapterResponse(
          [
            {
              id: "4",
              name: "Located Service",
              locations: [
                [37.78, -122.42],
                [37.79, -122.43],
              ],
              addresses: [
                { address_1: "123 Main St" },
                { address_1: "456 Oak Ave" },
              ],
            },
          ],
          1
        )
      );

      const response = await searchClient.search([
        { params: { query: "located" } },
      ]);

      const locations = response.results[0].hits[0].locations;
      expect(locations).toHaveLength(2);
      expect(locations[0]).toEqual({
        id: "1-0",
        lat: "37.78",
        long: "-122.42",
        label: "1",
        address: { address_1: "123 Main St" },
      });
      expect(locations[1]).toEqual({
        id: "1-1",
        lat: "37.79",
        long: "-122.43",
        label: "1.2",
        address: { address_1: "456 Oak Ave" },
      });
    });
  });

  // ---------------------------------------------------------------
  // nbPages calculation
  // ---------------------------------------------------------------
  describe("nbPages calculation", () => {
    it("calculates correct nbPages when hitsPerPage is 40", async () => {
      mockAdapterSearch.mockResolvedValueOnce(
        makeAdapterResponse([], 100, { hitsPerPage: 40 })
      );

      const response = await searchClient.search([
        { params: { query: "test" } },
      ]);

      expect(response.results[0].nbPages).toBe(3);
    });

    it("handles facet-only requests where hitsPerPage is 0", async () => {
      mockAdapterSearch.mockResolvedValueOnce(
        makeAdapterResponse([], 100, { hitsPerPage: 0 })
      );

      const response = await searchClient.search([
        { params: { query: "test" } },
      ]);

      // hitsPerPage 0 should fall back to 20, not produce Infinity
      expect(response.results[0].nbPages).toBe(5);
      expect(response.results[0].nbPages).not.toBe(Infinity);
    });

    it("calculates nbPages as 1 for results fewer than hitsPerPage", async () => {
      mockAdapterSearch.mockResolvedValueOnce(
        makeAdapterResponse([], 15, { hitsPerPage: 40 })
      );

      const response = await searchClient.search([
        { params: { query: "test" } },
      ]);

      expect(response.results[0].nbPages).toBe(1);
    });
  });

  // ---------------------------------------------------------------
  // Cached client identity
  // ---------------------------------------------------------------
  describe("client caching", () => {
    it("returns the same client object on repeated calls", () => {
      const client1 = provider.getLiteClient();
      const client2 = provider.getLiteClient();
      expect(client1).toBe(client2);
    });
  });
});
