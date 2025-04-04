import React, { useEffect, useState } from "react";
import { useRefinementList, UseRefinementListProps } from "react-instantsearch";
import styles from "./RefinementFilters.module.scss";

// TODO: Why do we have this and BrowseRefinementList? Can we combine?
interface Props extends UseRefinementListProps {
  mapping: Record<string, string[]>;
}

const DEFAULT_CONFIG = {
  // Arbitrary upper limit to ensure all refinements are displayed
  limit: 9999,
  operator: "or" as const,
};

const SearchRefinementList = ({ attribute, mapping }: Props) => {
  const mappingLabels = Object.keys(mapping);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const { items, refine } = useRefinementList({
    attribute,
    ...DEFAULT_CONFIG,
  });

  const keyHasAtLeastOneRefined = (key: string): boolean => {
    const refined = items.filter((item) => item.isRefined);
    const refinedItemLabels = refined.map((item) => item.label);
    const anyCommon = refinedItemLabels.filter((label) =>
      mapping[key].includes(label)
    );

    return anyCommon.length > 0;
  };

  const changeRefinement = (key: string) => {
    mapping[key].forEach((mappingValue) => {
      refine(mappingValue);
    });

    if (checked[key]) {
      checked[key] = false;
    } else {
      checked[key] = keyHasAtLeastOneRefined(key);
    }

    setChecked(checked);
  };

  const refinementMappingHasResults = (key: string) => {
    return items.some((item) => mapping[key].includes(item.label));
  };

  useEffect(() => {
    mappingLabels.forEach((key) => {
      checked[key] = keyHasAtLeastOneRefined(key);
    });

    setChecked(checked);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  return (
    <ul>
      {mappingLabels.map((mappingLabel) => {
        const mappingHasResults = refinementMappingHasResults(mappingLabel);

        return (
          <li key={mappingLabel}>
            <label
              className={`${styles.checkBox} ${
                !mappingHasResults ? styles.disabled : ""
              }`}
            >
              {mappingLabel}
              <input
                type="checkbox"
                className={styles.refinementInput}
                onChange={() => changeRefinement(mappingLabel)}
                checked={checked[mappingLabel] || false}
                disabled={!mappingHasResults}
              />
            </label>
          </li>
        );
      })}
    </ul>
  );
};

export default SearchRefinementList;
