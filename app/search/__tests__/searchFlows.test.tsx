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
import { MemoryRouter, Routes, Route, useNavigate } from "react-router-dom";
import { InstantSearch, useSearchBox } from "react-instantsearch-core";
import { render, waitFor, screen, fireEvent } from "@testing-library/react";
import { AppProvider } from "utils/useAppContext";
import { COORDS_MID_SAN_FRANCISCO } from "utils";
import { SearchResultsPage } from "pages/SearchResultsPage/SearchResultsPage";
import { BrowseResultsPage } from "pages/BrowseResultsPage/BrowseResultsPage";

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
// Mock SearchMap to avoid Google Maps in tests.
// Exposes a "Search this area" button so tests can simulate the explicit geo
// action: clicking it sets a fake bounding box in AppContext and fires the
// SearchThisArea action (0), mirroring what the real SearchMap does.
// ---------------------------------------------------------------------------
const FAKE_BOUNDING_BOX = "37.812,-122.527,37.708,-122.357";

jest.mock("components/SearchAndBrowse/SearchMap/SearchMap", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mockReact = require("react");
  // Use the real AppContextUpdater so setBoundingBox propagates to SearchResultsPage
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { useAppContextUpdater } = require("utils/useAppContext");

  return {
    SearchMap: ({ handleSearchMapAction }: any) => {
      const hasInit = mockReact.useRef(false);
      const { setBoundingBox } = useAppContextUpdater();

      mockReact.useEffect(() => {
        if (!hasInit.current) {
          hasInit.current = true;
          // SearchMapActions.MapInitialized = 1
          handleSearchMapAction(1);
        }
      }, [handleSearchMapAction]);

      const handleSearchThisArea = () => {
        setBoundingBox(FAKE_BOUNDING_BOX);
        // SearchMapActions.SearchThisArea = 0
        handleSearchMapAction(0);
      };

      return mockReact.createElement(
        "div",
        { "data-testid": "search-map-mock" },
        mockReact.createElement(
          "button",
          {
            "data-testid": "search-this-area-btn",
            onClick: handleSearchThisArea,
          },
          "Search this area"
        )
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
// QueryConnector - registers a SearchBox widget so query appears in params
// ---------------------------------------------------------------------------
const QueryConnector = () => {
  useSearchBox();
  return null;
};

// ---------------------------------------------------------------------------
// SearchSubmitSimulator - mimics SiteSearchInput's on-page submit path.
// SiteSearchInput calls setSearchParams({ q }, { replace: true }), which
// internally calls navigate(). Real browser history always generates a new
// location.key on every navigate, even for the same URL. MemoryRouter can
// be inconsistent for same-URL replace, so we use navigate() with a
// changing state value to guarantee a fresh location object.
// ---------------------------------------------------------------------------
const SearchSubmitSimulator = ({ query }: { query: string }) => {
  const navigate = useNavigate();
  return (
    <button
      data-testid="submit-search-btn"
      onClick={() =>
        navigate(`/search?q=${query}`, {
          replace: true,
          state: { submittedAt: Date.now() },
        })
      }
    >
      Submit search
    </button>
  );
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
          initialQuery ? { resources: { query: initialQuery } } : undefined
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
  // Flow 4: All Services – initial load has no geo filter
  // Services without a location would be excluded by a bounding-box
  // filter, so the fresh search must be geo-free.
  // ---------------------------------------------------------------
  describe("Flow 4: All Services (/search with no query)", () => {
    it("does not apply a geo filter on the initial load", async () => {
      render(
        <MemoryRouter initialEntries={["/search"]}>
          <TestWrapper>
            <SearchResultsPage />
          </TestWrapper>
        </MemoryRouter>
      );

      // Wait for the map to initialize (which would have triggered geo
      // params under the old behaviour).
      await waitFor(() => {
        expect(screen.getByTestId("search-map-mock")).toBeInTheDocument();
      });

      // Wait for at least one search call to confirm the page has settled.
      await waitFor(() => {
        expect(mockSearch).toHaveBeenCalled();
      });

      // No call should include a bounding-box or radius geo filter.
      // Use truthy check: null/undefined insideBoundingBox means no geo applied.
      const geoCall = findSearchCallWith(
        (p) =>
          !!p.insideBoundingBox ||
          (p.aroundLatLng !== undefined && p.aroundLatLng !== "")
      );
      expect(geoCall).toBeNull();
    });
  });

  // ---------------------------------------------------------------
  // Flow 5: Keyword search – initial search has no geo filter
  // ---------------------------------------------------------------
  describe("Flow 5: Fresh keyword search has no geo filter", () => {
    it("does not include insideBoundingBox or aroundLatLng on a fresh search", async () => {
      render(
        <MemoryRouter initialEntries={["/search?q=food"]}>
          <TestWrapper initialQuery="food">
            <SearchResultsPage />
          </TestWrapper>
        </MemoryRouter>
      );

      // Wait for the query call to land.
      await waitFor(() => {
        const match = findSearchCallWith((p) => p.query === "food");
        expect(match).not.toBeNull();
      });

      // The map initialises and tries to apply a bounding box, but
      // geoSearchEnabled is false so it must not trigger a geo search.
      // Use truthy check: null/undefined insideBoundingBox means no geo applied.
      const geoCall = findSearchCallWith(
        (p) =>
          p.query === "food" &&
          (!!p.insideBoundingBox ||
            (p.aroundLatLng !== undefined && p.aroundLatLng !== ""))
      );
      expect(geoCall).toBeNull();
    });
  });

  // ---------------------------------------------------------------
  // Flow 6: Switching categories updates the filter (regression)
  // ---------------------------------------------------------------
  describe("Flow 6: Switching categories updates the search filter", () => {
    it("sends the new category filter when navigating from one category to another", async () => {
      // Start on Housing category
      const { unmount } = render(
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
          (p) => typeof p.filters === "string" && p.filters.includes("Housing")
        );
        expect(match).not.toBeNull();
      });

      // Unmount and navigate to Food category
      unmount();
      mockSearch.mockClear();

      render(
        <MemoryRouter initialEntries={["/food/results"]}>
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
          (p) => typeof p.filters === "string" && p.filters.includes("Food")
        );
        expect(match).not.toBeNull();
      });

      // Verify the filter contains the NEW category, not the old one
      const params = findSearchCallWith(
        (p) => typeof p.filters === "string" && p.filters.includes("Food")
      )!;
      expect(params.filters).toContain("Food");
      expect(params.filters).not.toContain("Housing");
    });
  });

  // ---------------------------------------------------------------
  // Flow 7: "Search this area" enables bounding-box geo filter
  // The user must explicitly opt in to geo filtering; the map
  // initialising alone must not trigger a geo-filtered search.
  // ---------------------------------------------------------------
  describe("Flow 7: 'Search this area' enables geo filter", () => {
    it("applies insideBoundingBox only after 'Search this area' is clicked", async () => {
      render(
        <MemoryRouter initialEntries={["/search?q=food"]}>
          <TestWrapper initialQuery="food">
            <SearchResultsPage />
          </TestWrapper>
        </MemoryRouter>
      );

      // Wait for map to initialise and the initial (geo-free) search to land.
      await waitFor(() => {
        expect(screen.getByTestId("search-this-area-btn")).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(mockSearch).toHaveBeenCalled();
      });

      // Confirm no truthy bounding-box geo filter has been applied yet.
      expect(findSearchCallWith((p) => !!p.insideBoundingBox)).toBeNull();

      // Simulate "Search this area" click: mock sets bounding box in
      // AppContext and fires SearchMapActions.SearchThisArea.
      mockSearch.mockClear();
      fireEvent.click(screen.getByTestId("search-this-area-btn"));

      // A new search with a real bounding-box filter must now be sent.
      await waitFor(() => {
        const match = findSearchCallWith((p) => !!p.insideBoundingBox);
        expect(match).not.toBeNull();
      });
    });
  });

  // ---------------------------------------------------------------
  // Flow 8: Re-searching the same term after "Search this area"
  // clears the geo filter.
  // SiteSearchInput calls setSearchParams({ q }, { replace: true })
  // when already on /search — the URL string doesn't change but
  // location.key does, so the effect must still detect it.
  // ---------------------------------------------------------------
  describe("Flow 8: Same-term re-search after 'Search this area' clears geo", () => {
    it("removes insideBoundingBox when the same query is re-submitted", async () => {
      render(
        <MemoryRouter initialEntries={["/search?q=food"]}>
          <TestWrapper initialQuery="food">
            <SearchSubmitSimulator query="food" />
            <SearchResultsPage />
          </TestWrapper>
        </MemoryRouter>
      );

      // Wait for map to initialise.
      await waitFor(() => {
        expect(screen.getByTestId("search-this-area-btn")).toBeInTheDocument();
      });
      await waitFor(() => expect(mockSearch).toHaveBeenCalled());

      // Enable geo via "Search this area".
      fireEvent.click(screen.getByTestId("search-this-area-btn"));

      await waitFor(() => {
        expect(findSearchCallWith((p) => !!p.insideBoundingBox)).not.toBeNull();
      });

      // Snapshot the call count BEFORE re-submitting so we can isolate
      // calls that happen after the submit from earlier geo calls.
      const callCountBeforeSubmit = mockSearch.mock.calls.length;

      // Re-submit the same query "food".
      fireEvent.click(screen.getByTestId("submit-search-btn"));

      // Wait until at least one new search fires, then verify the most-recent
      // call is geo-free. "Most-recent" is the right invariant: even if there
      // is a brief intermediate search (e.g., clearRefinements firing
      // before the Configure update commits), the final search the user
      // sees must not have a bounding-box filter.
      await waitFor(() => {
        expect(mockSearch.mock.calls.length).toBeGreaterThan(
          callCountBeforeSubmit
        );
      });
      const postSubmitCalls = mockSearch.mock.calls;
      const postSubmitLast = postSubmitCalls[postSubmitCalls.length - 1];
      const postSubmitRaw =
        postSubmitLast[0]?.[0]?.params ?? postSubmitLast[0]?.[0];
      const postSubmitParams = parseParams(postSubmitRaw);
      expect(postSubmitParams.insideBoundingBox).toBeUndefined();
    });
  });

  // ---------------------------------------------------------------
  // Flow 10: Navigate from browse page to /search clears category filter
  // When the user submits a keyword search from a category results page,
  // the resulting /search page must NOT include the category's filter
  // string or any geo params that were applied on the browse page.
  // ---------------------------------------------------------------
  describe("Flow 10: Navigate from browse page to search clears category filter and geo", () => {
    it("fires a category-free, geo-free search after navigating from a browse page", async () => {
      // A button rendered alongside BrowseResultsPage that simulates
      // SiteSearchInput navigating to /search from a non-search route.
      const NavigateToSearch = () => {
        const navigate = useNavigate();
        return (
          <button
            data-testid="nav-to-search"
            onClick={() => navigate("/search?q=food")}
          >
            Search Food
          </button>
        );
      };

      render(
        <MemoryRouter initialEntries={["/housing/results"]}>
          <TestWrapper>
            <Routes>
              <Route
                path="/:categorySlug/results"
                element={
                  <>
                    <BrowseResultsPage />
                    <NavigateToSearch />
                  </>
                }
              />
              <Route path="/search" element={<SearchResultsPage />} />
            </Routes>
          </TestWrapper>
        </MemoryRouter>
      );

      // Wait for BrowseResultsPage to settle and fire a category-filtered search.
      await waitFor(() => {
        expect(
          findSearchCallWith(
            (p) =>
              typeof p.filters === "string" && p.filters.includes("Housing")
          )
        ).not.toBeNull();
      });

      // Simulate the user submitting a keyword search from the browse page.
      mockSearch.mockClear();
      fireEvent.click(screen.getByTestId("nav-to-search"));

      // Wait for SearchResultsPage to render (map mock is present).
      await waitFor(() => {
        expect(screen.getByTestId("search-map-mock")).toBeInTheDocument();
      });

      // Wait for a search with query="food" to arrive.
      await waitFor(() => {
        expect(findSearchCallWith((p) => p.query === "food")).not.toBeNull();
      });

      // The most-recent call must have "food" as the query and must NOT
      // include the browse page's category filter or any geo params.
      await waitFor(() => {
        const allCalls = mockSearch.mock.calls;
        const lastCall = allCalls[allCalls.length - 1];
        const raw = lastCall[0]?.[0]?.params ?? lastCall[0]?.[0];
        const p = parseParams(raw);
        expect(p.query).toBe("food");
      });
      const finalCalls = mockSearch.mock.calls;
      const finalLast = finalCalls[finalCalls.length - 1];
      const finalRaw = finalLast[0]?.[0]?.params ?? finalLast[0]?.[0];
      const finalParams = parseParams(finalRaw);
      expect(finalParams.filters || "").not.toContain("categories:");
      expect(finalParams.insideBoundingBox).toBeFalsy();
      expect(finalParams.aroundLatLng || "").toBeFalsy();
    });
  });

  // ---------------------------------------------------------------
  // Flow 9: Sequential searches update query
  // ---------------------------------------------------------------
  describe("Flow 9: Sequential searches update query", () => {
    it("search query updates when navigating to a different query", async () => {
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
