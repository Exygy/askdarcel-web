import React, { useState, useEffect } from "react";
import { connectRefinementList } from "react-instantsearch/connectors";
import type { Hit } from "react-instantsearch-core";
import styles from "./RefinementFilters.module.scss";

type Item = {
  count: number;
  isRefined: boolean;
  label: string;
  value: string[];
};

type FacetRefinementListProps = {
  items: Hit<Item>[];
  refine: (value: string[]) => void;
  currentRefinement: string[];
  mapping: Record<string, string[]>;
};

const FacetRefinementList = (props: FacetRefinementListProps) => {
  const { items, refine, currentRefinement, mapping } = props;
  const keyHasAtLeastOneRefined = (key: string): boolean => {
    return mapping[key].some((value) => currentRefinement.includes(value));
  };

  const setChecks = (): Record<string, boolean> => {
    const mapKeys = Object.keys(mapping);
    const checks: Record<string, boolean> = {};
    mapKeys.forEach((key) => {
      checks[key] = keyHasAtLeastOneRefined(key);
    });
    return checks;
  };

  const [isChecked, setIsChecked] =
    useState<Record<string, boolean>>(setChecks);

  useEffect(() => {
    setIsChecked(setChecks());
  }, [currentRefinement, mapping]);

  const changeRefinement = (key: string) => {
    let newRefinement;
    if (isChecked[key]) {
      // If key currently checked, unrefine every sub-element (filter through current refinement)
      newRefinement = currentRefinement.filter(
        (value) => !mapping[key].includes(value)
      );
    } else {
      // If key currently unchecked, refine all sub-elements
      newRefinement = currentRefinement.concat(mapping[key]);
    }
    refine(newRefinement);
  };

  const refinementHasResults = (key: string): boolean => {
    // this checks that a key (checkbox) has at least one sub-element that is refined
    // e.g if Learning Disabilities can be refined but not Visual Impairment,
    // Disability is still enabled as a checkbox
    return items.some((item) => mapping[key].includes(item.label));
  };

  const mapKeys = Object.keys(mapping);
  console.log(mapKeys);

  return (
    <ul>
      {mapKeys.map((key) => {
        const hasResults = refinementHasResults(key);
        // for each map key, display it as a filtering option
        // for onClick of each option, call refine on the values of the key
        return (
          <li key={key}>
            <label
              className={`${styles.checkBox} ${
                !hasResults ? styles.disabled : ""
              }`}
            >
              {key}
              <input
                type="checkbox"
                className={styles.refinementInput}
                onChange={() => changeRefinement(key)}
                checked={isChecked[key]}
                disabled={!hasResults}
              />
            </label>
          </li>
        );
      })}
    </ul>
  );
};

export default connectRefinementList(FacetRefinementList);
