import React from "react";
import { InstantSearch } from "react-instantsearch-core";
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
      // Simulate map initialization - MapInitialized = 1
      mockReact.useEffect(() => {
        handleSearchMapAction(1);
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
  const [aroundRadius, setAroundRadius] = React.useState<"all" | number>(1600);
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

describe("SearchResultsPage", () => {
  test("renders the Clear Search button", async () => {
    const searchClient = createSearchClient();

    render(
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
    );

    await waitFor(() => {
      expect(screen.getByTestId("clear-search-button")).toBeInTheDocument();
    });
  });
});
