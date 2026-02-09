import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  DEFAULT_AROUND_PRECISION,
  useAppContext,
  useAppContextUpdater,
} from "utils";
import { SearchMapActions } from "components/SearchAndBrowse/SearchResults/SearchResults";
import { Loader } from "components/ui/Loader";
import FilterHeader from "components/SearchAndBrowse/FilterHeader/FilterHeader";
import { BrowseSubheader } from "components/SearchAndBrowse/Header/BrowseSubheader";
import { PageHeader } from "components/ui/Navigation/PageHeader";
import { BrowseHeaderSection } from "components/SearchAndBrowse/Header/BrowseHeaderSection";
import { useTopLevelCategories } from "hooks/TypesenseHooks";
import { categoryToSlug } from "utils/categoryIcons";
import styles from "./BrowseResultsPage.module.scss";
import {
  useSearchResults,
  useSearchPagination,
  useClearRefinements,
} from "../../search/hooks";
import { SearchMap } from "components/SearchAndBrowse/SearchMap/SearchMap";
import { SearchResult } from "components/SearchAndBrowse/SearchResults/SearchResult";
import ResultsPagination from "components/SearchAndBrowse/Pagination/ResultsPagination";
import searchResultsStyles from "components/SearchAndBrowse/SearchResults/SearchResults.module.scss";
import { SearchResultsHeader } from "components/ui/SearchResultsHeader";
import { NoSearchResultsDisplay } from "components/ui/NoSearchResultsDisplay";
import {
  SearchConfigProvider,
  useSearchConfig,
} from "utils/SearchConfigContext";

export const HITS_PER_PAGE = 40;

// Map radius values to appropriate zoom levels
const RADIUS_TO_ZOOM: Record<number, number> = {
  1609: 15, // 1 mile
  3219: 14, // 2 miles
  4828: 13, // 3 miles
};

/**
 * BrowseResultsPageContent - The main content component that uses search config
 * This is separated so it can access the SearchConfigProvider context
 */
