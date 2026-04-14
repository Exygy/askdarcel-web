import React, {
  useCallback,
  useState,
  useEffect,
  useRef,
  useMemo,
} from "react";
import { useSearchParams, useLocation, useParams } from "react-router-dom";
import { useInstantSearch } from "react-instantsearch-core";
import { SearchMapActions } from "components/SearchAndBrowse/SearchResults/SearchResults";
import FilterHeader from "components/SearchAndBrowse/FilterHeader/FilterHeader";
import styles from "./ResultsPage.module.scss";
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
import {
  useAppContext,
  useAppContextUpdater,
  DEFAULT_AROUND_PRECISION,
} from "utils";
import { useFilterState } from "hooks/useFilterState";
import { BrowseSubheader } from "components/SearchAndBrowse/Header/BrowseSubheader";
import { PageHeader } from "components/ui/Navigation/PageHeader";
import { BrowseHeaderSection } from "components/SearchAndBrowse/Header/BrowseHeaderSection";
import { useTypesenseFacets } from "hooks/TypesenseHooks";
import { categoryToSlug } from "utils/categoryIcons";
import { HITS_PER_PAGE } from "../../search/constants";

type ResultsPageMode = "search" | "browse";

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

// Map radius values to appropriate zoom levels
const RADIUS_TO_ZOOM: Record<number, number> = {
  805: 16, // 0.5 miles
  1609: 15, // 1 mile
  3219: 14, // 2 miles
  4828: 13, // 3 miles
};

const DEFAULT_RADIUS = 1609;

interface ResultsPageContentProps {
  mode: ResultsPageMode;
  category?: { name: string; slug: string };
  typesenseCategoryName?: string;
}

