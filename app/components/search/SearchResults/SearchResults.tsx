import React, { useState, useEffect, useCallback } from "react";
import { SearchMap } from "components/search/SearchMap/SearchMap";
import ResultsPagination from "components/search/Pagination/ResultsPagination";
import { SearchResult } from "components/search/SearchResults/SearchResult";
import {
  TransformedSearchHit,
  transformSearchResults,
} from "models/SearchHits";
import { useInstantSearch } from "react-instantsearch";
import styles from "./SearchResults.module.scss";
import ClearSearchButton from "../Refinements/ClearSearchButton";

const SearchResults = ({
  mobileMapIsCollapsed,
  setAroundLatLng,
  searchQuery,
}: {
  mobileMapIsCollapsed: boolean;
  setAroundLatLng: (latLng: { lat: number; lng: number }) => void;
  searchQuery?: string | null;
}) => {
  const { results: searchResults } = useInstantSearch();
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

  const searchMapHitData: any = transformSearchResults(searchResults);
  const hasNoResults = searchMapHitData.nbHits === 0;

  const NoResultsDisplay = () => (
    <div className={`${styles.noResultsMessage}`}>
      <div className={styles.noResultsText}>
        No results {searchQuery && `for ${` "${searchQuery}" `}`} found in your
        area.
        <br /> Try a different location, filter, or search term.
      </div>

      {searchQuery && <ClearSearchButton />}
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
            {searchQuery && (
              <div className={styles.searchResultsHeader}>
                <h2>{`${searchResults.nbHits} search results ${
                  searchQuery && ` for ${searchQuery}`
                }`}</h2>
                <ClearSearchButton />
              </div>
            )}
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
        setAroundLatLng={setAroundLatLng}
        mobileMapIsCollapsed={mobileMapIsCollapsed}
      />
    </div>
  );
};

// Connects the Algolia searchState and searchResults to this component
// Learn more here: https://community.algolia.com/react-instantsearch/connectors/connectStateResults.html
export default SearchResults;
