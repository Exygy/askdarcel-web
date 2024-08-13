import React from "react";
import { Link } from "react-router-dom";
import styles from "components/ui/Navigation/DesktopNavigation.module.scss";
import { useMenuToggle } from "../../../hooks/MenuHooks";
import DropdownMenu from "./DropdownMenu";

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
  const { handleMenuToggle } = useMenuToggle();

  if (menuItemHasLinks(menuItem)) {
    const uniqueKey = menuItem.title;
    const links = menuItem.link.map((linkItem) => ({
      id: linkItem.id,
      url: linkItem.url,
      text: linkItem.text,
    }));

    return (
      <DropdownMenu
        title={menuItem.title}
        links={links}
        uniqueKey={uniqueKey}
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
