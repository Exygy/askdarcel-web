import React, { useEffect, useState, useMemo } from "react";
import { useSearchRefinements } from "../../../search/hooks";
import type { RefinementItem } from "../../../search/types";
import styles from "./RefinementFilters.module.scss";

interface Props {
  attribute: string;
  /**
   * Transform function for browse pages
   * Used to filter/sort items based on API-provided subcategories
   */
  transform?: (items: RefinementItem[]) => RefinementItem[];
  /**
   * Mapping configuration for search pages
   * Maps display labels to underlying search values
   */
  mapping?: Record<string, string[]>;
  /**
   * Mode determines which refinement behavior to use
   */
  mode?: "browse" | "search";
}

/**
 * Provider-agnostic refinement list component
 * Works with any search provider through abstracted hooks
 *
 * Replaces: BrowseRefinementList and SearchRefinementList
 */
const RefinementList: React.FC<Props> = ({
  attribute,
  transform,
  mapping,
  mode = "browse",
}) => {
  const { items, toggleRefinement } = useSearchRefinements({ attribute });
  const [checked, setChecked] = useState<Set<string> | Record<string, boolean>>(
    mode === "browse" ? new Set() : {}
  );

  const isBrowseMode = mode === "browse";
  const isSearchMode = mode === "search" && mapping;

  // Memoize the mapping keys to avoid recreating the dependency
  const mappingKeys = useMemo(
    () => (mapping ? Object.keys(mapping) : []),
    [mapping]
  );

  // Browse mode effect
  useEffect(() => {
    if (isBrowseMode) {
      const newChecked = new Set<string>();
      items.forEach((item) => {
        if (item.isRefined) {
          newChecked.add(item.value);
        }
      });

      // Only update state if the set contents changed
      setChecked((prevChecked) => {
        const prev = prevChecked as Set<string>;
        if (prev.size !== newChecked.size) return newChecked;

        for (const value of newChecked) {
          if (!prev.has(value)) return newChecked;
        }
        return prev;
      });
    }
  }, [items, isBrowseMode]);

  // Search mode effect
  useEffect(() => {
    if (isSearchMode && mapping) {
      const updatedChecked: Record<string, boolean> = {};

      const keyHasAtLeastOneRefined = (key: string): boolean => {
        const refined = items.filter((item) => item.isRefined);
        const refinedItemLabels = refined.map((item) => item.label);
        const anyCommon = refinedItemLabels.filter((label) =>
          mapping[key].includes(label)
        );
        return anyCommon.length > 0;
      };

      mappingKeys.forEach((key) => {
        updatedChecked[key] = keyHasAtLeastOneRefined(key);
      });

      // Only update state if something actually changed
      setChecked((prevChecked) => {
        const prev = prevChecked as Record<string, boolean>;
        const hasChanges = mappingKeys.some(
          (key) => prev[key] !== updatedChecked[key]
        );
        return hasChanges ? updatedChecked : prev;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, isSearchMode, mappingKeys]);

  // Browse mode render
  if (isBrowseMode) {
    const checkedSet = checked as Set<string>;

    const handleChange = (value: string) => {
      toggleRefinement(value);
      const updatedChecked = new Set(checkedSet);
      if (updatedChecked.has(value)) {
        updatedChecked.delete(value);
      } else {
        updatedChecked.add(value);
      }
      setChecked(updatedChecked);
    };

    const transformedItems = transform ? transform(items) : items;
    transformedItems.sort((a, b) => a.label.localeCompare(b.label));

    return (
      <ul>
        {transformedItems.map((item) => (
          <li key={item.label} data-testid="refinementlist-item">
            <label className={styles.checkBox}>
              {item.label}
              <input
                className={styles.refinementInput}
                type="checkbox"
                checked={checkedSet.has(item.value)}
                onChange={() => handleChange(item.value)}
              />
            </label>
          </li>
        ))}
      </ul>
    );
  }

  // Search mode render
  if (isSearchMode && mapping) {
    const checkedRecord = checked as Record<string, boolean>;
    const mappingLabels = Object.keys(mapping);

    const keyHasAtLeastOneRefined = (key: string): boolean => {
      const refined = items.filter((item) => item.isRefined);
      const refinedItemLabels = refined.map((item) => item.label);
      const anyCommon = refinedItemLabels.filter((label) =>
        mapping[key].includes(label)
      );
      return anyCommon.length > 0;
    };

    const handleChange = (key: string) => {
      mapping[key].forEach((mappingValue) => {
        toggleRefinement(mappingValue);
      });

      const updatedChecked = { ...checkedRecord };
      if (checkedRecord[key]) {
        updatedChecked[key] = false;
      } else {
        updatedChecked[key] = keyHasAtLeastOneRefined(key);
      }
      setChecked(updatedChecked);
    };

    const refinementMappingHasResults = (key: string) => {
      return items.some((item) => mapping[key].includes(item.label));
    };

    return (
      <ul>
        {mappingLabels.map((key) => {
          const mappingHasResults = refinementMappingHasResults(key);

          return (
            <li key={key} data-testid="refinementlist-item">
              <label
                className={`${styles.checkBox} ${
                  !mappingHasResults ? styles.disabled : ""
                }`}
              >
                {key}
                <input
                  className={styles.refinementInput}
                  type="checkbox"
                  checked={checkedRecord[key] || false}
                  onChange={() => handleChange(key)}
                  disabled={!mappingHasResults}
                />
              </label>
            </li>
          );
        })}
      </ul>
    );
  }

  return null;
};

export default RefinementList;
