import React, { FormEvent, useState } from "react";
import { useHistory } from "react-router-dom";
import cn from "classnames";
import qs from "qs";
import { useSiteSearch } from "hooks/SiteSearch";
import styles from "./SiteSearchInput.module.scss";
import { useSearchBox } from "react-instantsearch";

/**
 * Sitewide listing search component
 *
 * - Updates the url querystring on every search
 * - Allows empty searches by removing `query=` query param from querystring
 */
export const SiteSearchInput = (props: any) => {
  // const { query, setQuery } = useSiteSearch();
  const { query, refine, clear } = useSearchBox(props);
  const history = useHistory();
  const [inputValue, setInputValue] = useState(query);

  // eg: `?page=1` -> `page=1`
  const removeQueryStringStart = (querystring: string) => querystring.slice(1);
  function setQuery(newQuery: any) {
    setInputValue(newQuery);
  }

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    // const queryString = removeQueryStringStart(window.location.search);
    // const searchState = qs.parse(queryString);

    // if (inputValue) {
    //   searchState.query = inputValue;
    //   searchState.page = "1";
    // } else {
    //   delete searchState.query;
    // }
    // history.push(`/search?${qs.stringify(searchState)}`);
    refine(inputValue);

    return false;
  };

  return (
    <form
      onSubmit={submitSearch}
      className={cn([styles.navSearch, "search-container", "form-row"])}
      role="search"
    >
      <input
        onChange={(e) => setQuery(e.target.value)}
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
