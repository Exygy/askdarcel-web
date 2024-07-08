import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "components/ui/Navigation.module.scss";
import { push as SidebarPushPanel } from "react-burger-menu";
import {
  StrapiModel,
  extractLogoFromNavigationResponse,
  extractNavigationMenusFromNavigationResponse,
  ExtractedNavigationMenusFromNavigationResponse,
} from "../../models/Strapi";
import { PopUpMessage, PopupMessageProp } from "../../components/ui";
import { Router } from "../../Router";
import { useNavigationData } from "../../hooks/StrapiAPI";
import { OUTER_CONTAINER_ID } from "../../App";
import { GoogleTranslate } from "components/ui/GoogleTranslate";

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

const Navigation = () => {
  const [mobileNavigationSidebarIsOpen, setMobileNavigationSidebarIsOpen] =
    useState(false);
  const [
    mobileSubNavigationSidebarIsOpen,
    setMobileSubNavigationSidebarIsOpen,
  ] = useState(false);
  const toggleMobileNav = () =>
    setMobileNavigationSidebarIsOpen((prev) => !prev);
  const toggleMobileSubNav = () =>
    setMobileSubNavigationSidebarIsOpen((prev) => !prev);
  const [desktopNavigationdropdownIsOpen, setdesktopNavigationDropdownIsOpen] =
    useState(false);
  const toggledesktopNavigationDropdownIsOpen = () =>
    setdesktopNavigationDropdownIsOpen((prev) => !prev);
  const [popUpMessage, setPopUpMessage] = useState<PopupMessageProp>({
    message: "",
    visible: false,
    type: "success",
  });
  const { data: navigationResponse, error, isLoading } = useNavigationData();
  const logoData = extractLogoFromNavigationResponse(navigationResponse);
  const menuData =
    extractNavigationMenusFromNavigationResponse(navigationResponse);

  const mobileNavigationButtonIcon = () => {
    if (mobileNavigationSidebarIsOpen && mobileSubNavigationSidebarIsOpen) {
      return "fa-arrow-left";
    }
    if (mobileNavigationSidebarIsOpen) {
      return "fa-xmark";
    }

    return ` fa-bars`;
  };

  const handleMobileNavigationOnClick = () => {
    if (mobileNavigationSidebarIsOpen && mobileSubNavigationSidebarIsOpen) {
      toggleMobileSubNav();
    } else {
      toggleMobileNav();
    }
  };

  // TODO: What do we want here?
  if (error || menuData === null) {
    return <span>ERROR</span>;
  }

  // TODO: What do we want here?
  if (isLoading) {
    return <span>is loading...</span>;
  }

  return (
    <>
      <span className={styles.mobileNavigationContainer}>
        <SidebarPushPanel
          isOpen={
            mobileNavigationSidebarIsOpen || mobileSubNavigationSidebarIsOpen
          }
          outerContainerId={OUTER_CONTAINER_ID}
          pageWrapId={PAGE_WRAP_ID}
          right
          styles={BURGER_STYLES}
          width={"275px"}
        >
          <div className={styles.mobileMenuItemsContainer}>
            {menuData.map((menuDataItem) => (
              <MobileNavigationMenuDataItemRenderer
                menuItem={menuDataItem}
                mobileSubNavigationSidebarIsOpen={
                  mobileSubNavigationSidebarIsOpen
                }
                toggleMobileSubNav={toggleMobileSubNav}
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
      </span>
      <div id={PAGE_WRAP_ID}>
        <nav className={styles.siteNav}>
          <div className={styles.primaryRow}>
            <div className={styles.navLeft}>
              <Link className={`${styles.navLogo}`} to="/">
                <img src={logoData?.url} alt={logoData?.alternativeText} />
              </Link>
            </div>

            <ul className={`${styles.navRight}`}>
              <div className={styles.desktopMenuItemsContainer}>
                {menuData.map((menuDataItem) => (
                  <DesktoptopLevelNavigationMenuItemRenderer
                    menuItem={menuDataItem}
                    desktopNavigationdropdownIsOpen={
                      desktopNavigationdropdownIsOpen
                    }
                    toggledesktopNavigationDropdownIsOpen={
                      toggledesktopNavigationDropdownIsOpen
                    }
                    key={menuDataItem.id}
                  />
                ))}
              </div>
              <div className={styles.navigationMenuTranslate}>
                <GoogleTranslate />
              </div>
            </ul>
            <button
              type="button"
              aria-label="navigation menu"
              className={`fas ${mobileNavigationButtonIcon()} ${
                styles.mobileNavigationButton
              }`}
              onClick={handleMobileNavigationOnClick}
            />
          </div>
        </nav>
        <div className="container">
          <Router setPopUpMessage={setPopUpMessage} />
        </div>
        {popUpMessage && <PopUpMessage popUpMessage={popUpMessage} />}
      </div>
    </>
  );
};

function menuItemHasLinks(
  menuItem: ExtractedNavigationMenusFromNavigationResponse[number]
): menuItem is StrapiModel.NavigationMenu {
  return "link" in menuItem;
}

const DesktoptopLevelNavigationMenuItemRenderer = ({
  menuItem,
  desktopNavigationdropdownIsOpen,
  toggledesktopNavigationDropdownIsOpen,
}: {
  menuItem: ExtractedNavigationMenusFromNavigationResponse[number];
  desktopNavigationdropdownIsOpen: boolean;
  toggledesktopNavigationDropdownIsOpen: () => void;
}) => {
  if (menuItemHasLinks(menuItem)) {
    return (
      <>
        <div
          className={styles.navigationMenuContainer}
          key={menuItem.id.toString()}
        >
          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={desktopNavigationdropdownIsOpen ? "true" : "false"}
            onClick={toggledesktopNavigationDropdownIsOpen}
            className={styles.navigationMenuHeader}
          >
            {menuItem.title}
            <span className={`fas fa-chevron-down ${styles.chevron}`} />
          </button>

          <ul
            style={{
              display: desktopNavigationdropdownIsOpen ? "block" : "none",
            }}
            className={`${styles.navigationMenuList}`}
          >
            {menuItem.link.map((linkItem: StrapiModel.Link) => (
              <li key={linkItem.id} className={styles.navigationMenuListItem}>
                <Link to={linkItem.url} className={styles.navigationMenuLink}>
                  {linkItem.text}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </>
    );
  } else {
    return (
      <li key={menuItem.id}>
        <Link to={menuItem.url} className={styles.navigationMenuLink}>
          {menuItem.text}
        </Link>
      </li>
    );
  }
};

const MobileNavigationMenuDataItemRenderer = ({
  menuItem,
  mobileSubNavigationSidebarIsOpen,
  toggleMobileSubNav,
}: {
  menuItem: ExtractedNavigationMenusFromNavigationResponse[number];
  mobileSubNavigationSidebarIsOpen: boolean;
  toggleMobileSubNav: () => void;
}) => {
  if (menuItemHasLinks(menuItem)) {
    return (
      <div
        className={styles.mobileNavigationMenuContainer}
        key={menuItem.id.toString()}
      >
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={mobileSubNavigationSidebarIsOpen ? "true" : "false"}
          onClick={toggleMobileSubNav}
          className={`${styles.mobileNavigationMenuHeader}`}
        >
          {menuItem.title}
          <span className={`fas fa-chevron-right ${styles.chevron}`} />
        </button>
        <ul
          className={`${styles.mobileNavigationMenuList} ${
            mobileSubNavigationSidebarIsOpen
              ? styles.mobileNavigationMenuListOpen
              : ""
          }`}
        >
          {menuItem.link.map((linkItem: StrapiModel.Link) => (
            <li
              key={linkItem.id}
              className={styles.mobileNavigationMenuListItem}
            >
              <Link to={linkItem.url} className={styles.navigationMenuLink}>
                {linkItem.text}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  } else {
    return (
      <li key={menuItem.id} className={styles.mobileNavigationMenuListItem}>
        <Link to={menuItem.url} className={styles.mobileNavigationMenuLink}>
          {menuItem.text}
        </Link>
      </li>
    );
  }
};

export default Navigation;
