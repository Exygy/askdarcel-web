import React, { useState } from "react";
import SearchResults from "components/search/SearchResults/SearchResults";
import Sidebar from "components/search/Sidebar/Sidebar";
import { Header } from "components/search/Header/Header";
import styles from "./SearchResultsPage.module.scss";
import { useGeoSearch } from "react-instantsearch-core";

/** Wrapper component that handles state management, URL parsing, and external API requests. */
export const SearchResultsPage = () => {
  const [isMapCollapsed, setIsMapCollapsed] = useState(false);
  const { items, refine } = useGeoSearch();

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.flexContainer}>
        <Sidebar
          setSearchRadius={setSearchRadius}
          searchRadius={searchRadius}
          isSearchResultsPage
          isMapCollapsed={isMapCollapsed}
          setIsMapCollapsed={setIsMapCollapsed}
        />

        <div className={styles.results}>
          <SearchResults
            mobileMapIsCollapsed={isMapCollapsed}
            setAroundLatLng={setAroundLatLng}
            searchQuery={untranslatedQuery}
          />
        </div>
      </div>
    </div>
  );
};
