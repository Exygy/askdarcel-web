import React from "react";
import { ServiceCategory } from "pages/constants";
import { Link } from "react-router-dom";
import styles from "./CategoryDropdown.module.scss";
import { useMenuToggle } from "../../../hooks/MenuHooks";

export const CategoryDropdown = ({
  categories,
  resultsTitle,
}: {
  categories: Readonly<ServiceCategory[]>;
  resultsTitle: string;
}) => {
  const { activeSubMenu, handleMenuToggle, menuRef } = useMenuToggle();

  return (
    <div className={styles.navigationMenuContainer} ref={menuRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={activeSubMenu === resultsTitle ? "true" : "false"}
        onClick={() => handleMenuToggle(resultsTitle)}
        className={styles.navigationMenuHeader}
      >
        {resultsTitle}
        <span
          className={
            activeSubMenu === resultsTitle ? styles.arrowUp : styles.arrowDown
          }
        >
          <i
            className={`fas fa-chevron-${
              activeSubMenu === resultsTitle ? "up" : "down"
            }`}
          />
        </span>
      </button>
      {activeSubMenu === resultsTitle && (
        <div className={`${styles.navigationSubMenu}`}>
          <span className={styles.navigationSubMenuItem}>
            <Link
              to="/search"
              className={styles.navigationMenuLink}
              onClick={() => handleMenuToggle(null)}
            >
              All categories
            </Link>
          </span>
          {categories.map((category) => (
            <span key={category.slug} className={styles.navigationSubMenuItem}>
              <Link
                to={`/${category.slug}/results`}
                className={styles.navigationMenuLink}
                onClick={() => handleMenuToggle(null)}
              >
                {category.name}
              </Link>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
