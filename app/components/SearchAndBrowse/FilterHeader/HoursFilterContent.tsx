import React from "react";
import type { HoursSelection } from "hooks/useFilterState";
import styles from "./FilterHeader.module.scss";

interface HoursFilterContentProps {
  selected: HoursSelection;
  onChange: (value: HoursSelection) => void;
}

export const HoursFilterContent = ({
  selected,
  onChange,
}: HoursFilterContentProps) => (
  <div className={styles.toggleGroup}>
    <button
      type="button"
      className={
        selected === "any"
          ? styles.toggleButtonActive
          : styles.toggleButton
      }
      onClick={() => onChange("any")}
    >
      Any time
    </button>
    <button
      type="button"
      className={styles.toggleButtonDisabled}
      disabled
      title="Schedule data is not yet available"
    >
      Open now
    </button>
    <button
      type="button"
      className={styles.toggleButtonDisabled}
      disabled
      title="Schedule data is not yet available"
    >
      Open late
    </button>
  </div>
);
