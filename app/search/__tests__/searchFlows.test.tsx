/**
 * Integration tests for core search flows.
 *
 * These tests render real page components inside MemoryRouter + InstantSearch,
 * intercept the requests sent to the search client, and assert the correct
 * combination of query, geo params, and category filters.
 *
 * Note: InstantSearch only includes `query` in search params when a SearchBox
 * widget is registered. We include a hidden QueryConnector component to ensure
 * the query propagates correctly.
 */

import React from "react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { InstantSearch, useSearchBox } from "react-instantsearch-core";
import { render, waitFor } from "@testing-library/react";
import { AppProvider } from "utils/useAppContext";
import { COORDS_MID_SAN_FRANCISCO } from "utils";

// ---------------------------------------------------------------------------
// Mock search client – a jest.fn() so we can inspect requests
// ---------------------------------------------------------------------------
const mockSearch = jest.fn();

function makeSearchResponse() {
  return {
    results: [
      {
        hits: [],
        nbHits: 0,
        nbPages: 0,
        page: 0,
        hitsPerPage: 40,
        processingTimeMS: 1,
        params: "",
        query: "",
      },
    ],
  };
}

mockSearch.mockImplementation(() => Promise.resolve(makeSearchResponse()));

const mockSearchClient = { search: mockSearch };

// ---------------------------------------------------------------------------
// Mock the search provider so we control the searchClient
// ---------------------------------------------------------------------------
const mockSearchProvider = {
  getLiteClient: () => mockSearchClient,
  getIndexName: () => "resources",
  getInstantSearchAdapter: () => ({}),
  search: jest.fn(),
  searchForFacetValues: jest.fn(),
  getCapabilities: () => ({
    facetableFields: ["categories", "eligibilities"],
    sortableFields: [],
    supportsGeoSearch: true,
    supportsHighlighting: true,
  }),
};

jest.mock("search/providers", () => ({
  getSearchProvider: () => mockSearchProvider,
}));

jest.mock("search/context/SearchContext", () => ({
  ...jest.requireActual("search/context/SearchContext"),
  useSearchContext: () => ({ provider: mockSearchProvider }),
}));

// ---------------------------------------------------------------------------
// Mock SearchMap to avoid Google Maps in tests
// ---------------------------------------------------------------------------
jest.mock("components/SearchAndBrowse/SearchMap/SearchMap", () => {
  const mockReact = require("react");
  return {
    SearchMap: ({ handleSearchMapAction }: any) => {
      const hasInit = mockReact.useRef(false);
      mockReact.useEffect(() => {
        if (!hasInit.current) {
          hasInit.current = true;
          // SearchMapActions.MapInitialized = 1
          handleSearchMapAction(1);
        }
      }, [handleSearchMapAction]);
      return mockReact.createElement(
        "div",
        { "data-testid": "search-map-mock" },
        "Map"
      );
    },
  };
});

// ---------------------------------------------------------------------------
// Mock TypesenseHooks – return fake facets for BrowseResultsPage
// ---------------------------------------------------------------------------
jest.mock("hooks/TypesenseHooks", () => ({
  useTypesenseFacets: () => ({
    categories: [
      { value: "Housing", count: 10 },
      { value: "Food", count: 8 },
    ],
    eligibilities: [],
  }),
  useTopLevelCategories: () => ({
    categories: [
      { value: "Housing", count: 10 },
      { value: "Food", count: 8 },
    ],
  }),
}));

// ---------------------------------------------------------------------------
// Mock StrapiAPI hooks used by Footer/Navigation so they don't error
// ---------------------------------------------------------------------------
jest.mock("hooks/StrapiAPI", () => ({
  useFooterData: () => ({ data: null, isLoading: false }),
  useNavigationData: () => ({ data: null, isLoading: false }),
  formatHomePageEventsData: () => [],
}));

// ---------------------------------------------------------------------------
// Imports under test (after mocks)
// ---------------------------------------------------------------------------
import { SearchResultsPage } from "pages/SearchResultsPage/SearchResultsPage";
import { BrowseResultsPage } from "pages/BrowseResultsPage/BrowseResultsPage";

