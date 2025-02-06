import { RefinementListItem } from "instantsearch.js/es/connectors/refinement-list/connectRefinementList";
import React, { useEffect, useState } from "react";
import { useRefinementList, UseRefinementListProps } from "react-instantsearch";
import styles from "./RefinementFilters.module.scss";

interface Props extends UseRefinementListProps {
  mapping?: Record<string, string[]>;
  attribute: string;
  transform?: (items: RefinementListItem[]) => RefinementListItem[];
}

// Arbitrary upper limit to ensure all refinements are displayed
const MAXIMUM_ITEMS = 9999;

// MOVE TO HELPERS (and run unit tests)

// only return eligibilities that are in the refinement map
const filterItemsUsingMapping = (
  items: RefinementListItem[],
  mapping: Record<string, string[]>
): RefinementListItem[] => {
  return items.filter((item) =>
    Object.values(mapping).some((apiEligibilities) =>
      apiEligibilities.includes(item.label)
    )
  );
};

const transformItemsUsingMapping = (
  items: RefinementListItem[],
  mapping: Record<string, string[]>
): RefinementListItem[] => {
  return items.map((item) => {
    // loook through each mapping key to see if the item label is one of its values
    const mappedEligibility = Object.entries(mapping).find(
      ([, apiEligibilities]) => apiEligibilities.includes(item.label)
    );
    if (mappedEligibility) {
      const [mappedKey] = mappedEligibility;
      return { ...item, label: mappedKey }; // same object but with mapped key
    }
    return item;
  });
};

const deduplicateItemsByLabel = (
  items: RefinementListItem[]
): RefinementListItem[] => {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.label)) {
      return false;
    } else {
      seen.add(item.label);
      return true;
    }
  });
};

/**
 * Facet refinement list component for browse interfaces
 */
const BrowseRefinementList = ({ attribute, mapping, transform }: Props) => {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const { items, refine } = useRefinementList({
    attribute,
    sortBy: ["name:asc"],
    limit: MAXIMUM_ITEMS,
  });

  useEffect(() => {
    const newChecked = new Set<string>();
    items.forEach((item) => {
      if (item.isRefined) {
        newChecked.add(item.value);
      }
    });
    setChecked(newChecked);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const changeRefinement = (value: string) => {
    refine(value);

    const updatedChecked = new Set(checked);
    if (updatedChecked.has(value)) {
      updatedChecked.delete(value);
    } else {
      updatedChecked.add(value);
    }
    setChecked(updatedChecked);
  };

  // const transformedItems = transform === undefined ? items : transform(items);
  let transformedItems: RefinementListItem[] = items;
  if (mapping) {
    transformedItems = filterItemsUsingMapping(items, mapping);
    transformedItems = transformItemsUsingMapping(transformedItems, mapping);
  } else if (transform) {
    // If no mapping is provided but a transform function is
    transformedItems = transform(items);
  }

  transformedItems = deduplicateItemsByLabel(transformedItems);
  transformedItems.sort((a, b) => a.label.localeCompare(b.label));

  return (
    <ul>
      {transformedItems.map((item) => (
        <li key={item.label} data-testid={"browserefinementlist-item"}>
          <label className={styles.checkBox}>
            {item.label}
            <input
              className={styles.refinementInput}
              type="checkbox"
              checked={checked.has(item.value)}
              onChange={() => changeRefinement(item.value)}
            />
          </label>
        </li>
      ))}
    </ul>
  );
};

export default BrowseRefinementList;
