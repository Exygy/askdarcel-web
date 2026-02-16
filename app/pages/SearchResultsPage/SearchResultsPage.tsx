import React, { useCallback, useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { SearchMapActions } from "components/SearchAndBrowse/SearchResults/SearchResults";
import FilterHeader from "components/SearchAndBrowse/FilterHeader/FilterHeader";
import styles from "./SearchResultsPage.module.scss";
import { useAppContext } from "utils";
import { DEFAULT_AROUND_PRECISION } from "utils/location";
import classNames from "classnames";
import { SearchMap } from "components/SearchAndBrowse/SearchMap/SearchMap";
import { SearchResult } from "components/SearchAndBrowse/SearchResults/SearchResult";
import {
  useSearchResults,
  useSearchPagination,
  useSearchQuery,
} from "../../search/hooks";
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
// Map radius values to appropriate zoom levels
const RADIUS_TO_ZOOM: Record<number, number> = {
  1609: 15, // 1 mile
  3219: 14, // 2 miles
  4828: 13, // 3 miles
};

const SearchResultsPageContent = () => {
  const [isMapCollapsed, setIsMapCollapsed] = useState(false);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [customMapCenter, setCustomMapCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [customMapZoom, setCustomMapZoom] = useState<number | null>(null);
  const [hoveredHitId, setHoveredHitId] = useState<string | null>(null);
  const { boundingBox, aroundLatLng, aroundUserLocationRadius } =
    useAppContext();
  const { updateConfig } = useSearchConfig();
  const { goToPage, currentPage } = useSearchPagination();
  const {
    results: searchResults,
    isIdle,
    isSearching,
    query,
  } = useSearchResults();
  const { setQuery } = useSearchQuery();
  const location = useLocation();
  const hasSetQueryRef = useRef(false);

  useEffect(() => window.scrollTo(0, 0), []);

  // Update search config when map initializes or geo parameters change
  useEffect(() => {
    if (!isMapInitialized) return;
    if (!boundingBox && !aroundLatLng) return;

    const config = boundingBox
      ? {
          insideBoundingBox: [boundingBox.split(",").map(Number)],
          hitsPerPage: HITS_PER_PAGE,
          filters: "",
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
          filters: "",
          insideBoundingBox: undefined,
        };
    updateConfig(config);

    // After config is updated, check if we have a search query from navigation
    // This ensures the search happens AFTER filters are cleared
    const searchQuery = (location.state as { searchQuery?: string })
      ?.searchQuery;
    if (searchQuery && !hasSetQueryRef.current) {
      hasSetQueryRef.current = true;
      setQuery(searchQuery);
    }
  }, [
    isMapInitialized,
    boundingBox,
    aroundLatLng,
    aroundUserLocationRadius,
    updateConfig,
    location.state,
    setQuery,
  ]);

  const handleLocationSelect = useCallback(
    (lat: number, lng: number, radius: number | "all") => {
      setCustomMapCenter({ lat, lng });
      // Set zoom level based on radius, or null for "all" (uses bounding box)
      if (radius === "all") {
        setCustomMapZoom(null);
      } else {
        setCustomMapZoom(RADIUS_TO_ZOOM[radius] || 14);
      }
      goToPage(0);
    },
    [goToPage]
  );

  const handleFirstResultFocus = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      node.focus();
    }
  }, []);

  // Search results are already transformed by the provider
  // No need for additional transformation
  const searchMapHitData = searchResults || { hits: [], nbHits: 0 };

  // Show loading state while map initializes or search is in progress
  const isLoading = !isMapInitialized || isSearching;

  // Only show "no results" when search is complete (idle) and we have 0 hits
  const hasNoResults = !isLoading && searchMapHitData.nbHits === 0 && isIdle;

  const handleAction = (searchMapAction: SearchMapActions) => {
    switch (searchMapAction) {
      case SearchMapActions.SearchThisArea:
        // Center and radius are already updated in the SearchMap component
        // Just reset pagination to show the first page of results
        return goToPage(0);
      case SearchMapActions.MapInitialized:
        // Map has initialized and bounding box is now available
        setIsMapInitialized(true);
        return;
    }
  };

  return (
    <div className={styles.results}>
      <div className={classNames(styles.container, "searchResultsPage")}>
        {/* Only render FilterHeader after map is initialized to prevent premature search */}
        {isMapInitialized && (
          <FilterHeader
            isSearchResultsPage
            isMapCollapsed={isMapCollapsed}
            setIsMapCollapsed={setIsMapCollapsed}
            onLocationSelect={handleLocationSelect}
          />
        )}

        <div className={styles.flexContainer}>
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
                {isLoading ? (
                  <div className={styles.loadingContainer}>
                    <Loader />
                    <p>Loading results...</p>
                  </div>
                ) : hasNoResults ? (
                  <NoSearchResultsDisplay query={query} />
                ) : (
                  <>
                    <SearchResultsHeader
                      currentPage={currentPage}
                      totalResults={searchResults?.nbHits || 0}
                    />
                    {searchMapHitData.hits.map((hit, index) => (
                      <SearchResult
                        hit={hit}
                        index={index}
                        key={`${hit.id} - ${hit.name}`}
                        ref={index === 0 ? handleFirstResultFocus : null}
                        isHighlighted={hoveredHitId === hit.id}
                        onMouseEnter={() => setHoveredHitId(hit.id)}
                        onMouseLeave={() => setHoveredHitId(null)}
                      />
                    ))}
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
                customCenter={customMapCenter}
                customZoom={customMapZoom}
                highlightedHitId={hoveredHitId}
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
 */
export const SearchResultsPage = () => {
  const { boundingBox, aroundLatLng, aroundUserLocationRadius } =
    useAppContext();

  // Calculate initial config synchronously so Configure renders immediately
  // This prevents searches from being blocked while waiting for map init
  const initialConfig = React.useMemo(() => {
    if (!boundingBox && !aroundLatLng) return {};

    return boundingBox
      ? {
          insideBoundingBox: [boundingBox.split(",").map(Number)],
          hitsPerPage: HITS_PER_PAGE,
          filters: "",
        }
      : {
          aroundLatLng,
          aroundRadius: aroundUserLocationRadius,
          aroundPrecision: DEFAULT_AROUND_PRECISION,
          minimumAroundRadius: 100,
          hitsPerPage: HITS_PER_PAGE,
          filters: "",
        };
  }, [boundingBox, aroundLatLng, aroundUserLocationRadius]);

  return (
    <SearchConfigProvider initialConfig={initialConfig}>
      <SearchResultsPageContent />
    </SearchConfigProvider>
  );
};
