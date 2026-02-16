import React from "react";
import type { EligibilityFacet } from "hooks/TypesenseHooks";
import styles from "./FilterHeader.module.scss";

interface EligibilityFilterContentProps {
  eligibilities: EligibilityFacet[];
  selected: Set<string>;
  onToggle: (value: string) => void;
}

const sortEligibilities = (a: string, b: string): number => {
  const agePattern = /^Age (\d+)/;
  const aMatch = a.match(agePattern);
  const bMatch = b.match(agePattern);

  // If both are age ranges, sort by the starting number
  if (aMatch && bMatch) {
    return parseInt(aMatch[1], 10) - parseInt(bMatch[1], 10);
  }

  // Age ranges come first, then alphabetical
  if (aMatch) return -1;
  if (bMatch) return 1;

  return a.localeCompare(b);
};

export const EligibilityFilterContent = ({
  eligibilities,
  selected,
  onToggle,
}: EligibilityFilterContentProps) => (
  <div className={styles.checkboxGrid}>
    {eligibilities
      .sort(({ value: aValue }, { value: bValue }) =>
        sortEligibilities(aValue, bValue)
      )
      .map((elig) => (
        <label key={elig.value} className={styles.checkboxOption}>
          <input
            type="checkbox"
            className={styles.checkboxInput}
            checked={selected.has(elig.value)}
            onChange={() => onToggle(elig.value)}
          />
          <span>{elig.value}</span>
        </label>
      ))}
  </div>
);
