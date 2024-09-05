import React, { Component, useEffect, useState } from "react";
import {
  RefinementList,
  useCurrentRefinements,
  useRefinementList,
} from "react-instantsearch";
import styles from "./RefinementFilters.module.scss";
import { connectRefinementList } from "instantsearch.js/es/connectors";
import { useConnector } from "react-instantsearch";

interface Props {
  mapping: Record<string, string[]>;
  attribute: string;
}

type State = {
  isChecked: Record<string, boolean>;
  limit: number;
};

// Todo: This component could potentially be consolidated with the the Refinement List Filter
// component when categories/eligibilities are standardized across the homepage Service
// Pathways results and the Search Results pages
const FacetRefinementList = ({ attribute, mapping }: Props) => {
  const mapKeys = Object.keys(mapping);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const {
    items,
    hasExhaustiveItems,
    createURL,
    refine,
    sendEvent,
    searchForItems,
    isFromSearch,
    canRefine,
    canToggleShowMore,
    isShowingMore,
    toggleShowMore,
  } = useRefinementList({ attribute, limit: 100 });

  const keyHasAtLeastOneRefined = (key: string) => {
    return mapping[key].some((value) => items.includes(value as any));
  };

  useEffect(() => {
    mapKeys.forEach((key) => {
      checked[key] = keyHasAtLeastOneRefined(key);
    });
    setChecked(checked);
  }, []);

  const changeRefinement = (key: string) => {
    refine([key, "hello_phonecall"]);
    mapKeys.forEach((key) => {
      checked[key] = keyHasAtLeastOneRefined(key);
    });
    setChecked(checked);
  };

  const refinementHasResults = (key: string) => {
    // this check that a key (checkbox) has at least one sub-elements that is refined
    // e.g if Learning Disabilities is can be refined but not Visual Impairment,
    // Disability is still enabled as a checkbox
    return items.some((item) => mapping[key].includes(item.label));
  };

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
                checked={checked[key]}
                disabled={!hasResults}
              />
            </label>
          </li>
        );
      })}
    </ul>
  );
};

// @ts-ignore
export default FacetRefinementList;
