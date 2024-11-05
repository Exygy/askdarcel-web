import React from "react";
import { InstantSearch } from "react-instantsearch-core";
import { render, screen, waitFor } from "@testing-library/react";
import BrowseRefinementList from "components/search/Refinements/BrowseRefinementList";
import { createSearchClient } from "../../../../test/helpers/createSearchClient";

describe("BrowseRefinementList", () => {
  test("renders with props", async () => {
    const searchClient = createSearchClient({
      facets: {
        categories: {
          "Arts, Culture & Identity": 54,
          "Arts and Creative Expression": 35,
          Education: 28,
          "Academic Support": 24,
          sffamilies: 18,
          "After & Before School Care": 14,
          "Culture & Identity": 14,
          "Summer Programs": 12,
          "Skills & Training": 10,
          "Sports & Recreation": 10,
        },
      },
    });

    render(
      <InstantSearch
        searchClient={searchClient}
        indexName="fake_test_search_index"
      >
        <BrowseRefinementList attribute="categories" />
      </InstantSearch>
    );

    await waitFor(() => {
      expect(screen.getAllByTestId("browserefinementlist-item")).toHaveLength(
        10
      );
    });
  });
});
