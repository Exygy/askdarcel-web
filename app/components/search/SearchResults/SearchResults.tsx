import React, { useState, useEffect, useCallback } from "react";
import { SearchMap } from "components/search/SearchMap/SearchMap";
import ResultsPagination from "components/search/Pagination/ResultsPagination";
import { SearchResult } from "components/search/SearchResults/SearchResult";
import {
  SearchHit,
  TransformedSearchHit,
  transformSearchResults,
} from "models/SearchHits";
import { useInstantSearch } from "react-instantsearch";
// eslint-disable-next-line import/no-extraneous-dependencies
import algoliasearchHelper from "algoliasearch-helper";
import styles from "./SearchResults.module.scss";
import ClearSearchButton from "../Refinements/ClearSearchButton";
import { Loader } from "components/ui";

const SearchResults = ({
  mobileMapIsCollapsed,
}: {
  mobileMapIsCollapsed: boolean;
}) => {
  const {
    results: searchResults,
    status,
    uiState: { query },
  }: {
    results: algoliasearchHelper.SearchResults<SearchHit>;
    status: "idle" | "loading" | "stalled" | "error";
    uiState: Partial<{
      query: string;
    }>;
  } = useInstantSearch();
  const [centerCoords] = useState(null);
  const [googleMapObject, setMapObject] = useState<google.maps.Map | null>(
    null
  );

  useEffect(() => {
    if (centerCoords && googleMapObject) {
      googleMapObject.setCenter(centerCoords);
    }
    document.body.classList.add("searchResultsPage");

    return () => {
      document.body.classList.remove("searchResultsPage");
    };
  }, [googleMapObject, centerCoords]);

  const handleFirstResultFocus = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      node.focus();
    }
  }, []);

  if (["loading", "stalled"].includes(status)) {
    return <Loader />;
  }

  const searchMapHitData = transformSearchResults(searchResults);
  const hasNoResults = searchMapHitData.nbHits === 0;

  const NoResultsDisplay = () => (
    <div className={`${styles.noResultsMessage}`}>
      <div className={styles.noResultsText}>
        No results {query && `for ${` "${query}" `}`} found in your area.
        <br /> Try a different location, filter, or search term.
      </div>

      {query && <ClearSearchButton />}
    </div>
  );

  return (
    <div className={styles.searchResultsAndMapContainer}>
      <div
        className={`${styles.searchResultsContainer} ${
          mobileMapIsCollapsed ? styles.mobileMapIsCollapsed : ""
        }`}
      >
        <h2 className="sr-only">Search results</h2>
        {hasNoResults ? (
          <NoResultsDisplay />
        ) : (
          <>
            <div className={styles.searchResultsHeader}>
              <h2>{`${searchResults.nbHits} search results ${
                query && ` for ${query}`
              }`}</h2>
              <ClearSearchButton />
            </div>

            {searchMapHitData.hits.map(
              (hit: TransformedSearchHit, index: any) => (
                <SearchResult
                  hit={hit}
                  key={`${hit.id} - ${hit.name}`}
                  ref={index === 0 ? handleFirstResultFocus : null}
                />
              )
            )}
            <ResultsPagination noResults={hasNoResults} />
          </>
        )}
      </div>
      <SearchMap
        hits={searchMapHitData.hits}
        mapObject={googleMapObject}
        setMapObject={setMapObject}
        mobileMapIsCollapsed={mobileMapIsCollapsed}
      />
    </div>
  );
};

// Connects the Algolia searchState and searchResults to this component
// Learn more here: https://community.algolia.com/react-instantsearch/connectors/connectStateResults.html
export default SearchResults;
