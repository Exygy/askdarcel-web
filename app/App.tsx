import React, { useEffect, useState } from "react";
// Todo: Once GA sunsets the UA analytics tracking come July 2023, we can remove the "react-ga"
// package and all references to it:
// https://support.google.com/analytics/answer/12938611#zippy=%2Cin-this-article
import ReactGA_4 from "react-ga4";
import Intercom from "react-intercom";
import { Helmet } from "react-helmet-async";
import { useHistory, Link, NavLink } from "react-router-dom";
import Translate from "components/ui/Translate";
import navigationStyles from "components/ui/Navigation.module.scss";
import { push as Menu } from "react-burger-menu";
import {
  StrapiModel,
  extractLogoFromNavigationResponse,
  extractNavigationMenusFromNavigationResponse,
} from "./models/Strapi";
import { GeoCoordinates, getLocation, whiteLabel, AppProvider } from "./utils";
import {
  Banner,
  PopUpMessage,
  PopupMessageProp,
  UserWay,
} from "./components/ui";
import { Router } from "./Router";
import config from "./config";
import MetaImage from "./assets/img/sfsg-preview.png";
import styles from "./App.module.scss";
import { useNavigationData } from "./hooks/StrapiAPI";

const { intercom, showBanner, siteUrl, title, userWay } = whiteLabel;
const outerContainerId = "outer-container";
const pageWrapId = "page-wrap";
const burgerStyles = {
  bmBurgerButton: {
    display: "none",
  },
  bmCrossButton: {
    display: "none",
  },
  bmMenu: {
    padding: "0",
    borderLeft: "1px solid #f4f4f4",
  },
  bmOverlay: {
    display: "none",
  },
};

const NavigationWrapper = () => {
  const [hamburgerisOpen, setHamburgerisOpen] = useState(false);
  const toggleHamburgerMenu = () => setHamburgerisOpen((prev) => !prev);
  const [popUpMessage, setPopUpMessage] = useState<PopupMessageProp>({
    message: "",
    visible: false,
    type: "success",
  });
  const { data: navigationResponse, error, isLoading } = useNavigationData();
  const [dropdown, setDropdown] = useState(false);
  const logoData = extractLogoFromNavigationResponse(navigationResponse);
  const menus =
    extractNavigationMenusFromNavigationResponse(navigationResponse);

  // TODO
  if (error) {
    return <span>ERROR</span>;
  }

  // TODO
  if (isLoading) {
    return <span>is loading...</span>;
  }

  console.log(hamburgerisOpen);

  return (
    <div id={pageWrapId}>
      <nav className={navigationStyles.siteNav}>
        <div className={navigationStyles.primaryRow}>
          <div className={navigationStyles.navLeft}>
            <Link className={`${navigationStyles.navLogo}`} to="/">
              <img src={logoData?.url} alt={logoData?.alternativeText} />
            </Link>
          </div>
          <span className={styles.hamburgerContainer}>
            <Menu
              isOpen={hamburgerisOpen}
              onStateChange={() => toggleHamburgerMenu}
              outerContainerId={outerContainerId}
              pageWrapId={pageWrapId}
              right
              styles={burgerStyles}
              width="275px"
            >
              {menus?.map((menu) => (
                <div className={} key={menu.id.toString()}>
                  <button
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={dropdown ? "true" : "false"}
                    onClick={() => setDropdown((prev) => !prev)}
                  >
                    {menu.title}
                  </button>

                  <ul>
                    {menu.link.map((linkItem: StrapiModel.Link) => (
                      <li key={linkItem.id} className="menu-item">
                        <Link to={linkItem.url}>{linkItem.text}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </Menu>
          </span>
          <ul className={navigationStyles.navRight}>
            {menus?.map((menu) => (
              <div
                className={navigationStyles.menuContainer}
                key={menu.id.toString()}
              >
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={dropdown ? "true" : "false"}
                  onClick={() => setDropdown((prev) => !prev)}
                >
                  {menu.title}
                </button>

                <ul
                  className={`${navigationStyles.dropdown} ${
                    dropdown ? navigationStyles.showDropdown : ""
                  }`}
                >
                  {menu.link.map((linkItem: StrapiModel.Link) => (
                    <li key={linkItem.id} className="menu-item">
                      <Link to={linkItem.url}>{linkItem.text}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <Translate />
          </ul>
          <div className={navigationStyles.mobileNavigation}>
            <button
              type="button"
              aria-label="navigation menu"
              className={navigationStyles.hamburgerButton}
              onClick={toggleHamburgerMenu}
            />
          </div>
        </div>
      </nav>
      {showBanner && <Banner />}
      <div className="container">
        <Router setPopUpMessage={setPopUpMessage} />
      </div>
      {popUpMessage && <PopUpMessage popUpMessage={popUpMessage} />}
    </div>
  );
};

export const App = () => {
  const history = useHistory();
  const [userLocation, setUserLocation] = useState<GeoCoordinates | null>(null);

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

  return (
    <div id={outerContainerId} className={styles.outerContainer}>
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
        {userWay && <UserWay appID={config.SFFAMILIES_USERWAY_APP_ID} />}
        {intercom && config.INTERCOM_APP_ID && (
          <Intercom appID={config.INTERCOM_APP_ID} />
        )}
        <NavigationWrapper />
      </AppProvider>
    </div>
  );
};
