import React, { useState, useEffect } from "react";
import {
  connectStateResults,
  SearchResults as SearchResultsType,
} from "react-instantsearch/connectors";
import { SearchMap } from "components/search/SearchMap/SearchMap";
import ResultsPagination from "components/search/Pagination/ResultsPagination";
import { SearchResult } from "components/search/SearchResults/SearchResult";
// import { Texting } from "components/Texting";
// import { TextListing } from "components/Texting/Texting";
import {
  SearchMapHitData,
  transformSearchResults,
} from "../../../models/SearchHits";
import styles from "./SearchResults.module.scss";
import ClearSearchButton from "../Refinements/ClearSearchButton";

// @param {boolean} mobileMapIsCollapsed -
const SearchResults = ({
  searchResults,
  mobileMapIsCollapsed,
  setAroundLatLng,
  searchQuery,
}: {
  searchResults: SearchResultsType;
  mobileMapIsCollapsed: boolean;
  setAroundLatLng: (latLng: { lat: number; lng: number }) => void;
  searchQuery?: string | null;
}) => {
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

  if (!searchResults) return null;

  const searchMapHitData: SearchMapHitData =
    transformSearchResults(searchResults);

  return (
    <div className={styles.searchResultsAndMapContainer}>
      <div
        className={`${styles.searchResultsContainer} ${
          mobileMapIsCollapsed ? styles.mobileMapIsCollapsed : ""
        }`}
      >
        {!searchMapHitData.hits.length ? (
          <div
            className={`${styles.noResultsMessage} ${
              searchMapHitData.hits && searchMapHitData.hits.length
                ? styles.hidden
                : ""
            }`}
          >
            <div className={styles.noResultsText}>
              No results {searchQuery && `for ${` "${searchQuery}" `}`} found in
              your area.
              <br /> Try a different location, filter, or search term.
            </div>

            {searchQuery && <ClearSearchButton />}
          </div>
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
            {searchMapHitData.hits.map((hit) => (
              <SearchResult hit={hit} key={`${hit.id} - ${hit.name}`} />
            ))}
            <ResultsPagination
              noResults={
                !searchMapHitData.hits || !searchMapHitData.hits.length
              }
            />
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
export default connectStateResults(SearchResults);
