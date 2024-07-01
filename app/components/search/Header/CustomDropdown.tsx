import React, { useState } from "react";
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

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleCategoryChange = (slug: string) => {
    onCategoryChange(slug);
    setIsOpen(false);
  };

  return (
    <div className={styles.dropdown}>
      <h1
        className={styles.title}
        onClick={handleToggle}
        style={{ cursor: "pointer" }}
      >
        {resultsTitle}{" "}
        <span className={isOpen ? styles.arrowUp : styles.arrowDown}>
          <i className={`fas fa-chevron-${isOpen ? "up" : "down"}`}></i>
        </span>
      </h1>
      {isOpen && (
        <ul className={styles.dropdownMenu}>
          {categories.map((category) => (
            <li
              key={category.categorySlug}
              onClick={() => handleCategoryChange(category.categorySlug)}
              className={
                currentCategory === category.categorySlug ? styles.active : ""
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
