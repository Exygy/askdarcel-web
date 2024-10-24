import React, { useState, useRef, useEffect } from "react";
import { ServiceCategory } from "pages/constants";
import styles from "./CustomDropdown.module.scss";

interface DropdownProps {
  categories: Readonly<ServiceCategory[]>;
  currentCategory: string;
  onCategoryChange: (slug: string) => void;
  resultsTitle: string;
}

// NOTE: built quickly for demo

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

  const handleItemKeyDown = (
    event: React.KeyboardEvent,
    slug: string,
    index: number
  ) => {
    const menuItems = Array.from(menuRef.current?.querySelectorAll("li") || []);

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        {
          const nextItem = menuItems[index + 1] || menuItems[0];
          (nextItem as HTMLElement)?.focus();
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        {
          const prevItem =
            menuItems[index - 1] || menuItems[menuItems.length - 1];
          (prevItem as HTMLElement)?.focus();
        }
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        handleCategoryChange(slug);
        break;
      case "Tab":
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.title}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={{ cursor: "pointer" }}
      >
        {resultsTitle}{" "}
        <span className={isOpen ? styles.arrowUp : styles.arrowDown}>
          <i className={`fas fa-chevron-${isOpen ? "up" : "down"}`} />
        </span>
      </button>
      {isOpen && (
        <ul
          ref={menuRef}
          className={styles.dropdownMenu}
          role="listbox"
          aria-activedescendant={currentCategory}
          tabIndex={-1}
        >
          {categories.map((category, index) => (
            <li
              key={category.slug}
              onClick={() => handleCategoryChange(`/${category.slug}/results`)}
              className={currentCategory === category.slug ? styles.active : ""}
              role="option"
              id={category.slug}
              tabIndex={0}
              aria-selected={currentCategory === category.slug}
              onKeyDown={(event) =>
                handleItemKeyDown(event, `/${category.slug}/results`, index + 1)
              }
            >
              {category.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
