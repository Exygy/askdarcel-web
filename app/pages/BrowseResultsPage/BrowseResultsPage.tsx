import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import * as dataService from "utils/DataService";
import {
  DEFAULT_AROUND_PRECISION,
  useAppContext,
  useAppContextUpdater,
} from "utils";
import { SearchMapActions } from "components/SearchAndBrowse/SearchResults/SearchResults";
import { Loader } from "components/ui/Loader";
import Sidebar from "components/SearchAndBrowse/Sidebar/Sidebar";
import { BrowseSubheader } from "components/SearchAndBrowse/Header/BrowseSubheader";
import { PageHeader } from "components/ui/Navigation/PageHeader";
import { BrowseHeaderSection } from "components/SearchAndBrowse/Header/BrowseHeaderSection";
import {
  useEligibilitiesForCategory,
  useSubcategoriesForCategory,
} from "hooks/APIHooks";
import { CATEGORIES, ServiceCategory } from "../constants";
import styles from "./BrowseResultsPage.module.scss";
import { useClearRefinements } from "react-instantsearch-core";
import { SearchMap } from "components/SearchAndBrowse/SearchMap/SearchMap";
import { SearchResult } from "components/SearchAndBrowse/SearchResults/SearchResult";
import {
  TransformedSearchHit,
  transformSearchResults,
} from "models/SearchHits";
import { useInstantSearch, usePagination } from "react-instantsearch";
import ResultsPagination from "components/SearchAndBrowse/Pagination/ResultsPagination";
import searchResultsStyles from "components/SearchAndBrowse/SearchResults/SearchResults.module.scss";
import { SearchResultsHeader } from "components/ui/SearchResultsHeader";
import { NoSearchResultsDisplay } from "components/ui/NoSearchResultsDisplay";
import { our415SubcategoryNames } from "utils/refinementMappings";
import {
  SearchConfigProvider,
  useSearchConfig,
} from "utils/SearchConfigContext";

export const HITS_PER_PAGE = 40;

/**
 * BrowseResultsPageContent - The main content component that uses search config
 * This is separated so it can access the SearchConfigProvider context
 */
const BrowseResultsPageContent = () => {
  const { categorySlug } = useParams();
  const { updateConfig } = useSearchConfig();

  const category = CATEGORIES.find((c) => c.slug === categorySlug);
  if (category === undefined) {
    throw new Error(`Unknown category slug ${categorySlug}`);
  }
  const [parentCategory, setParentCategory] = useState<ServiceCategory | null>(
    null
  );
  const [isMapCollapsed, setIsMapCollapsed] = useState(false);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const eligibilities = useEligibilitiesForCategory(category.id);
  const subcategories = useSubcategoriesForCategory(category.id);
  const { userLocation } = useAppContext();
  const { aroundUserLocationRadius, aroundLatLng, boundingBox } =
    useAppContext();

  const { setBoundingBox, setAroundLatLng, setAroundRadius } =
    useAppContextUpdater();
  const {
    // Results type is algoliasearchHelper.SearchResults<SearchHit>
    results: searchResults,
    status,
  } = useInstantSearch();
  const { refine: refinePagination, currentRefinement: currentPage } =
    usePagination();
  const { refine: clearRefinements } = useClearRefinements();

  useEffect(() => window.scrollTo(0, 0), []);

  // Reset map state when category changes
  useEffect(
    () => {
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
      category.id,
      setBoundingBox,
      setAroundLatLng,
      setAroundRadius,
      userLocation,
    ]
  );

  const handleFirstResultFocus = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      node.focus();
    }
  }, []);

  const subcategoryNames = subcategories
    ?.map((c) => c.name)
    .filter((name) => our415SubcategoryNames.has(name));
  const { name: categoryName, sortAlgoliaSubcategoryRefinements } = category;

  // TODO: Handle failure?
  useEffect(() => {
    clearRefinements();
    dataService
      .get(`/api/categories/${category.id}`)
      .then(({ category: serviceCategory }: { category: ServiceCategory }) => {
        setParentCategory(serviceCategory);
      });
  }, [category.id, clearRefinements]);

  const escapeApostrophes = (str: string): string => str.replace(/'/g, "\\'");
  const algoliaCategoryName = parentCategory?.name
    ? escapeApostrophes(parentCategory.name)
    : null;

  // Update search config when map is initialized and we have category name
  useEffect(() => {
    // Wait until map is initialized
    if (!isMapInitialized) return;

    // Wait until we have category name
    if (!algoliaCategoryName) return;

    // Wait until we have geographic data (boundingBox OR aroundLatLng)
    if (!boundingBox && !aroundLatLng) return;

    const config = {
      filters: `categories:'${algoliaCategoryName}'`,
      hitsPerPage: HITS_PER_PAGE,
      ...(boundingBox
        ? {
            insideBoundingBox: [boundingBox.split(",").map(Number)],
          }
        : {
            aroundLatLng,
            aroundRadius: aroundUserLocationRadius,
            aroundPrecision: DEFAULT_AROUND_PRECISION,
            minimumAroundRadius: 100,
          }),
    };
    updateConfig(config);
  }, [
    isMapInitialized,
    algoliaCategoryName,
    boundingBox,
    aroundLatLng,
    aroundUserLocationRadius,
    updateConfig,
  ]);

  const searchMapHitData = transformSearchResults(searchResults);

  const hasNoResults = searchMapHitData.nbHits === 0 && status === "idle";

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

  // TS compiler requires explicit null type checks
  if (
    eligibilities === null ||
    subcategories === null ||
    algoliaCategoryName === null ||
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

        <div className={styles.flexContainer}>
          {/* Only render Sidebar after map is initialized to prevent premature Algolia search */}
          {isMapInitialized && (
            <Sidebar
              isSearchResultsPage={false}
              eligibilities={eligibilities || []}
              subcategoryNames={subcategoryNames || []}
              sortAlgoliaSubcategoryRefinements={
                sortAlgoliaSubcategoryRefinements
              }
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
                  <NoSearchResultsDisplay query={null} />
                ) : (
                  <>
                    {/* This is browse not search */}
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
  const { categorySlug } = useParams();
  const category = CATEGORIES.find((c) => c.slug === categorySlug);

  if (category === undefined) {
    throw new Error(`Unknown category slug ${categorySlug}`);
  }

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
