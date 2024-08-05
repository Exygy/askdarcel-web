import React from "react";
import { Link } from "react-router-dom";
import styles from "components/ui/Navigation/DesktopNavigation.module.scss";

import {
  StrapiModel,
  ExtractedNavigationMenusFromNavigationResponse,
} from "../../../models/Strapi";

function menuItemHasLinks(
  menuItem: ExtractedNavigationMenusFromNavigationResponse[number]
): menuItem is StrapiModel.NavigationMenu {
  return "link" in menuItem;
}

const DesktopMenuItems = ({
  menuItem,
  activeDesktopSubMenu,
  togglesetActiveDesktopSubMenu,
}: {
  menuItem: ExtractedNavigationMenusFromNavigationResponse[number];
  activeDesktopSubMenu: string;
  togglesetActiveDesktopSubMenu: (uniqueKey: string) => void;
}) => {
  if (menuItemHasLinks(menuItem)) {
    const uniqueKey = menuItem.title;
    return (
      <div className={styles.navigationMenuContainer} key={uniqueKey}>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={activeDesktopSubMenu === uniqueKey ? "true" : "false"}
          onClick={() => togglesetActiveDesktopSubMenu(uniqueKey)}
          className={styles.navigationMenuHeader}
        >
          {menuItem.title}
          <span className={`fas fa-chevron-down ${styles.chevron}`} />
        </button>

        <div
          style={{
            display: activeDesktopSubMenu === uniqueKey ? "block" : "none",
          }}
          className={`${styles.navigationMenuList}`}
        >
          {menuItem.link.map((linkItem: StrapiModel.Link) => (
            <span key={linkItem.id} className={styles.navigationMenuListItem}>
              <Link to={linkItem.url} className={styles.navigationMenuLink}>
                {linkItem.text}
              </Link>
            </span>
          ))}
        </div>
      </div>
    );
  }

  const uniqueKey = menuItem.url;
  return (
    <Link
      key={uniqueKey}
      to={menuItem.url}
      className={styles.navigationMenuLink}
    >
      {menuItem.text}
    </Link>
  );
};

export default DesktopMenuItems;
