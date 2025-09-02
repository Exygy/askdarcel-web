import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import * as dataService from "utils/DataService";
import { DEFAULT_AROUND_PRECISION, useAppContext } from "utils";
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
import { Configure, useClearRefinements } from "react-instantsearch-core";
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
import { our415SubcategoryNames } from "utils/refinementMappings";

export const HITS_PER_PAGE = 40;

/** Wrapper component that handles state management, URL parsing, and external API requests. */
export const BrowseResultsPage = () => {
  const { categorySlug } = useParams();
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
  const {
    // Results type is algoliasearchHelper.SearchResults<SearchHit>
    results: searchResults,
    status,
  } = useInstantSearch();
  const { refine: refinePagination, currentRefinement: currentPage } =
    usePagination();
  const { refine: clearRefinements } = useClearRefinements();

  useEffect(() => window.scrollTo(0, 0), []);

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

  // TS compiler requires explict null type checks
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

        {/* Only render the Configure component (which triggers the search) when the map is initialized */}
        {isMapInitialized && (
          <Configure
            filters={`categories:'${algoliaCategoryName}'`}
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
            isSearchResultsPage={false}
            eligibilities={eligibilities || []}
            subcategoryNames={subcategoryNames || []}
            sortAlgoliaSubcategoryRefinements={
              sortAlgoliaSubcategoryRefinements
            }
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
