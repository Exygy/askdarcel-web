import React from "react";
import type { EligibilityFacet } from "hooks/TypesenseHooks";
import styles from "./FilterHeader.module.scss";

interface EligibilityFilterContentProps {
  eligibilities: EligibilityFacet[];
  selected: Set<string>;
  onToggle: (value: string) => void;
}

export const EligibilityFilterContent = ({
  eligibilities,
  selected,
  onToggle,
}: EligibilityFilterContentProps) => (
  <div className={styles.checkboxGrid}>
    {eligibilities.map((elig) => (
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
