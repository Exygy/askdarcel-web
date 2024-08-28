import React from "react";
import mobileNavigationStyles from "components/ui/Navigation/MobileNavigation.module.scss";

import { useNavigationData } from "hooks/StrapiAPI";
import { Link } from "react-router-dom";
import {
  ExtractedNavigationMenusFromNavigationResponse,
  extractNavigationMenusFromNavigationResponse,
  StrapiModel,
} from "models/Strapi";
import { GoogleTranslate } from "../GoogleTranslate";

interface MobileNavigationProps {
  isOpen: boolean;
  activeSubMenu: string;
  setSubMenu: (value: string) => void;
}

export const MobileNavigation = ({
  isOpen,
  activeSubMenu,
  setSubMenu,
}: MobileNavigationProps) => {
  const { data: navigationResponse } = useNavigationData();

  const menuData =
    extractNavigationMenusFromNavigationResponse(navigationResponse);

  function menuItemHasLinks(
    menuItem: ExtractedNavigationMenusFromNavigationResponse[number]
  ): menuItem is StrapiModel.NavigationMenu {
    return "link" in menuItem;
  }
  const closeMobileMenu = () => {
    setSubMenu("");
  };

  return (
    <>
      <div className={mobileNavigationStyles.mobileNavigationContainer}>
        {menuData?.map((menuDataItem) => {
          if (menuItemHasLinks(menuDataItem)) {
            const uniqueKey = menuDataItem.title;

            return (
              <div
                className={mobileNavigationStyles.mobileNavigationMenuContainer}
                key={uniqueKey}
              >
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={activeSubMenu === uniqueKey ? "true" : "false"}
                  onClick={() => setSubMenu(uniqueKey)}
                  className={mobileNavigationStyles.mobileNavigationMenuHeader}
                >
                  {menuDataItem.title}
                  <span
                    className={`fas fa-chevron-right ${mobileNavigationStyles.chevron}`}
                  />
                </button>
                <ul
                  className={`${
                    mobileNavigationStyles.mobileNavigationMenuList
                  } ${
                    activeSubMenu === uniqueKey
                      ? mobileNavigationStyles.mobileNavigationMenuListOpen
                      : ""
                  }`}
                >
                  {menuDataItem.link.map((linkItem: StrapiModel.Link) => (
                    <li
                      key={linkItem.id}
                      className={
                        mobileNavigationStyles.mobileNavigationMenuListItem
                      }
                    >
                      <Link
                        to={linkItem.url}
                        className={
                          mobileNavigationStyles.mobileNavigationMenuLink
                        }
                        onClick={closeMobileMenu}
                      >
                        {linkItem.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          }

          return (
            <li
              key={menuDataItem.url}
              className={mobileNavigationStyles.mobileNavigationMenuListItem}
            >
              <Link
                to={menuDataItem.url}
                className={mobileNavigationStyles.mobileNavigationMenuLink}
                onClick={closeMobileMenu}
              >
                {menuDataItem.text}
              </Link>
            </li>
          );
        })}
      </div>
      {isOpen && (
        <div className={mobileNavigationStyles.mobileNavigationMenuTranslate}>
          <GoogleTranslate />
        </div>
      )}
    </>
  );
};
