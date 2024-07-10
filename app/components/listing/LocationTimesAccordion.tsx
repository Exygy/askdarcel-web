import React, { useState } from "react";
import styles from "./LocationTimesAccordion.module.scss";
import { LocationDetails } from "models";
import classNames from "classnames";

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
  console.log(locations);

  return (
    <div className={styles.locationTimesAccordion}>
      {locations.map((loc, i) => (
        <div
          key={loc.id}
          className={classNames(
            styles.accordionItem,
            activeIndices.includes(i) && styles.activeItem
          )}
        >
          <header
            onClick={() => toggleAccordion(i)}
            className={styles.accordionHeader}
          >
            <h3>{`${i + 1}. ${loc.address.address_1}`}</h3>
            <i
              className={`fas fa-chevron-${
                activeIndices.includes(i) ? "up" : "down"
              }`}
            ></i>
          </header>
          {activeIndices.includes(i) && (
            <div className={styles.accordionContent}>
              {locationRenderer(loc)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default LocationTimesAccordion;
