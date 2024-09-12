import React, { useEffect, useState } from "react";
// Todo: Once GA sunsets the UA analytics tracking come July 2023, we can remove the "react-ga"
// package and all references to it:
// https://support.google.com/analytics/answer/12938611#zippy=%2Cin-this-article
import ReactGA_4 from "react-ga4";
import { Helmet } from "react-helmet-async";
import { useHistory } from "react-router-dom";
import {
  GeoCoordinates,
  getLocation,
  websiteConfig,
  AppProvider,
} from "./utils";
import { Footer, Navigation, Loader } from "./components/ui";

import MetaImage from "./assets/img/Our415_OG.png";
import styles from "./App.module.scss";
import { useLocation } from "react-router-dom";
import { useCookies } from "react-cookie";
import qs, { ParsedQs } from "qs";
import { translate } from "utils/DataService";
import { AroundRadius } from "algoliasearch";
import config from "./config";

const { siteUrl, title } = websiteConfig;
export const OUTER_CONTAINER_ID = "outer-container";

interface ConfigureState {
  aroundRadius?: AroundRadius;
  [key: string]: any;
}

const INDEX_NAME = `${config.ALGOLIA_INDEX_PREFIX}_services_search`;

interface SearchState extends ParsedQs {
  configure?: ConfigureState;
  query?: string | null;
  [key: string]: any;
}

export const App = () => {
  const [cookies] = useCookies(["googtrans"]);
  const { search } = useLocation();
  const history = useHistory();
  const [userLocation, setUserLocation] = useState<GeoCoordinates | null>(null);
  const [searchState, setSearchState] = useState<SearchState | null>(null);

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
    delete qsParams["production_services_search[query]"];
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

  useEffect(() => {
    getLocation().then((loc) => {
      setUserLocation(loc);
    });

    if (config.GOOGLE_ANALYTICS_GA4_ID) {
      ReactGA_4.initialize(config.GOOGLE_ANALYTICS_GA4_ID);
    }

    return history.listen((loc) => {
      setTimeout(() => {
        /* We call setTimeout here to give our views time to update the document title before
           GA sends its page view event
        */
        const page = loc.pathname + loc.search;
        ReactGA_4.send({
          hitType: "pageview",
          page,
        });
      }, 500);
    });
  }, [history]);

  if (userLocation === null) {
    return <Loader />;
  }

  return (
    <div id={OUTER_CONTAINER_ID} className={styles.outerContainer}>
      <AppProvider userLocation={userLocation}>
        <Helmet>
          <title>{title}</title>
          <meta property="og:url" content={siteUrl} />
          <meta property="og:title" content={title} />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@sheltertechorg" />
          <meta
            property="og:description"
            content="Get guided help finding food, housing, health resources and more in San Francisco"
          />
          <meta property="og:image" content={MetaImage} />
          <meta property="og:type" content="website" />
          <meta property="og:image:type" content="image/png" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
        </Helmet>
        <Navigation />
        <Footer />
      </AppProvider>
    </div>
  );
};
