import React, { FormEvent, useEffect, useState } from "react";
import { useSearchQuery } from "../../search/hooks";
import classNames from "classnames";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
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
  const [, setSearchParams] = useSearchParams();

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    if (location.pathname === "/search") {
      setQuery(inputValue);
      // Keep URL in sync so back navigation restores the correct query
      setSearchParams({ q: inputValue }, { replace: true });
      window.scrollTo(0, 0);
    } else {
      navigate(`/search?q=${encodeURIComponent(inputValue)}`);
    }
    return false;
  };

  // Sync input with InstantSearch query
  useEffect(() => {
    setInputValue(query);
  }, [query]);

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
