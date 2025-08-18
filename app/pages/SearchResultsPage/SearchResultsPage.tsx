import React, { useCallback, useState, useEffect } from "react";
import { SearchMapActions } from "components/SearchAndBrowse/SearchResults/SearchResults";
import Sidebar from "components/SearchAndBrowse/Sidebar/Sidebar";
import styles from "./SearchResultsPage.module.scss";
import { DEFAULT_AROUND_PRECISION, useAppContext } from "utils";
import { Configure } from "react-instantsearch-core";
import classNames from "classnames";
import { SearchMap } from "components/SearchAndBrowse/SearchMap/SearchMap";
import { SearchResult } from "components/SearchAndBrowse/SearchResults/SearchResult";
import {
  TransformedSearchHit,
  transformSearchResults,
} from "models/SearchHits";
import { useInstantSearch, usePagination } from "react-instantsearch";
import searchResultsStyles from "components/SearchAndBrowse/SearchResults/SearchResults.module.scss";
import { Loader } from "components/ui/Loader";
import ResultsPagination from "components/SearchAndBrowse/Pagination/ResultsPagination";
import { NoSearchResultsDisplay } from "components/ui/NoSearchResultsDisplay";
import { SearchResultsHeader } from "components/ui/SearchResultsHeader";
import ClearSearchButton from "components/SearchAndBrowse/Refinements/ClearSearchButton";

export const HITS_PER_PAGE = 40;

// NOTE: The .searchResultsPage is added plain so that it can be targeted by print-specific css
export const SearchResultsPage = () => {
  const [isMapCollapsed, setIsMapCollapsed] = useState(false);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const { aroundUserLocationRadius, aroundLatLng, boundingBox } =
    useAppContext();
  const { refine: refinePagination, currentRefinement: currentPage } =
    usePagination();
  const {
    // Results type is algoliasearchHelper.SearchResults<SearchHit>
    results: searchResults,
    status,
    indexUiState: { query = null },
  } = useInstantSearch();

  useEffect(() => window.scrollTo(0, 0), []);

  const handleFirstResultFocus = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      node.focus();
    }
  }, []);

  const searchMapHitData = transformSearchResults(searchResults);

  const hasNoResults = searchMapHitData.nbHits === 0 && status === "idle" && (
    <Loader />
  );

  const handleAction = (searchMapAction: SearchMapActions) => {
    switch (searchMapAction) {
      case SearchMapActions.SearchThisArea:
        // Center and radius are already updated in the SearchMap component
        // Just reset pagination to show the first page of results
        return refinePagination(0);
      case SearchMapActions.MapInitialized:
        // Map has initialized and bounding box is now available
        setIsMapInitialized(true);
        return;
    }
  };

  // Search parameters are now configured based on map initialization

  return (
    <div className={styles.results}>
      <div className={classNames(styles.container, "searchResultsPage")}>
        {/* Only render the Configure component (which triggers the search) when the map is initialized */}
        {isMapInitialized && (
          <Configure
            // Use the bounding box if available, otherwise fall back to radius-based search
            {...(boundingBox
              ? {
                  // Convert bounding box string to array of numbers that Algolia expects
                  insideBoundingBox: [boundingBox.split(",").map(Number)],
                  hitsPerPage: HITS_PER_PAGE,
                }
              : {
                  aroundLatLng: aroundLatLng,
                  aroundRadius: aroundUserLocationRadius,
                  aroundPrecision: DEFAULT_AROUND_PRECISION,
                  minimumAroundRadius: 100, // Prevent the radius from being too small (100m minimum)
                })}
          />
        )}

        <div className={styles.flexContainer}>
          <Sidebar
            isSearchResultsPage
            isMapCollapsed={isMapCollapsed}
            setIsMapCollapsed={setIsMapCollapsed}
          />

          <div className={styles.results}>
            <div className={searchResultsStyles.searchResultsAndMapContainer}>
              <div
                className={`${searchResultsStyles.searchResultsContainer} ${
                  isMapCollapsed
                    ? searchResultsStyles.resultsPositionWhenMapCollapsed
                    : ""
                }`}
              >
                <h2 className="sr-only">Search results</h2>
                {!isMapInitialized ? (
                  <div className={styles.loadingContainer}>
                    <Loader />
                    <p>Initializing map and loading results...</p>
                  </div>
                ) : hasNoResults ? (
                  <NoSearchResultsDisplay query={query} />
                ) : (
                  <>
                    <SearchResultsHeader
                      currentPage={currentPage}
                      totalResults={searchResults.nbHits}
                    />
                    {searchMapHitData.hits.map(
                      (hit: TransformedSearchHit, index) => (
                        <SearchResult
                          hit={hit}
                          key={`${hit.id} - ${hit.name}`}
                          ref={index === 0 ? handleFirstResultFocus : null}
                        />
                      )
                    )}
                    <div
                      className={`${searchResultsStyles.paginationContainer} ${
                        hasNoResults ? searchResultsStyles.hidePagination : ""
                      }`}
                    >
                      <div className={searchResultsStyles.resultsPagination}>
                        <ResultsPagination noResults={hasNoResults} />
                      </div>
                    </div>
                  </>
                )}
              </div>
              <SearchMap
                hits={searchMapHitData.hits}
                mobileMapIsCollapsed={isMapCollapsed}
                handleSearchMapAction={handleAction}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
