import React, { useState, useEffect } from "react";
import {
  connectStateResults,
  SearchResults as SearchResultsProps,
} from "react-instantsearch/connectors";
import { SearchMap } from "components/search/SearchMap/SearchMap";
import ResultsPagination from "components/search/Pagination/ResultsPagination";
import { SearchResult } from "components/search/SearchResults/SeachResult";
// import { Texting } from "components/Texting";
// import { TextListing } from "components/Texting/Texting";
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
  searchQuery,
}: {
  searchResults: SearchResultsProps;
  mobileMapIsCollapsed: boolean;
  setAroundLatLng: (latLng: { lat: number; lng: number }) => void;
  searchQuery?: string | null;
}) => {
  const hits = addRecurringScheduleToSeachHits(
    searchResults ? (searchResults.hits as unknown as SearchHit[]) : []
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

  const searchMapHitData = (searchResultsData: SearchResultsProps) =>
    searchResultsData.hits.reduce((acc, hit, index) => {
      // TODO: Would these values ever not be set?
      const currentPage = searchResults.page ?? 0;
      const hitsPerPage = searchResults.hitsPerPage ?? 20;
      const resultIndex = `${currentPage * hitsPerPage + index + 1}`;
      let markerTag = resultIndex;

      if (index > 0) {
        const alphabeticalIndex = (index + 9).toString(36).toUpperCase();
        markerTag += alphabeticalIndex;
      }
      const phoneNumber = hit?.phones?.[0]?.number;
      const url = hit.type === "service" ? hit.url : hit.website;
      const basePath = hit.type === "service" ? `services` : `organizations`;
      // handle resources and services slightly differently.
      let entryId = hit.resource_id;
      if (hit.type === "service") {
        entryId = hit.service_id;
      }

      const nextHit = {
        ...hit,
        recurringSchedule: addRecurringScheduleToSeachHits(hits), // <-- added with addRecurringScheduleToHits()

        // MISSING
        resultIndex,
        markerTag: nextTag, // currently broken
        long_description: hit.long_description || "No description, yet...", // hit.long_description || "No description, yet..." -- added with default by `SearchEntry`
        path: `/${basePath}/${entryId}`, // `/${basePath}/${entryId}` -- used by `SearchEntry`
        headline: `${nextTag}. ${hit.name}`, // ${hitNumber}. ${hit.name} -- used by `SearchEntry`
        resource_path: hit.resource_id
          ? `/organizations/${hit.resource_id}`
          : "",
        geoLocPath: `http://google.com/maps/dir/?api=1&destination=${hit._geoloc.lat},${hit._geoloc.lng}`,
        phoneNumber,
        url,
      };
      acc.push(nextHit);
      return acc;
    }, []);

  const THEDATA = searchMapHitData(searchResults);

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
            {THEDATA.map((hit, index) => (
              <SearchResult
                hit={hit}
                // categoryId={categoryId} // Keep for category ticket
                key={`${hit.id} - ${hit.name}`}
              />
            ))}
            <ResultsPagination noResults={!hits || !hits.length} />
          </>
        )}
      </div>
      <SearchMap
        hits={THEDATA}
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
