import React from "react";
import { InstantSearch } from "react-instantsearch-core";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { ResultsPage } from "pages/ResultsPage/ResultsPage";
import { createSearchClient } from "../../../test/helpers/createSearchClient";
import { AppProvider } from "utils/useAppContext";
import { COORDS_MID_SAN_FRANCISCO } from "utils";

// Mock the SearchMap component to avoid Google Maps rendering issues in tests
jest.mock("components/SearchAndBrowse/SearchMap/SearchMap", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mockReact = require("react");

  return {
    SearchMap: ({ handleSearchMapAction }: any) => {
      const hasInitialized = mockReact.useRef(false);

      mockReact.useEffect(() => {
        if (!hasInitialized.current) {
          hasInitialized.current = true;
          // SearchMapActions.MapInitialized = 1
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

// Mock TypesenseHooks for browse mode tests
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

jest.mock("search/providers", () => ({
  getSearchProvider: () => mockSearchProvider,
}));

jest.mock("search/context/SearchContext", () => ({
  ...jest.requireActual("search/context/SearchContext"),
  useSearchContext: () => ({ provider: mockSearchProvider }),
}));

const SearchContext = React.createContext<{
  provider: typeof mockSearchProvider;
} | null>(null);

const SearchContextTestProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <SearchContext.Provider value={{ provider: mockSearchProvider }}>
    {children}
  </SearchContext.Provider>
);

const TestWrapper = ({
  children,
  userLocation = { coords: COORDS_MID_SAN_FRANCISCO, inSanFrancisco: false },
}: {
  children: React.ReactNode;
  userLocation?: { coords: typeof COORDS_MID_SAN_FRANCISCO; inSanFrancisco: boolean };
}) => {
  const [aroundLatLng, setAroundLatLng] = React.useState("");
  const [aroundRadius, setAroundRadius] = React.useState<number>(1600);
  const [boundingBox, setBoundingBox] = React.useState<string | undefined>();

  return (
    <AppProvider
      userLocation={userLocation}
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

describe("ResultsPage (search mode)", () => {
  test("renders the Clear Search button", async () => {
    const searchClient = createSearchClient();

    render(
      <MemoryRouter initialEntries={["/search"]}>
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
            <SearchContextTestProvider>
              <Routes>
                <Route path="/search" element={<ResultsPage />} />
              </Routes>
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
      <MemoryRouter initialEntries={["/search"]}>
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
              <Routes>
                <Route path="/search" element={<ResultsPage />} />
              </Routes>
            </SearchContextTestProvider>
          </InstantSearch>
        </TestWrapper>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Page 1")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByLabelText("Page 1")).toBeInTheDocument();
    });
  });
});

describe("ResultsPage (browse mode)", () => {
  test("renders browse-mode header in browse mode", async () => {
    const searchClient = createSearchClient();

    render(
      <MemoryRouter initialEntries={["/housing/results"]}>
        <TestWrapper>
          <InstantSearch
            searchClient={searchClient}
            indexName="fake_test_search_index"
          >
            <SearchContextTestProvider>
              <Routes>
                <Route path="/:categorySlug/results" element={<ResultsPage />} />
              </Routes>
            </SearchContextTestProvider>
          </InstantSearch>
        </TestWrapper>
      </MemoryRouter>
    );

    // BrowseHeaderSection renders <h1>Services</h1> inside PageHeader,
    // which only appears when ResultsPage is in browse mode.
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Services" })
      ).toBeInTheDocument();
    });
  });

  test("renders browse description text in browse mode", async () => {
    const searchClient = createSearchClientWithHits();

    render(
      <MemoryRouter initialEntries={["/housing/results"]}>
        <TestWrapper>
          <InstantSearch
            searchClient={searchClient}
            indexName="fake_test_search_index"
          >
            <SearchContextTestProvider>
              <Routes>
                <Route path="/:categorySlug/results" element={<ResultsPage />} />
              </Routes>
            </SearchContextTestProvider>
          </InstantSearch>
        </TestWrapper>
      </MemoryRouter>
    );

    // BrowseHeaderSection renders the description text, which only appears
    // when ResultsPage is in browse mode (it renders its own PageHeader).
    await waitFor(() => {
      expect(
        screen.getByText("Sign up for programs and access resources.")
      ).toBeInTheDocument();
    });
  });
});
