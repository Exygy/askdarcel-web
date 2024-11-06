import React from "react";
import { InstantSearch } from "react-instantsearch-core";
import { render, screen, waitFor } from "@testing-library/react";
import BrowseRefinementList from "components/search/Refinements/BrowseRefinementList";
import { createSearchClient } from "../../../../test/helpers/createSearchClient";
import { createRandomCategories } from "../../../../test/helpers/createRandomCategories";

describe("BrowseRefinementList", () => {
  test("renders the correct the number of categories", async () => {
    const numCategories = 25;
    const searchClient = createSearchClient({
      facets: {
        categories: createRandomCategories(numCategories),
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
        numCategories
      );
    });
  });
});
