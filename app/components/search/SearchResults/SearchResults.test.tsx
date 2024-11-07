import React from "react";
import { InstantSearch } from "react-instantsearch-core";
import { render, screen, waitFor } from "@testing-library/react";
import SearchResults from "components/search/SearchResults/SearchResults";
import { createSearchClient } from "../../../../test/helpers/createSearchClient";
import ClearSearchButton from "components/search/Refinements/ClearSearchButton";

describe("SearchResults", () => {
  test("renders the Clear Search button", async () => {
    const searchClient = createSearchClient();

    render(
      <InstantSearch
        searchClient={searchClient}
        indexName="fake_test_search_index"
        initialUiState={{
          fake_test_search_index: {
            query: "fake query",
          },
        }}
      >
        <SearchResults
          mobileMapIsCollapsed={false}
          showClearSearchButton={true}
        />
      </InstantSearch>
    );

    await waitFor(() => {
      expect(screen.getByTestId("clear-search-button")).toBeInTheDocument();
    });
  });

  test("does not render the Clear Search button", async () => {
    const searchClient = createSearchClient();

    render(
      <InstantSearch
        searchClient={searchClient}
        indexName="fake_test_search_index"
        initialUiState={{
          fake_test_search_index: {
            query: "fake query",
          },
        }}
      >
        <SearchResults mobileMapIsCollapsed={false} />
      </InstantSearch>
    );

    await waitFor(() => {
      expect(
        screen.queryByTestId("clear-search-button")
      ).not.toBeInTheDocument();
    });
  });
});