const ResultsPageContent = ({
  mode,
  category,
  typesenseCategoryName,
}: ResultsPageContentProps) => {
  const { updateConfig } = useSearchConfig();
  const filterState = useFilterState();

  const [isMapCollapsed, setIsMapCollapsed] = useState(false);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  // In browse mode geo is always active; in search mode the user must opt in.
  const [geoSearchEnabled, setGeoSearchEnabled] = useState(mode === "browse");
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
  const location = useLocation();
  const { userLocation, aroundUserLocationRadius, aroundLatLng, boundingBox } =
    useAppContext();
  const { setBoundingBox, setAroundLatLng, setAroundRadius } =
    useAppContextUpdater();

  // Track the last bounding-box / aroundLatLng values that we applied to
  // the search config to prevent infinite loops.
  const lastAppliedGeo = useRef<string>("");

  // Track whether the searchParams effect has already fired once (initial load).
  const isInitialSearchRef = useRef(true);

  // Stores the initial bounding box string so we can restore it on new searches.
  const initialBoundingBox = useRef<string | undefined>(undefined);

  useEffect(() => window.scrollTo(0, 0), []);

  // Capture the initial bounding box once after map initialization.
  useEffect(() => {
    if (isMapInitialized && boundingBox && !initialBoundingBox.current) {
      initialBoundingBox.current = boundingBox;
    }
  }, [isMapInitialized, boundingBox]);

  // Search mode: set query from URL search params on navigation.
  useEffect(() => {
    if (mode !== "search") return;

    const searchQuery = searchParams.get("q");
    if (!searchQuery) return;

    if (isInitialSearchRef.current) {
      isInitialSearchRef.current = false;
      setIndexUiState((prev) => ({ ...prev, query: searchQuery }));
    } else {
      setGeoSearchEnabled(false);
      updateConfig({
        insideBoundingBox: undefined,
        aroundLatLng: undefined,
        aroundRadius: undefined,
        aroundPrecision: undefined,
        minimumAroundRadius: undefined,
      });
      setBoundingBox(initialBoundingBox.current);
      setResetViewCount((c) => c + 1);
      if (userLocation) {
        setAroundLatLng(
          `${userLocation.coords.lat},${userLocation.coords.lng}`
        );
      }
      setAroundRadius(DEFAULT_RADIUS);
      lastAppliedGeo.current = "";
      clearRefinements();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  // Browse mode: clear query and refinements when category changes.
  useEffect(() => {
    if (mode !== "browse") return;
    if (!category) return;
    setIndexUiState((prevState) => ({ ...prevState, query: "" }));
    clearRefinements();
  }, [mode, category, setIndexUiState, clearRefinements]);

  // Browse mode: reset map state when category changes.
  useEffect(() => {
    if (mode !== "browse") return;
    if (!category) return;

    setBoundingBox(undefined);
    setAroundLatLng(`${userLocation?.coords.lat},${userLocation?.coords.lng}`);
    setAroundRadius(1600);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    mode,
    category?.name,
    setBoundingBox,
    setAroundLatLng,
    setAroundRadius,
    userLocation,
  ]);

  // Apply geo config when the map initialises or the bounding box / aroundLatLng changes.
  // In search mode, requires explicit user opt-in (geoSearchEnabled).
  // In browse mode, geo is always active.
  useEffect(() => {
    if (!isMapInitialized) return;
    if (!geoSearchEnabled) return;
    if (!boundingBox && !aroundLatLng) return;

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
    geoSearchEnabled,
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

      if (mode === "search") {
        // Apply radius-based geo directly, bypassing map-boundary tracking.
        setGeoSearchEnabled(false);
        updateConfig({
          hitsPerPage: HITS_PER_PAGE,
          aroundLatLng: `${lat},${lng}`,
          aroundRadius: radius,
          aroundPrecision: DEFAULT_AROUND_PRECISION,
          minimumAroundRadius: 100,
          insideBoundingBox: undefined,
        });
      } else {
        // Browse mode: clear bounding box and let geo effect pick up new aroundLatLng.
        setBoundingBox(undefined);
        setAroundLatLng(`${lat},${lng}`);
        lastAppliedGeo.current = "";
      }
    },
    [mode, goToPage, updateConfig, setBoundingBox, setAroundLatLng]
  );

  const handleLocationClear = useCallback(() => {
    setCustomMapCenter(null);
    setCustomMapZoom(null);
    setResetViewCount((c) => c + 1);
    lastAppliedGeo.current = "";
    if (initialBoundingBox.current) {
      setBoundingBox(initialBoundingBox.current);
      if (mode === "search") {
        if (geoSearchEnabled) {
          updateConfig(buildBoundingBoxConfig(initialBoundingBox.current));
        } else {
          // geo is opt-in in search mode; clear any stale geo params without re-enabling filtering.
          updateConfig({
            hitsPerPage: HITS_PER_PAGE,
            insideBoundingBox: undefined,
            aroundLatLng: undefined,
            aroundRadius: undefined,
            aroundPrecision: undefined,
            minimumAroundRadius: undefined,
          });
        }
      }
    }
  }, [mode, geoSearchEnabled, updateConfig, setBoundingBox]);

  const handleClearAll = useCallback(() => {
    filterState.clearFilters();
    updateConfig({ filters: "" });
    setAroundRadius(DEFAULT_RADIUS);
    handleLocationClear();
    setIndexUiState((prev) => ({ ...prev, query: "" }));
  }, [
    filterState,
    updateConfig,
    setAroundRadius,
    handleLocationClear,
    setIndexUiState,
  ]);

  const handleFirstResultFocus = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      node.focus();
    }
  }, []);

  const searchMapHitData = searchResults || { hits: [], nbHits: 0 };

  // Search mode: show initial loader before first results arrive.
  // Browse mode: show loader until map is initialized.
  const isInitialLoad =
    mode === "search" ? !searchResults && isSearching : !isMapInitialized;

  const hasNoResults =
    mode === "search"
      ? !isSearching && searchMapHitData.nbHits === 0 && isIdle
      : searchMapHitData.nbHits === 0 && isIdle;

  const handleAction = (searchMapAction: SearchMapActions) => {
    switch (searchMapAction) {
      case SearchMapActions.SearchThisArea:
        if (mode === "search") {
          setGeoSearchEnabled(true);
        } else {
          goToPage(0);
        }
        return;
      case SearchMapActions.MapInitialized:
        setIsMapInitialized(true);
        return;
    }
  };

  const pageFilter = typesenseCategoryName
    ? `categories:'${typesenseCategoryName}'`
    : undefined;

  const resultsContent = (
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
            <p>
              {mode === "search"
                ? "Loading results..."
                : "Initializing map and loading results..."}
            </p>
          </div>
        ) : hasNoResults ? (
          <NoSearchResultsDisplay
            query={mode === "search" ? query : null}
            onClearSearch={mode === "search" ? handleClearAll : undefined}
          />
        ) : (
          <>
            <SearchResultsHeader
              currentPage={currentPage}
              totalResults={searchResults?.nbHits || 0}
              onClearSearch={mode === "search" ? handleClearAll : undefined}
            />
            <ul className={searchResultsStyles.resultsList}>
              {searchMapHitData.hits.map((hit, index) => (
                <li key={`${hit.id} - ${hit.name}`}>
                  <SearchResult
                    hit={hit}
                    index={index}
                    ref={index === 0 ? handleFirstResultFocus : null}
                    isHighlighted={hoveredHitId === hit.id}
                    onMouseEnter={() => setHoveredHitId(hit.id)}
                    onMouseLeave={() => setHoveredHitId(null)}
                  />
                </li>
              ))}
            </ul>
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
  );

  if (mode === "browse") {
    return (
      <>
        <PageHeader>
          <BrowseHeaderSection descriptionText="Sign up for programs and access resources." />
        </PageHeader>
        <div className={styles.container}>
          <BrowseSubheader currentCategory={category?.name ?? ""} />
          {isMapInitialized && (
            <FilterHeader
              filterState={filterState}
              isSearchResultsPage={false}
              pageFilter={pageFilter}
              isMapCollapsed={isMapCollapsed}
              setIsMapCollapsed={setIsMapCollapsed}
              onLocationSelect={handleLocationSelect}
              onLocationClear={handleLocationClear}
            />
          )}
          <div className={styles.flexContainer}>
            <div className={styles.results}>{resultsContent}</div>
          </div>
        </div>
      </>
    );
  }

  // Search mode
  return (
    <div className={styles.results}>
      <div className={classNames(styles.container, "searchResultsPage")}>
        {isMapInitialized && (
          <FilterHeader
            filterState={filterState}
            isSearchResultsPage
            isMapCollapsed={isMapCollapsed}
            setIsMapCollapsed={setIsMapCollapsed}
            onLocationSelect={handleLocationSelect}
            onLocationClear={handleLocationClear}
          />
        )}
        <div className={styles.flexContainer}>
          <div className={styles.results}>{resultsContent}</div>
        </div>
      </div>
    </div>
  );
};

