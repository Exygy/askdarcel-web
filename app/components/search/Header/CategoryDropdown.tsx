import React, { useState, useRef, useEffect } from "react";
import { ServiceCategory } from "pages/constants";
import styles from "./CategoryDropdown.module.scss";
import { Link } from "react-router-dom";

export const CategoryDropdown = ({
  categories,
  resultsTitle,
}: {
  categories: Readonly<ServiceCategory[]>;
  resultsTitle: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  const handleFocusOut = (event: FocusEvent) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.relatedTarget as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const currentRef = menuRef.current;

    document.addEventListener("mousedown", handleClickOutside);
    currentRef?.addEventListener("focusout", handleFocusOut);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      currentRef?.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  return (
    <div className={styles.navigationMenuContainer} ref={menuRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen ? "true" : "false"}
        onClick={handleToggle}
        className={styles.navigationMenuHeader}
      >
        {resultsTitle}
        <span className={isOpen ? styles.arrowUp : styles.arrowDown}>
          <i className={`fas fa-chevron-${isOpen ? "up" : "down"}`} />
        </span>
      </button>
      {isOpen && (
        <div
          style={{
            display: isOpen ? "block" : "none",
          }}
          className={`${styles.navigationSubMenu}`}
        >
          <span className={styles.navigationSubMenuItem}>
            <Link
              to="/search"
              className={styles.navigationMenuLink}
              onClick={() => setIsOpen(false)}
            >
              All categories
            </Link>
          </span>
          {categories.map((category) => (
            <span key={category.slug} className={styles.navigationSubMenuItem}>
              <Link
                to={`/${category.slug}/results`}
                className={styles.navigationMenuLink}
                onClick={() => null}
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
