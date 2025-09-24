import React from "react";
import { CategoryFiltersProps } from "../types";
import { getDarkerColor } from "../utils";
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
        All categories are selected by default. Click a category to deselect it.
      </p>
      <div className={styles.filterChips}>
        {categoryFilters.map(({ category, enabled, color }) => (
          <button
            key={category}
            className={`${styles.categoryChip} ${
              enabled ? styles.enabled : styles.disabled
            }`}
            onClick={() => onToggleCategory(category)}
            style={
              {
                "--category-color": color,
                "--category-dark-color": getDarkerColor(color),
              } as React.CSSProperties
            }
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};
