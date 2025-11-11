import React, { useCallback, useState, useEffect } from "react";
import { SearchMapActions } from "components/SearchAndBrowse/SearchResults/SearchResults";
import Sidebar from "components/SearchAndBrowse/Sidebar/Sidebar";
import styles from "./SearchResultsPage.module.scss";
import { useAppContext } from "utils";
import { DEFAULT_AROUND_PRECISION } from "utils/location";
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
import {
  SearchConfigProvider,
  useSearchConfig,
} from "utils/SearchConfigContext";

export const HITS_PER_PAGE = 40;

/**
 * SearchResultsPageContent - The main content component that uses search config
 * This is separated so it can access the SearchConfigProvider context
 */
const SearchResultsPageContent = () => {
  const [isMapCollapsed, setIsMapCollapsed] = useState(false);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const { boundingBox, aroundLatLng, aroundUserLocationRadius } =
    useAppContext();
  const { updateConfig } = useSearchConfig();
  const { refine: refinePagination, currentRefinement: currentPage } =
    usePagination();
  const {
    // Results type is algoliasearchHelper.SearchResults<SearchHit>
    results: searchResults,
    status,
    indexUiState: { query = null },
  } = useInstantSearch();

  useEffect(() => window.scrollTo(0, 0), []);

  // Update search config when geo parameters change (e.g., user pans the map)
  useEffect(() => {
    // Don't update on initial mount - initialConfig already handles that
    if (!isMapInitialized) return;

    const config = boundingBox
      ? {
          insideBoundingBox: [boundingBox.split(",").map(Number)],
          hitsPerPage: HITS_PER_PAGE,
          aroundLatLng: undefined,
          aroundRadius: undefined,
          aroundPrecision: undefined,
          minimumAroundRadius: undefined,
        }
      : {
          aroundLatLng,
          aroundRadius: aroundUserLocationRadius,
          aroundPrecision: DEFAULT_AROUND_PRECISION,
          minimumAroundRadius: 100,
          hitsPerPage: HITS_PER_PAGE,
          insideBoundingBox: undefined,
        };
    updateConfig(config);
  }, [
    isMapInitialized,
    boundingBox,
    aroundLatLng,
    aroundUserLocationRadius,
    updateConfig,
  ]);

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

  return (
    <div className={styles.results}>
      <div className={classNames(styles.container, "searchResultsPage")}>
        <div className={styles.flexContainer}>
          {/* Only render Sidebar after map is initialized to prevent premature Algolia search */}
          {isMapInitialized && (
            <Sidebar
              isSearchResultsPage
              isMapCollapsed={isMapCollapsed}
              setIsMapCollapsed={setIsMapCollapsed}
            />
          )}

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

/**
 * SearchResultsPage - Wrapper that provides SearchConfigProvider
 * NOTE: The .searchResultsPage is added plain so that it can be targeted by print-specific css
 */
export const SearchResultsPage = () => {
  const { boundingBox, aroundLatLng, aroundUserLocationRadius } =
    useAppContext();

  // Calculate initial config synchronously BEFORE rendering
  // This prevents InstantSearch from making searches without the bounding box
  const initialConfig = React.useMemo(() => {
    // Wait until we have geographic data before providing initial config
    if (!boundingBox && !aroundLatLng) {
      return {};
    }

    return boundingBox
      ? {
          insideBoundingBox: [boundingBox.split(",").map(Number)],
          hitsPerPage: HITS_PER_PAGE,
        }
      : {
          aroundLatLng,
          aroundRadius: aroundUserLocationRadius,
          aroundPrecision: DEFAULT_AROUND_PRECISION,
          minimumAroundRadius: 100,
          hitsPerPage: HITS_PER_PAGE,
        };
  }, [boundingBox, aroundLatLng, aroundUserLocationRadius]);

  return (
    <SearchConfigProvider initialConfig={initialConfig}>
      <SearchResultsPageContent />
    </SearchConfigProvider>
  );
};
