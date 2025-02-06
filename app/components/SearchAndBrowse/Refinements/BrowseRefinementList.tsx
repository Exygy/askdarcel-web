import { RefinementListItem } from "instantsearch.js/es/connectors/refinement-list/connectRefinementList";
import React, { useEffect, useState } from "react";
import { useRefinementList, UseRefinementListProps } from "react-instantsearch";
import {
  filterByMappingValues,
  normalizeRefinementLabels,
  deduplicateItemsByLabel,
} from "utils/refinementMappings";
import styles from "./RefinementFilters.module.scss";

interface Props extends UseRefinementListProps {
  mapping?: Record<string, string[]>;
  attribute: string;
  transform?: (items: RefinementListItem[]) => RefinementListItem[];
}

// Arbitrary upper limit to ensure all refinements are displayed
const MAXIMUM_ITEMS = 9999;

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

  let transformedItems: RefinementListItem[] = items;
  if (mapping) {
    transformedItems = filterByMappingValues(items, mapping);
    transformedItems = normalizeRefinementLabels(transformedItems, mapping);
  } else if (transform) {
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
