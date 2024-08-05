import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "components/ui/Navigation/Navigation.module.scss";
import mobileNavigationStyles from "components/ui/Navigation/MobileNavigation.module.scss";
import desktopNavigationStyles from "components/ui/Navigation/DesktopNavigation.module.scss";
import { push as SidebarPushPanel } from "react-burger-menu";
import { GoogleTranslate } from "components/ui/GoogleTranslate";
import {
  StrapiModel,
  extractLogoFromNavigationResponse,
  extractNavigationMenusFromNavigationResponse,
  ExtractedNavigationMenusFromNavigationResponse,
} from "../../../models/Strapi";
import { Router } from "../../../Router";
import { useNavigationData } from "../../../hooks/StrapiAPI";
import { OUTER_CONTAINER_ID } from "../../../App";
import DesktopMenuItems from "./DesktopMenuItems";

const PAGE_WRAP_ID = "page-wrap";
const BURGER_STYLES = {
  bmBurgerButton: {
    display: "none",
  },
  bmCrossButton: {
    display: "none",
  },
  bmMenu: {
    padding: "0",
    borderLeft: "1px solid #f4f4f4",
    background: "white",
  },
  bmOverlay: {
    display: "none",
  },
};

export const Navigation = () => {
  const { data: navigationResponse } = useNavigationData();
  const [mobileNavigationSidebarIsOpen, setMobileNavigationSidebarIsOpen] =
    useState(false);
  const [activeMobileSubMenu, setActiveMobileSubMenu] = useState("");
  const toggleMobileNav = () =>
    setMobileNavigationSidebarIsOpen((prev) => !prev);
  const [activeDesktopSubMenu, setActiveDesktopSubMenu] = useState("");

  const logoData = extractLogoFromNavigationResponse(navigationResponse);
  const menuData =
    extractNavigationMenusFromNavigationResponse(navigationResponse);
  const mobileSubMenuIsActive = !!activeMobileSubMenu;
  const desktopSubMenuIsActive = !!activeDesktopSubMenu;

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

  const togglesetActiveDesktopSubMenu = (next: string) => {
    if (desktopSubMenuIsActive && activeDesktopSubMenu === next) {
      setActiveDesktopSubMenu("");
    } else {
      setActiveDesktopSubMenu(next);
    }
  };

  return (
    <>
      <SidebarPushPanel
        isOpen={mobileNavigationSidebarIsOpen}
        outerContainerId={OUTER_CONTAINER_ID}
        pageWrapId={PAGE_WRAP_ID}
        right
        styles={BURGER_STYLES}
        width="275px"
      >
        <div>
          {menuData?.map((menuDataItem) => (
            <MobileMenuItems
              menuItem={menuDataItem}
              activeMobileSubMenu={activeMobileSubMenu}
              setActiveMobileSubMenu={setActiveMobileSubMenu}
              key={menuDataItem.id}
            />
          ))}
          {mobileNavigationSidebarIsOpen && (
            <div className={styles.navigationMenuTranslate}>
              <GoogleTranslate />
            </div>
          )}
        </div>
      </SidebarPushPanel>
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

function menuItemHasLinks(
  menuItem: ExtractedNavigationMenusFromNavigationResponse[number]
): menuItem is StrapiModel.NavigationMenu {
  return "link" in menuItem;
}

/* 
TODO:
1. Move to separate component and import module.scss as styles
2. Address a11y issue where when you are in a submenu, you cannot exit with tab navigation. Need to be able to back tab to back arrow.

*/
const MobileMenuItems = ({
  menuItem,
  activeMobileSubMenu,
  setActiveMobileSubMenu,
}: {
  menuItem: ExtractedNavigationMenusFromNavigationResponse[number];
  activeMobileSubMenu: string;
  setActiveMobileSubMenu: (uniqueKey: string) => void;
}) => {
  if (menuItemHasLinks(menuItem)) {
    const uniqueKey = menuItem.title;
    return (
      <div
        className={mobileNavigationStyles.mobileNavigationMenuContainer}
        key={uniqueKey}
      >
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={activeMobileSubMenu === uniqueKey ? "true" : "false"}
          onClick={() => setActiveMobileSubMenu(uniqueKey)}
          className={mobileNavigationStyles.mobileNavigationMenuHeader}
        >
          {menuItem.title}
          <span
            className={`fas fa-chevron-right ${mobileNavigationStyles.chevron}`}
          />
        </button>
        <ul
          className={`${mobileNavigationStyles.mobileNavigationMenuList} ${
            activeMobileSubMenu === uniqueKey
              ? mobileNavigationStyles.mobileNavigationMenuListOpen
              : ""
          }`}
        >
          {menuItem.link.map((linkItem: StrapiModel.Link) => (
            <li
              key={linkItem.id}
              className={mobileNavigationStyles.mobileNavigationMenuListItem}
            >
              <Link
                to={linkItem.url}
                className={mobileNavigationStyles.mobileNavigationMenuLink}
              >
                {linkItem.text}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const uniqueKey = menuItem.url;
  return (
    <li
      key={uniqueKey}
      className={mobileNavigationStyles.mobileNavigationMenuListItem}
    >
      <Link
        to={menuItem.url}
        className={mobileNavigationStyles.mobileNavigationMenuLink}
      >
        {menuItem.text}
      </Link>
    </li>
  );
};

export default Navigation;
