import React from "react";
import { Link } from "react-router-dom";
import styles from "components/ui/Navigation/DesktopNavigation.module.scss";
import { useMenuToggle } from "../../../hooks/MenuHooks";
import DropdownSubmenu from "./DropdownSubmenu";

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
}: {
  menuItem: ExtractedNavigationMenusFromNavigationResponse[number];
}) => {
  const { activeSubMenu, handleMenuToggle, menuRef } = useMenuToggle();

  if (menuItemHasLinks(menuItem)) {
    return (
      <DropdownSubmenu
        menuItem={menuItem}
        activeSubMenu={activeSubMenu}
        handleMenuToggle={handleMenuToggle}
        menuRef={menuRef}
      />
    );
  }

  const uniqueKey = menuItem.url;
  return (
    <Link
      key={uniqueKey}
      to={menuItem.url}
      className={styles.navigationMenuLink}
      onClick={() => handleMenuToggle(null)}
    >
      {menuItem.text}
    </Link>
  );
};

export default DesktopMenuItems;
