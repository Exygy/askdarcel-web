import React from "react";
import { Link } from "react-router-dom";
import styles from "components/ui/Navigation/DesktopNavigation.module.scss";
import { StrapiModel } from "../../../models/Strapi";

// This component is the dropdown submenu used by both DesktopMenuItems and CategoryDropdown, created in service of DRY code

const DropdownSubmenu = ({
  menuItem,
  activeSubMenu,
  handleMenuToggle,
  menuRef,
}: {
  menuItem: StrapiModel.NavigationMenu;
  activeSubMenu: string | null;
  handleMenuToggle: (uniqueKey: string | null) => void;
  menuRef: React.RefObject<HTMLDivElement>;
}) => {
  const uniqueKey = menuItem.title;

  // TODO: may need to import both stylesheets and conditionally render?

  return (
    <div
      className={styles.navigationMenuContainer}
      key={uniqueKey}
      ref={menuRef}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={activeSubMenu === uniqueKey ? "true" : "false"}
        onClick={() => handleMenuToggle(uniqueKey)}
        className={styles.navigationMenuHeader}
      >
        {menuItem.title}
        <span className={`fas fa-chevron-down ${styles.chevron}`} />
      </button>

      <div
        style={{
          display: activeSubMenu === uniqueKey ? "block" : "none",
        }}
        className={`${styles.navigationSubMenu}`}
      >
        {menuItem.link.map((linkItem: StrapiModel.Link) => (
          <span key={linkItem.id} className={styles.navigationSubMenuItem}>
            <Link
              to={linkItem.url}
              className={styles.navigationMenuLink}
              onClick={() => handleMenuToggle(null)}
            >
              {linkItem.text}
            </Link>
          </span>
        ))}
      </div>
    </div>
  );
};

export default DropdownSubmenu;
