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
          <SearchResultsPage />
        </InstantSearch>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId("clear-search-button")).toBeInTheDocument();
    });
  });
});
