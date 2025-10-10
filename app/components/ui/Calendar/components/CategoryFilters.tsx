import React from "react";
import { CategoryFiltersProps } from "../types";
import styles from "../EventCalendar.module.scss";

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  availableCategories,
  categoryFilters,
  onToggleCategory,
}) => {
  if (availableCategories.length === 0) {
    return null;
  }

  return (
    <div className={styles.categoryFilters}>
      <h3 className={styles.filterTitle}>Filter by Category</h3>
      <p className={styles.categoryInstructions}>
        Select a category to view only those events.
      </p>
      <div className={styles.filterChips}>
        {categoryFilters.map(({ category, enabled }) => (
          <button
            key={category}
            className={`${styles.categoryChip} ${
              enabled ? styles.enabled : styles.disabled
            }`}
            onClick={() => onToggleCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};