const BrowseResultsPageContent = () => {
  const { categorySlug } = useParams();
  const { updateConfig } = useSearchConfig();
  const { categories, isLoading: categoriesLoading } = useTopLevelCategories();

  // Find the category from dynamic data
  const category = useMemo(() => {
    if (categories.length === 0) return null;

    const matchedCategory = categories.find(
      (cat) => categoryToSlug(cat.value) === categorySlug
    );

    if (!matchedCategory) return null;

    // Create a ServiceCategory-like object with the dynamic data
    // For now, we'll use placeholder values for fields that come from the old system
    return {
      name: matchedCategory.value,
      slug: categorySlug || "",
      algoliaCategoryName: matchedCategory.value, // Keep for legacy compatibility
      typesenseCategoryName: matchedCategory.value,
      id: "", // Will be populated from API call
      steps: ["subcategories", "results"] as const,
      subcategorySubheading:
        "What are you currently looking for? Select all that apply.",
      sortAlgoliaSubcategoryRefinements: false,
      icon: {
        name: "fa-circle-question",
        provider: "fa",
      },
    };
  }, [categories, categorySlug]);

  const [isMapCollapsed, setIsMapCollapsed] = useState(false);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [customMapCenter, setCustomMapCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [customMapZoom, setCustomMapZoom] = useState<number | null>(null);
  const [hoveredHitId, setHoveredHitId] = useState<string | null>(null);
  const { userLocation } = useAppContext();
  const { aroundUserLocationRadius, aroundLatLng, boundingBox } =
    useAppContext();

  const { setBoundingBox, setAroundLatLng, setAroundRadius } =
    useAppContextUpdater();
  const { results: searchResults, isIdle } = useSearchResults();
  const { goToPage, currentPage } = useSearchPagination();
  const { clearAll: clearRefinements } = useClearRefinements();

  useEffect(() => window.scrollTo(0, 0), []);

  useEffect(() => {
    if (!category) return;
    clearRefinements();
  }, [category, clearRefinements]);

  // Reset map state when category changes
  useEffect(
    () => {
      if (!category) return;

      // Reset bounding box and location parameters to original user location
      // so the new category search starts fresh
      setBoundingBox(undefined);
      setAroundLatLng(
        `${userLocation?.coords.lat},${userLocation?.coords.lng}`
      );
      setAroundRadius(1600); // Reset to default radius
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      category?.name,
      setBoundingBox,
      setAroundLatLng,
      setAroundRadius,
      userLocation,
    ]
  );

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

  const categoryName = category?.name || "";

  const escapeBackticks = (str: string): string => str.replace(/`/g, "\\`");
  const typesenseCategoryName = category?.typesenseCategoryName
    ? escapeBackticks(category.typesenseCategoryName)
    : null;

  // Set the category filter once when category is known and map is ready.
  // This is separate from geo params so that FilterHeader can append
  // eligibility filters without this effect overwriting them on every
  // geo change.
  useEffect(() => {
    if (!isMapInitialized) return;
    if (!typesenseCategoryName) return;

    updateConfig({
      filters: `categories:\`${typesenseCategoryName}\``,
      hitsPerPage: HITS_PER_PAGE,
    });
  }, [isMapInitialized, typesenseCategoryName, updateConfig]);

  // Update geo params when map bounds or location settings change.
  // Does NOT touch `filters` so eligibility selections are preserved.
  useEffect(() => {
    if (!isMapInitialized) return;
    if (!boundingBox && !aroundLatLng) return;

    const geoConfig = boundingBox
      ? {
          insideBoundingBox: [boundingBox.split(",").map(Number)],
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
          insideBoundingBox: undefined,
        };
    updateConfig(geoConfig);
  }, [
    isMapInitialized,
    boundingBox,
    aroundLatLng,
    aroundUserLocationRadius,
    updateConfig,
  ]);

  // Search results are already transformed by the provider
  // No need for additional transformation
  const searchMapHitData = searchResults || { hits: [], nbHits: 0 };

  const hasNoResults = searchMapHitData.nbHits === 0 && isIdle;

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

  // TS compiler requires explicit null type checks
  if (
    !category ||
    categoriesLoading ||
    typesenseCategoryName === null ||
    userLocation === null
  ) {
    return <Loader />;
  }

  return (
    <>
      <PageHeader>
        <BrowseHeaderSection descriptionText="Sign up for programs and access resources." />
      </PageHeader>
      <div className={styles.container}>
        <BrowseSubheader currentCategory={categoryName} />

        {/* Only render FilterHeader after map is initialized to prevent premature search */}
        {isMapInitialized && (
          <FilterHeader
            isSearchResultsPage={false}
            pageFilter={
              typesenseCategoryName
                ? `categories:\`${typesenseCategoryName}\``
                : undefined
            }
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
                {!isMapInitialized ? (
                  <div className={styles.loadingContainer}>
                    <Loader />
                    <p>Initializing map and loading results...</p>
                  </div>
                ) : hasNoResults ? (
                  <NoSearchResultsDisplay query={null} />
                ) : (
                  <>
                    {/* This is browse not search */}
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
                        <ResultsPagination />
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
    </>
  );
};

/**
 * BrowseResultsPage - Wrapper that provides SearchConfigProvider
 * This handles state management, URL parsing, and external API requests.
 */
export const BrowseResultsPage = () => {
  // We don't validate the category here anymore since it's dynamic
  // If the category doesn't exist, the content component will show a loader
  // and the user will see "no results"

  const { boundingBox, aroundLatLng, aroundUserLocationRadius } =
    useAppContext();

  // Calculate initial config synchronously BEFORE rendering
  // For browse pages, we don't have the category filter yet (loaded async)
  // But we can set the geographic config to prevent searches without it
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
      <BrowseResultsPageContent />
    </SearchConfigProvider>
  );
};
