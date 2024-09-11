import React, { useState } from "react";
import SearchResults from "components/search/SearchResults/SearchResults";
import Sidebar from "components/search/Sidebar/Sidebar";
import { Header } from "components/search/Header/Header";
import styles from "./SearchResultsPage.module.scss";
import { useAppContext } from "utils";
import { Loader } from "components/ui";

/** Wrapper component that handles state management, URL parsing, and external API requests. */
export const SearchResultsPage = () => {
  const [isMapCollapsed, setIsMapCollapsed] = useState(false);
  const { userLocation } = useAppContext();

  if (!userLocation) {
    return <Loader />;
  }

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.flexContainer}>
        <Sidebar
          isSearchResultsPage
          isMapCollapsed={isMapCollapsed}
          setIsMapCollapsed={setIsMapCollapsed}
        />

        <div className={styles.results}>
          <SearchResults mobileMapIsCollapsed={isMapCollapsed} />
        </div>
      </div>
    </div>
  );
};