/**
 * ResultsPage - Unified page for both keyword search (/search?q=...) and
 * category browse (/:categorySlug/results). Mode is detected from the URL:
 * a non-empty categorySlug param means browse mode; otherwise search mode.
 *
 * Browse mode: resolves the category via useTypesenseFacets() and waits for
 * it before rendering SearchConfigProvider, preventing a flash of all results.
 *
 * Search mode: initial config omits geo params so the first search is geo-free;
 * geo is only enabled when the user clicks "Search this area".
 */
export const ResultsPage = () => {
  const { categorySlug } = useParams();
  const mode: ResultsPageMode = categorySlug ? "browse" : "search";

  // All hooks must be called unconditionally before any early returns.
  const facets = useTypesenseFacets();

  const category = useMemo(() => {
    if (mode !== "browse" || !facets) return null;

    const matchedCategory = facets.categories.find(
      (cat) => categoryToSlug(cat.value) === categorySlug
    );

    if (!matchedCategory) return null;

    return {
      name: matchedCategory.value,
      slug: categorySlug || "",
    };
  }, [mode, facets, categorySlug]);

  // Search mode initial config: falsy-but-defined geo values override stale
  // geo from a previous page's Configure widget that is still disposing.
  const searchInitialConfig = useMemo(
    () => ({
      hitsPerPage: HITS_PER_PAGE,
      filters: "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      insideBoundingBox: null as any,
      aroundLatLng: "" as string,
      aroundRadius: 0 as number,
    }),
    []
  );

  if (mode === "browse") {
    // Wait for category to resolve before rendering the search tree.
    if (!category) {
      return <Loader />;
    }

    const typesenseCategoryName = category.name.replace(/'/g, "\\'");
    const browseInitialConfig = {
      filters: `categories:'${typesenseCategoryName}'`,
      hitsPerPage: HITS_PER_PAGE,
    };

    return (
      <SearchConfigProvider
        key={category.slug}
        initialConfig={browseInitialConfig}
      >
        <ResultsPageContent
          mode="browse"
          category={category}
          typesenseCategoryName={typesenseCategoryName}
        />
      </SearchConfigProvider>
    );
  }

  return (
    <SearchConfigProvider initialConfig={searchInitialConfig}>
      <ResultsPageContent mode="search" />
    </SearchConfigProvider>
  );
};
