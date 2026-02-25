// This is not used anywhere else, can we remove it?

import React, { useCallback } from "react";
import { SearchMap } from "components/SearchAndBrowse/SearchMap/SearchMap";
import { SearchResult } from "components/SearchAndBrowse/SearchResults/SearchResult";
import {
  useInstantSearch,
  usePagination,
  useSearchBox,
} from "react-instantsearch";
import styles from "./SearchResults.module.scss";
import ClearSearchButton from "../Refinements/ClearSearchButton";
import { Loader } from "components/ui/Loader";
import ResultsPagination from "components/SearchAndBrowse/Pagination/ResultsPagination";
import { SearchResultsHeader } from "components/ui/SearchResultsHeader";

export enum SearchMapActions {
  SearchThisArea,
  MapInitialized,
}

const SearchResults = ({
  mobileMapIsCollapsed,
}: {
  mobileMapIsCollapsed: boolean;
}) => {
  const { refine: refinePagination, currentRefinement: currentPage } =
    usePagination();
  const {
    // Results type is algoliasearchHelper.SearchResults<SearchHit>
    results: searchResults,
    status,
  } = useInstantSearch();
  const { query } = useSearchBox();

  const handleFirstResultFocus = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      node.focus();
    }
  }, []);

  // Search results are already transformed by the provider
  const searchMapHitData = searchResults;

  const hasNoResults = searchMapHitData.nbHits === 0 && status === "idle" && (
    <Loader />
  );

  const NoResultsDisplay = () => (
    <div className={`${styles.noResultsMessage}`}>
      <div className={styles.noResultsText}>
        No results {query && `for ${` "${query}" `}`} found in your area.
        <br /> Try a different location, filter, or search term.
      </div>

      {query && <ClearSearchButton />}
    </div>
  );

  const handleAction = (searchMapAction: SearchMapActions) => {
    switch (searchMapAction) {
      case SearchMapActions.SearchThisArea:
        return refinePagination(0);
    }
  };

  return (
    <div className={styles.searchResultsAndMapContainer}>
      <div
        className={`${styles.searchResultsContainer} ${
          mobileMapIsCollapsed ? styles.resultsPositionWhenMapCollapsed : ""
        }`}
      >
        <h2 className="sr-only">Search results</h2>
        {hasNoResults ? (
          <NoResultsDisplay />
        ) : (
          <>
            <SearchResultsHeader
              currentPage={currentPage}
              totalResults={searchResults.nbHits}
            />
            {searchMapHitData.hits.map((hit, index) => (
              <SearchResult
                hit={hit}
                index={index}
                key={`${hit.id} - ${hit.name}`}
                ref={index === 0 ? handleFirstResultFocus : null}
              />
            ))}
            <div
              className={`${styles.paginationContainer} ${
                hasNoResults ? styles.hidePagination : ""
              }`}
            >
              <div className={styles.resultsPagination}>
                <ResultsPagination noResults={hasNoResults} />
              </div>
            </div>
          </>
        )}
      </div>
      <SearchMap
        hits={searchMapHitData.hits}
        mobileMapIsCollapsed={mobileMapIsCollapsed}
        handleSearchMapAction={handleAction}
      />
    </div>
  );
};

export default SearchResults;
