import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useCookies } from "react-cookie";
import { Helmet } from "react-helmet-async";
import { liteClient } from "algoliasearch/lite";
import { InstantSearch, Configure, SearchBox } from "react-instantsearch";
import qs, { ParsedQs } from "qs";

import { GeoCoordinates, useAppContext, websiteConfig } from "utils";
import { translate } from "utils/DataService";

import { Loader } from "components/ui";
import SearchResults from "components/search/SearchResults/SearchResults";
import Sidebar from "components/search/Sidebar/Sidebar";
import { Header } from "components/search/Header/Header";
import config from "../../config";
import styles from "./SearchResultsPage.module.scss";
import { history as instantSearchHistory } from "instantsearch.js/es/lib/routers";
import { SiteSearchInput } from "components/ui/SiteSearchInput";
import { AroundRadius } from "algoliasearch";

/* eslint-disable @typescript-eslint/no-unsafe-argument */
const searchClient = liteClient(
  config.ALGOLIA_APPLICATION_ID,
  config.ALGOLIA_READ_ONLY_API_KEY
);
/* eslint-enable @typescript-eslint/no-unsafe-argument */

interface ConfigureState {
  aroundRadius?: AroundRadius;
  [key: string]: any;
}

interface SearchState extends ParsedQs {
  configure?: ConfigureState;
  query?: string | null;
  [key: string]: any;
}

const INDEX_NAME = `${config.ALGOLIA_INDEX_PREFIX}_services_search`;

/** Wrapper component that handles state management, URL parsing, and external API requests. */
export const SearchResultsPage = () => {
  const [cookies] = useCookies(["googtrans"]);
  const history = useHistory();
  const { search } = useLocation();
  const { userLocation } = useAppContext();
  const [lastPush, setLastPush] = useState(Date.now());
  const [isMapCollapsed, setIsMapCollapsed] = useState(false);

  const [searchState, setSearchState] = useState<SearchState | null>(null);
  const [searchRadius, setSearchRadius] = useState(
    searchState?.configure?.aroundRadius ?? "all"
  );
  const [aroundLatLang, setAroundLatLng] = useState({
    lat: userLocation?.lat,
    lng: userLocation?.lng,
  });

  // In cases where we translate a query into English, we use this value
  // to represent the user's original, untranslated input. The untranslatedQuery
  // is displayed in the UI and stored in the URL params.
  // This untranslatedQuery value is also checked against when a new search is triggered
  // to determine if the user has input a different query (vs. merely selecting refinements),
  // in which case we need to call the translation API again
  const [untranslatedQuery, setUntranslatedQuery] = useState<string | null>(
    null
  );
  const [translatedQuery, setTranslatedQuery] = useState<string | null>(null);
  const [nonQuerySearchParams, setNonQuerySearchParams] = useState<SearchState>(
    {}
  );

  useEffect(() => {
    const qsParams = qs.parse(search.slice(1));
    setUntranslatedQuery(
      qsParams[`${INDEX_NAME}.query}`]
        ? (qsParams[`${INDEX_NAME}.query}`] as string)
        : ""
    );
    // delete qsParams["production_services_search[query]"];
    setNonQuerySearchParams(qsParams);
  }, [search]);

  useEffect(() => {
    if (untranslatedQuery === null) {
      return;
    }

    let queryLanguage = "en";
    // Google Translate determines translation source and target with a
    // "googtrans" cookie. If the cookie exists, we assume that the
    // the query should be translated into English prior to querying Algolia
    const translationCookie = cookies.googtrans;
    if (translationCookie) {
      [, queryLanguage] = translationCookie.split("/en/");
    }

    const emptyQuery = untranslatedQuery.length === 0;
    if (queryLanguage === "en" || emptyQuery) {
      setTranslatedQuery(untranslatedQuery);
    } else if (untranslatedQuery) {
      translate(untranslatedQuery, queryLanguage).then((result) =>
        setTranslatedQuery(result)
      );
    }
  }, [untranslatedQuery, cookies.googtrans]);

  useEffect(() => {
    setSearchState({ ...nonQuerySearchParams, query: translatedQuery });
  }, [translatedQuery, nonQuerySearchParams]);

  if (
    translatedQuery === null ||
    searchState === null ||
    userLocation === null
  ) {
    return <Loader />;
  }

  return (
    <div className={styles.container}>
      <Helmet>
        <title>{`${searchState.query ?? "Services"} in San Francisco | ${
          websiteConfig.title
        }`}</title>
        <meta
          name="description"
          content={`A list of ${
            searchState.query ?? "services"
          } in San Francisco`}
        />
      </Helmet>

      <Header resultsTitle="All categories" />

      <InstantSearch
        searchClient={searchClient}
        indexName={INDEX_NAME}
        initialUiState={searchState}
        onStateChange={({ uiState, setUiState }) => {
          setUiState(uiState);
          const THRESHOLD = 700;
          const newPush = Date.now();
          setLastPush(newPush);
          const urlParams = {
            ...uiState,
          };
        }}
        routing={true}
      >
        <Configure
          aroundLatLng={`${aroundLatLang.lat}, ${aroundLatLang.lng}`}
          aroundRadius={searchRadius}
          aroundPrecision={1600}
        />
        <SiteSearchInput />
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
      </InstantSearch>
    </div>
  );
};
