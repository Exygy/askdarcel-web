import React, { useCallback, useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useInstantSearch } from "react-instantsearch-core";
import { SearchMapActions } from "components/SearchAndBrowse/SearchResults/SearchResults";
import FilterHeader from "components/SearchAndBrowse/FilterHeader/FilterHeader";
import styles from "./SearchResultsPage.module.scss";
import classNames from "classnames";
import { SearchMap } from "components/SearchAndBrowse/SearchMap/SearchMap";
import { SearchResult } from "components/SearchAndBrowse/SearchResults/SearchResult";
import {
  useSearchResults,
  useSearchPagination,
  useClearRefinements,
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
import { useAppContext, useAppContextUpdater, DEFAULT_AROUND_PRECISION } from "utils";

export const HITS_PER_PAGE = 40;

/**
 * Helper: build a bounding-box config object from a comma-separated string.
 * Returned object also clears all radius-based params to avoid conflicts.
 */
const buildBoundingBoxConfig = (bb: string) => ({
  hitsPerPage: HITS_PER_PAGE,
  insideBoundingBox: [bb.split(",").map(Number)],
  aroundLatLng: undefined,
  aroundRadius: undefined,
  aroundPrecision: undefined,
  minimumAroundRadius: undefined,
});

/**
 * SearchResultsPageContent - The main content component that uses search config
 * This is separated so it can access the SearchConfigProvider context
 */
// Map radius values to appropriate zoom levels
const RADIUS_TO_ZOOM: Record<number, number> = {
  805: 16, // 0.5 miles
  1609: 15, // 1 mile
  3219: 14, // 2 miles
  4828: 13, // 3 miles
};

const SearchResultsPageContent = () => {
  const { updateConfig } = useSearchConfig();

  const [isMapCollapsed, setIsMapCollapsed] = useState(false);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [customMapCenter, setCustomMapCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [customMapZoom, setCustomMapZoom] = useState<number | null>(null);
  const [resetViewCount, setResetViewCount] = useState(0);
  const [hoveredHitId, setHoveredHitId] = useState<string | null>(null);
  const { goToPage, currentPage } = useSearchPagination();
  const {
    results: searchResults,
    isIdle,
    isSearching,
    query,
  } = useSearchResults();
  const { clearAll: clearRefinements } = useClearRefinements();
  const { setIndexUiState } = useInstantSearch();
  const [searchParams] = useSearchParams();
  const { userLocation, aroundUserLocationRadius, aroundLatLng, boundingBox } =
    useAppContext();
  const { setBoundingBox, setAroundLatLng, setAroundRadius } =
    useAppContextUpdater();

  // Track the last bounding-box / aroundLatLng values that we applied to
  // the search config.  This prevents the reactive useEffect from firing
  // repeatedly with the same values (which would create new array
  // references, cause <Configure> to re-render, and trigger an infinite
  // search loop).
  const lastAppliedGeo = useRef<string>("");

  // Track whether the searchParams effect has already fired once (initial load).
  const isInitialSearchRef = useRef(true);

  // Stores the initial bounding box string so we can restore it on new searches.
  const initialBoundingBox = useRef<string | undefined>(undefined);

  useEffect(() => window.scrollTo(0, 0), []);

  // Capture the initial bounding box once after map initialization.
  // Uses a useEffect (not handleAction) because setBoundingBox is a batched
  // React state update: boundingBox in context hasn't updated yet when the
  // MapInitialized action fires synchronously in the same callback.
  useEffect(() => {
    if (isMapInitialized && boundingBox && !initialBoundingBox.current) {
      initialBoundingBox.current = boundingBox;
    }
  }, [isMapInitialized, boundingBox]);

  // Set query from URL search params (e.g., /search?q=food) on navigation.
  // On subsequent searches (not the initial load), reset all geo state and
  // the map view so the new search starts fresh.
  useEffect(() => {
    const searchQuery = searchParams.get("q");
    if (!searchQuery) return;

    setIndexUiState((prev) => ({ ...prev, query: searchQuery }));

    if (isInitialSearchRef.current) {
      isInitialSearchRef.current = false;
    } else {
      // Restore the initial bounding box immediately so search results reflect
      // the original map view while the map is animating back.
      setBoundingBox(initialBoundingBox.current);
      // Tell SearchMap to fitBounds back to the initial view. SearchMap will
      // re-capture the bounding box once the animation completes.
      setResetViewCount((c) => c + 1);
      // Reset fallback geo params (used if bounding box is undefined)
      if (userLocation) {
        setAroundLatLng(
          `${userLocation.coords.lat},${userLocation.coords.lng}`
        );
      }
      setAroundRadius(1600);
      // Allow the geo useEffect to re-apply with the reset values
      lastAppliedGeo.current = "";
      // Clear eligibility refinements
      clearRefinements();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Apply geo config when the map initialises or the bounding box /
  // aroundLatLng changes (e.g. "Search this area").
  useEffect(() => {
    if (!isMapInitialized) return;
    if (!boundingBox && !aroundLatLng) return;

    // Build a stable key that represents the geo params we would apply.
    // If nothing changed since the last application, skip to avoid
    // creating new object references that trigger <Configure> re-renders.
    const geoKey = boundingBox
      ? `bb:${boundingBox}`
      : `ll:${aroundLatLng}|r:${aroundUserLocationRadius}`;

    if (geoKey === lastAppliedGeo.current) return;
    lastAppliedGeo.current = geoKey;

    if (boundingBox) {
      updateConfig(buildBoundingBoxConfig(boundingBox));
    } else {
      updateConfig({
        hitsPerPage: HITS_PER_PAGE,
        aroundLatLng,
        aroundRadius: aroundUserLocationRadius,
        aroundPrecision: DEFAULT_AROUND_PRECISION,
        minimumAroundRadius: 100,
        insideBoundingBox: undefined,
      });
    }
  }, [
    isMapInitialized,
    boundingBox,
    aroundLatLng,
    aroundUserLocationRadius,
    updateConfig,
  ]);

  const handleLocationSelect = useCallback(
    (lat: number, lng: number, radius: number) => {
      setCustomMapCenter({ lat, lng });
      setCustomMapZoom(RADIUS_TO_ZOOM[radius] || 14);
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

  // Show the initial loader only before the first results arrive.
  // Once we have results, keep them (and the Pagination widget) mounted
  // during subsequent searches so InstantSearch widgets don't reset.
  const isInitialLoad = !searchResults && isSearching;

  // Only show "no results" when search is complete (idle) and we have 0 hits
  const hasNoResults = !isSearching && searchMapHitData.nbHits === 0 && isIdle;

  const handleAction = (searchMapAction: SearchMapActions) => {
    switch (searchMapAction) {
      case SearchMapActions.SearchThisArea:
        // Do NOT call goToPage(0) here. That would trigger
        // helper.search() immediately with stale helper state (old
        // bounding box) before the reactive useEffect has a chance to
        // apply the new bounding box via <Configure>. InstantSearch
        // automatically resets to page 0 when search parameters change,
        // so explicit pagination reset is unnecessary.
        return;
      case SearchMapActions.MapInitialized:
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
                {isInitialLoad ? (
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
                resetViewCount={resetViewCount}
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
 *
 * Geo params are NOT included in the initial config. Instead, the page waits
 * for the map to initialize and provide a bounding box, then applies it via
 * updateConfig. This mirrors the BrowseResultsPage pattern and ensures:
 * 1. The initial "All Services" search uses the map's visible bounding box
 *    (not a radius), giving a spread of pins across the map.
 * 2. "Search this area" updates the bounding box and triggers a clean
 *    config update without infinite loops.
 */
export const SearchResultsPage = () => {
  const initialConfig = React.useMemo(
    () => ({
      hitsPerPage: HITS_PER_PAGE,
      filters: "",
    }),
    []
  );

  return (
    <SearchConfigProvider initialConfig={initialConfig}>
      <SearchResultsPageContent />
    </SearchConfigProvider>
  );
};