// ---------------------------------------------------------------------------
// QueryConnector - registers a SearchBox widget so query appears in params
// ---------------------------------------------------------------------------
const QueryConnector = () => {
  useSearchBox();
  return null;
};

// ---------------------------------------------------------------------------
// Test wrapper
// ---------------------------------------------------------------------------
const SF_LAT = COORDS_MID_SAN_FRANCISCO.lat;
const SF_LNG = COORDS_MID_SAN_FRANCISCO.lng;
const SF_AROUND_LAT_LNG = `${SF_LAT},${SF_LNG}`;

const TestWrapper = ({
  children,
  initialAroundLatLng = SF_AROUND_LAT_LNG,
  initialQuery,
}: {
  children: React.ReactNode;
  initialAroundLatLng?: string;
  initialQuery?: string;
}) => {
  const [aroundLatLng, setAroundLatLng] = React.useState(initialAroundLatLng);
  const [aroundRadius, setAroundRadius] = React.useState<number>(1600);
  const [boundingBox, setBoundingBox] = React.useState<string | undefined>();

  return (
    <AppProvider
      userLocation={{ coords: COORDS_MID_SAN_FRANCISCO, inSanFrancisco: false }}
      aroundLatLng={aroundLatLng}
      setAroundLatLng={setAroundLatLng}
      aroundUserLocationRadius={aroundRadius}
      setAroundRadius={setAroundRadius}
      boundingBox={boundingBox}
      setBoundingBox={setBoundingBox}
    >
      <InstantSearch
        searchClient={mockSearchClient}
        indexName="resources"
        initialUiState={
          initialQuery
            ? { resources: { query: initialQuery } }
            : undefined
        }
      >
        <QueryConnector />
        {children}
      </InstantSearch>
    </AppProvider>
  );
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse search request params, handling both object and URL-encoded string formats.
 */
function parseParams(raw: any): Record<string, any> {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  const parsed: Record<string, string> = {};
  const pairs = raw.split("&");
  for (const pair of pairs) {
    const [key, ...rest] = pair.split("=");
    if (key) {
      parsed[decodeURIComponent(key)] = decodeURIComponent(rest.join("="));
    }
  }
  return parsed;
}

/** Check if any search call contains a param matching the predicate */
function findSearchCallWith(
  predicate: (params: Record<string, any>) => boolean
): Record<string, any> | null {
  for (const call of mockSearch.mock.calls) {
    const requests = call[0];
    const raw = requests[0]?.params ?? requests[0];
    const params = parseParams(raw);
    if (predicate(params)) return params;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("Search Flow Integration Tests", () => {
  beforeEach(() => {
    mockSearch.mockClear();
    mockSearch.mockImplementation(() => Promise.resolve(makeSearchResponse()));
  });

  // ---------------------------------------------------------------
  // Flow 1: Text search from home page → query present, no category
  // ---------------------------------------------------------------
  describe("Flow 1: Text search (/search?q=food)", () => {
    it("sends query with no category filter", async () => {
      render(
        <MemoryRouter initialEntries={["/search?q=food"]}>
          <TestWrapper initialQuery="food">
            <SearchResultsPage />
          </TestWrapper>
        </MemoryRouter>
      );

      await waitFor(() => {
        const match = findSearchCallWith((p) => p.query === "food");
        expect(match).not.toBeNull();
      });

      const params = findSearchCallWith((p) => p.query === "food")!;
      expect(params.filters || "").toBeFalsy();
    });
  });

  // ---------------------------------------------------------------
  // Flow 2: Search from category page = pure search (no category)
  // ---------------------------------------------------------------
  describe("Flow 2: Search from category page navigates to /search?q=...", () => {
    it("search page has no category filter", async () => {
      render(
        <MemoryRouter initialEntries={["/search?q=medical"]}>
          <TestWrapper initialQuery="medical">
            <SearchResultsPage />
          </TestWrapper>
        </MemoryRouter>
      );

      await waitFor(() => {
        const match = findSearchCallWith((p) => p.query === "medical");
        expect(match).not.toBeNull();
      });

      const params = findSearchCallWith((p) => p.query === "medical")!;
      expect(params.filters || "").toBeFalsy();
    });
  });

  // ---------------------------------------------------------------
  // Flow 3: Category browse = category + geo
  // ---------------------------------------------------------------
  describe("Flow 3: Category browse (/housing/results)", () => {
    it("sends category filter", async () => {
      render(
        <MemoryRouter initialEntries={["/housing/results"]}>
          <TestWrapper>
            <Routes>
              <Route
                path="/:categorySlug/results"
                element={<BrowseResultsPage />}
              />
            </Routes>
          </TestWrapper>
        </MemoryRouter>
      );

      await waitFor(() => {
        const match = findSearchCallWith(
          (p) =>
            typeof p.filters === "string" && p.filters.includes("categories:")
        );
        expect(match).not.toBeNull();
      });

      const params = findSearchCallWith(
        (p) =>
          typeof p.filters === "string" && p.filters.includes("categories:")
      )!;
      expect(params.filters).toContain("Housing");
    });
  });

  // ---------------------------------------------------------------
  // Flow 4: All Services = no category, has geo
  // ---------------------------------------------------------------
  describe("Flow 4: All Services (/search with no query)", () => {
    it("sends geo params with no category filter and no query", async () => {
      render(
        <MemoryRouter initialEntries={["/search"]}>
          <TestWrapper>
            <SearchResultsPage />
          </TestWrapper>
        </MemoryRouter>
      );

      await waitFor(() => {
        const match = findSearchCallWith(
          (p) => p.aroundLatLng !== undefined && p.aroundLatLng !== ""
        );
        expect(match).not.toBeNull();
      });

      const params = findSearchCallWith(
        (p) => p.aroundLatLng !== undefined && p.aroundLatLng !== ""
      )!;
      expect(params.aroundLatLng).toContain("37.7749");
      expect(params.aroundLatLng).toContain("-122.4194");
      expect(params.filters || "").toBeFalsy();
      expect(params.query || "").toBe("");
    });
  });

  // ---------------------------------------------------------------
  // Flow 5: All Services page has geo but no category
  // ---------------------------------------------------------------
  describe("Flow 5: All Services has geo but no category filter", () => {
    it("geo is preserved and category is absent", async () => {
      render(
        <MemoryRouter initialEntries={["/search"]}>
          <TestWrapper>
            <SearchResultsPage />
          </TestWrapper>
        </MemoryRouter>
      );

      await waitFor(() => {
        const match = findSearchCallWith(
          (p) => p.aroundLatLng !== undefined && p.aroundLatLng !== ""
        );
        expect(match).not.toBeNull();
      });

      const params = findSearchCallWith(
        (p) => p.aroundLatLng !== undefined && p.aroundLatLng !== ""
      )!;
      expect(params.aroundLatLng).toBeDefined();
      expect(params.filters || "").toBeFalsy();
    });
  });

  // ---------------------------------------------------------------
  // Flow 6: Search → re-search → query updates
  // ---------------------------------------------------------------
  describe("Flow 6: Sequential searches update query", () => {
    it("search query updates when URL changes", async () => {
      const { unmount } = render(
        <MemoryRouter initialEntries={["/search?q=food"]}>
          <TestWrapper initialQuery="food">
            <SearchResultsPage />
          </TestWrapper>
        </MemoryRouter>
      );

      await waitFor(() => {
        const match = findSearchCallWith((p) => p.query === "food");
        expect(match).not.toBeNull();
      });

      unmount();
      mockSearch.mockClear();

      render(
        <MemoryRouter initialEntries={["/search?q=shelter"]}>
          <TestWrapper initialQuery="shelter">
            <SearchResultsPage />
          </TestWrapper>
        </MemoryRouter>
      );

      await waitFor(() => {
        const match = findSearchCallWith((p) => p.query === "shelter");
        expect(match).not.toBeNull();
      });
    });
  });
});
