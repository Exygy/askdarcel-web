import React, { useState, useRef, useCallback, useMemo } from "react";
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
}: EligibilityFilterContentProps) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const checkboxRefs = useRef<(HTMLInputElement | null)[]>([]);

  const sorted = useMemo(
    () =>
      [...eligibilities].sort(({ value: a }, { value: b }) =>
        sortEligibilities(a, b)
      ),
    [eligibilities]
  );

  // Clamp in case the list shrinks while a high index is focused
  const safeFocusedIndex = Math.min(focusedIndex, Math.max(0, sorted.length - 1));

  const moveFocus = useCallback((index: number) => {
    setFocusedIndex(index);
    checkboxRefs.current[index]?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
          e.preventDefault();
          moveFocus((index + 1) % sorted.length);
          break;
        case "ArrowUp":
        case "ArrowLeft":
          e.preventDefault();
          moveFocus((index - 1 + sorted.length) % sorted.length);
          break;
        case "Home":
          e.preventDefault();
          moveFocus(0);
          break;
        case "End":
          e.preventDefault();
          moveFocus(sorted.length - 1);
          break;
        case "Enter":
          e.preventDefault();
          onToggle(sorted[index].value);
          break;
        // Tab is intentionally not handled — browser moves focus naturally
        // from the single tabIndex={0} item to the next focusable element (Apply button)
      }
    },
    [sorted, moveFocus, onToggle]
  );

  return (
    <div
      role="group"
      aria-label="Eligibility tags"
      className={styles.checkboxGrid}
    >
      {sorted.map((elig, index) => (
        <label key={elig.value} className={styles.checkboxOption}>
          <input
            ref={(el) => {
              checkboxRefs.current[index] = el;
            }}
            type="checkbox"
            className={styles.checkboxInput}
            checked={selected.has(elig.value)}
            tabIndex={safeFocusedIndex === index ? 0 : -1}
            onChange={() => onToggle(elig.value)}
            onFocus={() => setFocusedIndex(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          />
          <span>{elig.value}</span>
        </label>
      ))}
    </div>
  );
};
