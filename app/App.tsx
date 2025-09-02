import React, { useEffect, useState } from "react";
// Todo: Once GA sunsets the UA analytics tracking come July 2023, we can remove the "react-ga"
// package and all references to it:
// https://support.google.com/analytics/answer/12938611#zippy=%2Cin-this-article
import ReactGA_4 from "react-ga4";
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

    if (config.GOOGLE_ANALYTICS_GA4_ID) {
      ReactGA_4.initialize(config.GOOGLE_ANALYTICS_GA4_ID);
    }

    setTimeout(() => {
      // We call setTimeout here to give our views time to update the document
      // title beforeGA sends its page view event
      // TODO: This hack is old. Let's figure out if it is still necessary or
      // there is a different modern approach
      // (see: https://stackoverflow.com/questions/2497200/how-to-listen-for-changes-to-the-title-element/29540461#29540461)
      const page = location.pathname + location.search;
      ReactGA_4.send({
        hitType: "pageview",
        page,
      });
    }, 500);
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
