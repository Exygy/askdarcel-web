import React, { useState, useEffect } from "react";
import {
  connectStateResults,
  SearchResults as SearchResultsProps,
} from "react-instantsearch/connectors";
import { CATEGORIES } from "pages/constants";
import { SearchMap } from "components/search/SearchMap/SearchMap";
import ResultsPagination from "components/search/Pagination/ResultsPagination";
// import { Texting } from "components/Texting";
// import { TextListing } from "components/Texting/Texting";
import { SearchResult } from "components/search/SearchResults/SearchResult";
import {
  SearchHit,
  addRecurringScheduleToSeachHits,
} from "../../../models/SearchHits";
import styles from "./SearchResults.module.scss";
import ClearSearchButton from "../Refinements/ClearSearchButton";

// @param {boolean} mobileMapIsCollapsed -
const SearchResults = ({
  searchResults,
  mobileMapIsCollapsed,
  setAroundLatLng,
  categoryId,
  searchQuery,
}: {
  searchResults: SearchResultsProps;
  mobileMapIsCollapsed: boolean;
  setAroundLatLng: (latLng: { lat: number; lng: number }) => void;
  categoryId?: string;
  searchQuery?: string | null;
}) => {
  const category = CATEGORIES.find((c) => c.id === categoryId);
  const sortBy24HourAvailability = Boolean(category?.sortBy24HourAvailability);
  const hits = addRecurringScheduleToSeachHits(
    searchResults ? (searchResults.hits as unknown as SearchHit[]) : [],
    sortBy24HourAvailability
  );

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

  const currentPage = searchResults.page ?? 0;
  const hitsPerPage = searchResults.hitsPerPage ?? 20;

  return (
    <div className={styles.searchResultsAndMapContainer}>
      <div
        className={`${styles.searchResultsContainer} ${
          mobileMapIsCollapsed ? styles.mobileMapIsCollapsed : ""
        }`}
      >
        {!hits.length ? (
          <div
            className={`${styles.noResultsMessage} ${
              hits && hits.length ? styles.hidden : ""
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
            {hits.map((hit, index) => (
              <SearchResult
                hit={hit}
                index={currentPage * hitsPerPage + index + 1}
                // categoryId={categoryId} // Keep for category ticket
                key={`${hit.id} - ${hit.name}`}
              />
            ))}
            <ResultsPagination noResults={!hits || !hits.length} />
          </>
        )}
      </div>
      <SearchMap
        hits={hits}
        page={0}
        hitsPerPage={hits.length}
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
