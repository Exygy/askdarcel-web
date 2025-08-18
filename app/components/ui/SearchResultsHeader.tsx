import React from "react";
import styles from "components/SearchAndBrowse/SearchResults/SearchResults.module.scss";
import ClearSearchButton from "components/SearchAndBrowse/Refinements/ClearSearchButton";
import { HITS_PER_PAGE } from "pages/SearchResultsPage/SearchResultsPage";

/**
 * Layout component for the header above the search results list that allows for
 * flexible composition of child components.
 */
export const SearchResultsHeader = ({
  currentPage,
  totalResults,
}: {
  currentPage: number;
  totalResults: number;
}) => {
  const firstResultIndex = currentPage * HITS_PER_PAGE + 1;
  const lastResultIndex = Math.min(
    (currentPage + 1) * HITS_PER_PAGE,
    totalResults
  );
  return (
    <div className={styles.searchResultsHeader}>
      <h2 style={{ fontWeight: 500, fontSize: 16 }}>
        Showing <span style={{ fontWeight: 700 }}>{firstResultIndex}</span> -{" "}
        <span style={{ fontWeight: 700 }}>{lastResultIndex}</span> of{" "}
        <span style={{ fontWeight: 700 }}>{totalResults}</span> results
      </h2>
      <ClearSearchButton />
    </div>
  );
};
