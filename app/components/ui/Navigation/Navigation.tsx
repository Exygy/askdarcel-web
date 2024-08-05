import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "components/ui/Navigation/Navigation.module.scss";
import desktopNavigationStyles from "components/ui/Navigation/DesktopNavigation.module.scss";
import { GoogleTranslate } from "components/ui/GoogleTranslate";
import {
  extractLogoFromNavigationResponse,
  extractNavigationMenusFromNavigationResponse,
} from "../../../models/Strapi";
import { Router } from "../../../Router";
import { useNavigationData } from "../../../hooks/StrapiAPI";
import DesktopMenuItems from "./DesktopMenuItems";
import MobileNavigation from "./MobileNavigation";

const PAGE_WRAP_ID = "page-wrap";

export const Navigation = () => {
  const { data: navigationResponse } = useNavigationData();
  const [mobileNavigationSidebarIsOpen, setMobileNavigationSidebarIsOpen] =
    useState(false);
  const [activeMobileSubMenu, setActiveMobileSubMenu] = useState("");
  const toggleMobileNav = () =>
    setMobileNavigationSidebarIsOpen((prev) => !prev);

  const logoData = extractLogoFromNavigationResponse(navigationResponse);
  const menuData =
    extractNavigationMenusFromNavigationResponse(navigationResponse);
  const mobileSubMenuIsActive = !!activeMobileSubMenu;

  const pushPanelIconDisplay = () => {
    if (mobileNavigationSidebarIsOpen && mobileSubMenuIsActive) {
      return "fa-arrow-left";
    }
    if (mobileNavigationSidebarIsOpen) {
      return "fa-xmark";
    }

    return ` fa-bars`;
  };

  const handleActivatePushPanelClick = () => {
    if (mobileSubMenuIsActive) {
      setActiveMobileSubMenu("");
    } else {
      toggleMobileNav();
    }
  };

  return (
    <>
      <MobileNavigation
        isOpen={mobileNavigationSidebarIsOpen}
        setIsOpen={setMobileNavigationSidebarIsOpen}
        menuData={menuData}
      />
      <div id={PAGE_WRAP_ID}>
        <nav className={styles.siteNav}>
          <div className={styles.primaryRow}>
            <div className={styles.navLeft}>
              <Link className={`${styles.navLogo}`} to="/">
                <img src={logoData?.url} alt={logoData?.alternativeText} />
              </Link>
            </div>

            <div className={`${styles.navRight}`}>
              <div
                className={desktopNavigationStyles.desktopNavigationContainer}
              >
                {menuData?.map((menuDataItem) => (
                  <DesktopMenuItems
                    menuItem={menuDataItem}
                    key={menuDataItem.id}
                  />
                ))}
              </div>
              <div className={styles.navigationMenuTranslate}>
                <GoogleTranslate />
              </div>
            </div>
            <button
              type="button"
              aria-label="navigation menu"
              className={`fas ${pushPanelIconDisplay()} ${
                styles.activatePushPanelButton
              }`}
              onClick={handleActivatePushPanelClick}
            />
          </div>
        </nav>
        <div className="container">
          <Router />
        </div>
      </div>
    </>
  );
};

export default Navigation;
