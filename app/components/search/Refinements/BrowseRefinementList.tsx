import React from "react";
import { useRefinementList, UseRefinementListProps } from "react-instantsearch";
import styles from "./RefinementFilters.module.scss";

interface Props extends UseRefinementListProps {
  transform: UseRefinementListProps["transformItems"];
  attribute: string;
}
const BrowseRefinementList = ({ attribute, transform }: Props) => {
  const { items, refine } = useRefinementList({
    attribute,
    sortBy: ["name:asc"],
    transformItems: transform,
  });

  return (
    <ul>
      {items.map((item) => (
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

export default BrowseRefinementList;
