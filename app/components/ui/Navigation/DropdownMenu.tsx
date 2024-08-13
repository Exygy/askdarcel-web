import React from "react";
import { Link } from "react-router-dom";
import navStyles from "./DesktopNavigation.module.scss";
import categoryStyles from "./CategoryDropdown.module.scss";
import { useMenuToggle } from "../../../hooks/MenuHooks";

// This component is the dropdown submenu used by both DesktopMenuItems and CategoryDropdown, created in service of DRY code

const DropdownMenu = ({
  title,
  links,
  uniqueKey,
  variant = "navigation",
}: {
  title: string;
  links: { id: number | string; url: string; text: string }[];
  uniqueKey: string;
  variant?: "navigation" | "category";
}) => {
  const styles = variant === "navigation" ? navStyles : categoryStyles;

  const { activeSubMenu, handleMenuToggle, menuRef } = useMenuToggle();

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
        {title}
        <span className={`fas fa-chevron-down ${styles.chevron}`} />
      </button>

      <div
        style={{
          display: activeSubMenu === uniqueKey ? "block" : "none",
        }}
        className={`${styles.navigationSubMenu}`}
      >
        {links.map((linkItem) => (
          <span key={linkItem.id} className={styles.navigationSubMenuItem}>
            <Link to={linkItem.url} className={styles.navigationMenuLink}>
              {linkItem.text}
            </Link>
          </span>
        ))}
      </div>
    </div>
  );
};

export default DropdownMenu;
