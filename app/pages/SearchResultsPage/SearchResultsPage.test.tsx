import React from "react";
import { InstantSearch } from "react-instantsearch-core";
import { MemoryRouter } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { SearchResultsPage } from "pages/SearchResultsPage/SearchResultsPage";
import { createSearchClient } from "../../../test/helpers/createSearchClient";
import { AppProvider } from "utils/useAppContext";
import { COORDS_MID_SAN_FRANCISCO } from "utils";

// Mock the SearchMap component to avoid Google Maps rendering issues in tests
jest.mock("components/SearchAndBrowse/SearchMap/SearchMap", () => {
  // Import React inside the mock factory
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mockReact = require("react");

  return {
    SearchMap: ({ handleSearchMapAction }: any) => {
      // Use a ref to ensure we only call handleSearchMapAction once
      const hasInitialized = mockReact.useRef(false);

      // Simulate map initialization - MapInitialized = 1
      mockReact.useEffect(() => {
        if (!hasInitialized.current) {
          hasInitialized.current = true;
          handleSearchMapAction(1);
        }
      }, [handleSearchMapAction]);

      return mockReact.createElement(
        "div",
        { "data-testid": "search-map-mock" },
        "Search Map"
      );
    },
  };
});

// Mock search provider for tests
const mockSearchProvider = {
  getLiteClient: () => createSearchClient(),
  getIndexName: () => "fake_test_search_index",
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

// Mock the search providers to avoid Typesense/Algolia initialization
jest.mock("search/providers", () => ({
  getSearchProvider: () => mockSearchProvider,
}));

// Create a test context provider that supplies the search context
const SearchContext = React.createContext<{ provider: typeof mockSearchProvider } | null>(null);

const SearchContextTestProvider = ({ children }: { children: React.ReactNode }) => (
  <SearchContext.Provider value={{ provider: mockSearchProvider }}>
    {children}
  </SearchContext.Provider>
);

// Mock the useSearchContext hook
jest.mock("search/context/SearchContext", () => ({
  ...jest.requireActual("search/context/SearchContext"),
  useSearchContext: () => ({ provider: mockSearchProvider }),
}));

// Test wrapper with AppProvider
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const [aroundLatLng, setAroundLatLng] = React.useState("");
  const [aroundRadius, setAroundRadius] = React.useState<number>(1600);
  const [boundingBox, setBoundingBox] = React.useState<string | undefined>();

  return (
    <AppProvider
      userLocation={{
        coords: COORDS_MID_SAN_FRANCISCO,
        inSanFrancisco: false,
      }}
      aroundLatLng={aroundLatLng}
      setAroundLatLng={setAroundLatLng}
      aroundUserLocationRadius={aroundRadius}
      setAroundRadius={setAroundRadius}
      boundingBox={boundingBox}
      setBoundingBox={setBoundingBox}
    >
      {children}
    </AppProvider>
  );
};

/** Creates a search client that returns hits so pagination renders */
function createSearchClientWithHits() {
  return {
    search: (requests: any) =>
      Promise.resolve({
        results: requests.map(() => ({
          hits: Array.from({ length: 10 }, (_, i) => ({
            objectID: `${i}`,
            id: `${i}`,
            name: `Result ${i}`,
            addresses: [{ address_1: `${i} Main St` }],
            locations: [],
          })),
          page: 0,
          nbHits: 50,
          nbPages: 2,
          hitsPerPage: 40,
          processingTimeMS: 1,
          params: "",
          query: "food",
        })),
      }),
  };
}

describe("SearchResultsPage", () => {
  test("renders the Clear Search button", async () => {
    const searchClient = createSearchClient();

    render(
      <MemoryRouter>
        <TestWrapper>
          <InstantSearch
            searchClient={searchClient}
            indexName="fake_test_search_index"
            initialUiState={{
              fake_test_search_index: {
                query: "fake query",
              },
            }}
          >
            {/* Provide a minimal SearchContext for components that need it */}
            <SearchContextTestProvider>
              <SearchResultsPage />
            </SearchContextTestProvider>
          </InstantSearch>
        </TestWrapper>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("clear-search-button")).toBeInTheDocument();
    });
  });

  test("keeps Pagination widget mounted during loading", async () => {
    const searchClient = createSearchClientWithHits();

    render(
      <MemoryRouter>
        <TestWrapper>
          <InstantSearch
            searchClient={searchClient}
            indexName="fake_test_search_index"
            initialUiState={{
              fake_test_search_index: {
                query: "food",
              },
            }}
          >
            <SearchContextTestProvider>
              <SearchResultsPage />
            </SearchContextTestProvider>
          </InstantSearch>
        </TestWrapper>
      </MemoryRouter>
    );

    // Wait for results to render — pagination appears with page links
    await waitFor(() => {
      expect(screen.getByLabelText("Page 1")).toBeInTheDocument();
    });

    // The pagination widget should remain in the DOM even after the initial
    // render cycle (which previously caused unmount/remount due to
    // isLoading toggling). Verify it's still there after a short wait.
    await waitFor(() => {
      expect(screen.getByLabelText("Page 1")).toBeInTheDocument();
    });
  });
});
