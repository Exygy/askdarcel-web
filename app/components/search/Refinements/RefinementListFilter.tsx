import React from "react";
import { CurrentRefinements } from "react-instantsearch";
import styles from "./RefinementFilters.module.scss";

const RefinementListFilter = ({ items, refine }: any) => {
  return (
    <CurrentRefinements>
      <ul>
        {items.map((item: any) => (
          <li key={item.label}>
            <label className={styles.checkBox}>
              {item.label}
              <input
                className={styles.refinementInput}
                type="checkbox"
                checked={item.isRefined}
                onChange={() => {
                  refine(item.value);
                }}
              />
            </label>
          </li>
        ))}
      </ul>
    </CurrentRefinements>
  );
};

export default RefinementListFilter;
