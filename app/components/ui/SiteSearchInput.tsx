import React, { FormEvent, useEffect, useState } from "react";
import { useSearchQuery } from "../../search/hooks";
import classNames from "classnames";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./SiteSearchInput.module.scss";

/**
 * Sitewide search input. On submit, navigates to /search with query in state.
 * SearchResultsPage sets the query after its config is ready.
 */
export const SiteSearchInput = () => {
  const { query } = useSearchQuery();
  const [inputValue, setInputValue] = useState(query);
  const navigate = useNavigate();
  const location = useLocation();

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate("/search", { state: { searchQuery: inputValue } });
    return false;
  };

  // Sync input with InstantSearch query, unless we just navigated with a searchQuery
  useEffect(() => {
    const stateQuery = (location.state as { searchQuery?: string })
      ?.searchQuery;
    if (!stateQuery) {
      setInputValue(query);
    }
  }, [query, location.state]);

  return (
    <form
      onSubmit={submitSearch}
      className={classNames(styles.navSearch, "no-print")}
      role="search"
    >
      <input
        onChange={(e) => setInputValue(e.target.value)}
        value={inputValue}
        type="text"
        className={styles.searchField}
        placeholder="Search for a service or organization"
        name="srch-term"
        id="srch-term"
      />
      <button
        type="submit"
        aria-label="Search"
        className={`${styles.searchIcon} fa-solid fa-magnifying-glass`}
      />
    </form>
  );
};
