import React from "react";
import { CurrentRefinements, useCurrentRefinements } from "react-instantsearch";
import styles from "./RefinementFilters.module.scss";

const RefinementListFilter = (props: any) => {
  const { items, canRefine, refine } = useCurrentRefinements(props);
  const foo = props.transformItems;
  return (
    <ul>
      {foo(items).map((item: any) => (
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
  );
};

export default RefinementListFilter;
