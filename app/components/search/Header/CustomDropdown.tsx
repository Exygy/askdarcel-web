import React, { useState, useRef, useEffect } from "react";
import styles from "./CustomDropdown.module.scss";

interface Category {
  name: string;
  categorySlug: string;
}

interface DropdownProps {
  categories: Category[];
  currentCategory: string;
  onCategoryChange: (slug: string) => void;
  resultsTitle: string;
}

export const CustomDropdown: React.FC<DropdownProps> = ({
  categories,
  currentCategory,
  onCategoryChange,
  resultsTitle,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleCategoryChange = (slug: string) => {
    onCategoryChange(slug);
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape" && isOpen) {
      setIsOpen(false);
      buttonRef.current?.focus();
    }

    if (event.key === "ArrowDown" && !isOpen) {
      setIsOpen(true);
      event.preventDefault();
    }

    if (event.key === "ArrowDown" && isOpen) {
      const firstMenuItem = menuRef.current?.querySelector("li");
      (firstMenuItem as HTMLElement)?.focus();
      event.preventDefault();
    }

    if (event.key === "ArrowUp" && isOpen) {
      const lastMenuItem = menuRef.current?.querySelector("li:last-child");
      (lastMenuItem as HTMLElement)?.focus();
      event.preventDefault();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      <button
        ref={buttonRef}
        className={styles.title}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={{ cursor: "pointer" }}
      >
        {resultsTitle}{" "}
        <span className={isOpen ? styles.arrowUp : styles.arrowDown}>
          <i className={`fas fa-chevron-${isOpen ? "up" : "down"}`}></i>
        </span>
      </button>
      {isOpen && (
        <ul
          ref={menuRef}
          className={styles.dropdownMenu}
          role="listbox"
          aria-activedescendant={currentCategory}
        >
          {categories.map((category) => (
            <li
              key={category.categorySlug}
              onClick={() => handleCategoryChange(category.categorySlug)}
              className={
                currentCategory === category.categorySlug ? styles.active : ""
              }
              role="option"
              id={category.categorySlug}
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  handleCategoryChange(category.categorySlug);
                }
                if (event.key === "ArrowDown") {
                  const nextItem = (event.target as HTMLElement)
                    .nextElementSibling;
                  (nextItem as HTMLElement)?.focus();
                }
                if (event.key === "ArrowUp") {
                  const prevItem = (event.target as HTMLElement)
                    .previousElementSibling;
                  (prevItem as HTMLElement)?.focus();
                }
              }}
            >
              {category.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
