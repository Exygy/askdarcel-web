import React, { useEffect, useState } from "react";
// Todo: Once GA sunsets the UA analytics tracking come July 2023, we can remove the "react-ga"
// package and all references to it:
// https://support.google.com/analytics/answer/12938611#zippy=%2Cin-this-article
import TagManager from "react-gtm-module";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { UserLocation, getLocation, websiteConfig, AppProvider } from "./utils";
import { Footer } from "components/ui/Footer/Footer";
import { Navigation } from "components/ui/Navigation/Navigation";
import { Loader } from "components/ui/Loader";

import MetaImage from "./assets/img/our415-og.png";
import styles from "./App.module.scss";
import config from "./config";
import { AroundRadius } from "algoliasearch";

const { siteUrl, title } = websiteConfig;
export const OUTER_CONTAINER_ID = "outer-container";

// Debug: Log the GA4 ID to see if it's being passed through

TagManager.initialize({ gtmId: config.GOOGLE_ANALYTICS_GA4_ID });

export const App = () => {
  const location = useLocation();
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [aroundLatLng, setAroundLatLng] = useState<string>("");
  const [aroundUserLocationRadius, setAroundRadius] =
    useState<AroundRadius>(1600);
  const [boundingBox, setBoundingBox] = useState<string | undefined>(undefined);

  useEffect(() => {
    getLocation().then((userLocation) => {
      setUserLocation(userLocation);
      setAroundLatLng(`${userLocation.coords.lat},${userLocation.coords.lng}`);
    });
  }, [location, setAroundLatLng]);

  if (!userLocation) {
    return <Loader />;
  }

  const props = {
    userLocation,
    aroundLatLng,
    setAroundLatLng,
    aroundUserLocationRadius,
    setAroundRadius,
    boundingBox,
    setBoundingBox,
  };

  return (
    <div
      id={OUTER_CONTAINER_ID}
      className={styles.outerContainer}
      data-testid={"app-container"}
    >
      <AppProvider {...props}>
        <Helmet>
          <title>{title}</title>
          <meta property="og:url" content={siteUrl} />
          <meta property="og:title" content={title} />
          <meta
            property="og:description"
            content="Our 415 is your source for everything San Francisco has for young people and families."
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
