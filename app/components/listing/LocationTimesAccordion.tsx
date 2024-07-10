import React, { useState } from "react";
import { LocationDetails } from "models";
import classNames from "classnames";
import styles from "./LocationTimesAccordion.module.scss";

/*
    Accordion built per a11y guidelines:
    https://www.w3.org/WAI/ARIA/apg/patterns/accordion/
*/

const LocationTimesAccordion = ({
  locationRenderer,
  locations,
}: {
  locations: LocationDetails[];
  locationRenderer: (loc: LocationDetails) => React.ReactElement;
}) => {
  const [activeIndices, setActiveIndices] = useState<number[]>([0]);

  const toggleAccordion = (index: number) => {
    setActiveIndices((prevActiveIndices) =>
      prevActiveIndices.includes(index)
        ? prevActiveIndices.filter((i) => i !== index)
        : [...prevActiveIndices, index]
    );
  };

  return (
    <div className={styles.locationTimesAccordion}>
      {locations.map((loc, i) => {
        const isActive = activeIndices.includes(i);
        const headerId = `accordion${i}id`;
        const panelId = `sect${i}`;

        return (
          <div
            key={loc.id}
            className={classNames(
              styles.accordionItem,
              isActive && styles.activeItem
            )}
          >
            <h3>
              <button
                type="button"
                aria-expanded={isActive}
                className={styles.accordionButton}
                aria-controls={panelId}
                aria-label={loc.address.address_1}
                id={headerId}
                onClick={() => toggleAccordion(i)}
              >
                <span className={styles.accordionTitle}>
                  {`${i + 1}. ${loc.address.address_1}`}
                  <i className={`fas fa-chevron-${isActive ? "up" : "down"}`} />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={headerId}
              className={styles.accordionPanel}
              hidden={!isActive}
            >
              <div className={styles.accordionContent}>
                {locationRenderer(loc)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LocationTimesAccordion;
