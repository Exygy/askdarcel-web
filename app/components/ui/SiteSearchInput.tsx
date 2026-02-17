import React, { FormEvent, useEffect, useState } from "react";
import { useSearchQuery } from "../../search/hooks";
import classNames from "classnames";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./SiteSearchInput.module.scss";

/**
 * Sitewide search input. On submit, either navigates to /search (from other pages)
 * or directly updates the InstantSearch query (when already on /search).
 */
export const SiteSearchInput = () => {
  const { query, setQuery } = useSearchQuery();
  const [inputValue, setInputValue] = useState(query);
  const navigate = useNavigate();
  const location = useLocation();

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    if (location.pathname === "/search") {
      // Already on the search page: update the query directly via
      // InstantSearch's helper. Navigating would change the URL and
      // cause the historyRouter to reset the query to default.
      setQuery(inputValue);
      window.scrollTo(0, 0);
    } else {
      navigate("/search", { state: { searchQuery: inputValue } });
    }
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
