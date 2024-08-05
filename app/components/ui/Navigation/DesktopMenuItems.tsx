import React, { useState, useEffect, useRef } from "react";
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
}: {
  menuItem: ExtractedNavigationMenusFromNavigationResponse[number];
}) => {
  const [activeDesktopSubMenu, setActiveDesktopSubMenu] = useState<
    string | null
  >(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleMenuToggle = (uniqueKey: string) => {
    setActiveDesktopSubMenu((prev) => (prev === uniqueKey ? null : uniqueKey));
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setActiveDesktopSubMenu(null);
    }
  };

  const handleFocusOut = (event: FocusEvent) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.relatedTarget as Node)
    ) {
      setActiveDesktopSubMenu(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    menuRef.current?.addEventListener("focusout", handleFocusOut);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      menuRef.current?.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  if (menuItemHasLinks(menuItem)) {
    const uniqueKey = menuItem.title;
    return (
      <div
        className={styles.navigationMenuContainer}
        key={uniqueKey}
        ref={menuRef}
      >
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={activeDesktopSubMenu === uniqueKey ? "true" : "false"}
          onClick={() => handleMenuToggle(uniqueKey)}
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
              <Link
                to={linkItem.url}
                className={styles.navigationMenuLink}
                onClick={() => setActiveDesktopSubMenu(null)}
              >
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
      onClick={() => setActiveDesktopSubMenu(null)}
    >
      {menuItem.text}
    </Link>
  );
};

export default DesktopMenuItems;
