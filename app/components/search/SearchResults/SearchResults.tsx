import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  connectStateResults,
  SearchResults as SearchResultsProps,
} from "react-instantsearch/connectors";
import { SearchMap } from "components/search/SearchMap/SearchMap";
import { formatPhoneNumber, renderAddressMetadata } from "utils";
import { removeAsterisksAndHashes } from "utils/strings";
import ResultsPagination from "components/search/Pagination/ResultsPagination";
import { Tooltip } from "react-tippy";
import { LabelTag } from "components/ui/LabelTag";
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

const SearchResult = ({ hit, index }: { hit: SearchHit; index: number }) => {
  const phoneNumber = hit?.phones?.[0]?.number;
  const url = hit.type === "service" ? hit.url : hit.website;
  const basePath = hit.type === "service" ? `services` : `organizations`;

  // TODO: since hit -> categories just come in as one array of category names, we need to compare them against a hardcoded list of top-level categories and display the ones that are NOT top-level in the subcategory LabelTags. Awaiting that PR.

  return (
    <div className={styles.searchResult}>
      <div className={styles.searchResultContentContainer}>
        <div>
          <div className={styles.titleContainer}>
            <div>
              <h2 className={styles.title}>
                {index}.{" "}
                <Link
                  to={{ pathname: `/${basePath}/${hit.id}` }}
                  className={`notranslate ${styles.titleLink}`}
                >
                  {hit.name}
                </Link>
              </h2>
              {hit.type === "service" && (
                <div className={styles.serviceOf}>
                  <Link
                    to={`/organizations/${hit.resource_id}`}
                    className={`notranslate ${styles.serviceOfLink}`}
                  >
                    {hit.service_of}
                  </Link>
                </div>
              )}
            </div>
            <div className={styles.searchResultSubcatContainer}>
              {hit.categories.length > 0 && (
                <LabelTag label={hit.categories[0].toString()} />
              )}
              {hit.categories.length > 1 && (
                <Tooltip
                  title={hit.categories.slice(1).join(", ")}
                  position="top"
                  trigger="mouseenter"
                  delay={100}
                  animation="none"
                  arrow
                >
                  <LabelTag
                    label={`+${hit.categories.length - 1}`}
                    withTooltip
                  />
                </Tooltip>
              )}
            </div>
          </div>
        </div>
        <div className={styles.searchResultContent}>
          <div className={styles.searchText}>
            <div className={`notranslate ${styles.address}`}>
              {renderAddressMetadata(hit)}
            </div>
            {/* Once we can update all dependencies, we can add remarkBreaks as remarkPlugin here */}
            <ReactMarkdown
              className={`rendered-markdown ${styles.description}`}
              source={
                hit.long_description
                  ? removeAsterisksAndHashes(hit.long_description)
                  : undefined
              }
              linkTarget="_blank"
            />
          </div>
        </div>
      </div>
      <div className={styles.sideLinks}>
        {phoneNumber && (
          <a
            href={`tel:${phoneNumber}`}
            className={`${styles.icon} ${styles["icon-phone"]}`}
          >
            <span className="sr-only">
              Call {formatPhoneNumber(phoneNumber)}
            </span>
          </a>
        )}
        {url && (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={url}
            className={`${styles.icon} ${styles["icon-popout"]}`}
          >
            <span className="sr-only">Go to website</span>
          </a>
        )}
        {/* Keep for phase 2: */}
        {/* {texting} */}
      </div>
    </div>
  );
};

// Connects the Algolia searchState and searchResults to this component
// Learn more here: https://community.algolia.com/react-instantsearch/connectors/connectStateResults.html
export default connectStateResults(SearchResults);
