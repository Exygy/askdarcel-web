import React from "react";
import classNames from "classnames";
import styles from "./MobileMapToggleButtons.module.scss";

// Collapses and expands map view for mobile
const MobileMapToggleButtons = ({
  isMapCollapses,
  setIsMapCollapsed,
}: {
  isMapCollapses: boolean;
  setIsMapCollapsed: (_isMapCollapses: boolean) => void;
}) => {
  return (
    <div className={styles.mapListToggleContainer}>
      <button
        type="button"
        className={classNames(
          styles.mapListToggleBtn,
          styles.mapButton,
          "no-transition"
        )}
        onClick={() => setIsMapCollapsed(false)}
        aria-label="Expand map"
      >
        <span className={!isMapCollapses ? styles.activeView : ""}>
          <i className="fa-solid fa-map" />
        </span>
      </button>
      <button
        type="button"
        className={classNames(
          styles.mapListToggleBtn,
          styles.listButton,
          "no-transition"
        )}
        onClick={() => setIsMapCollapsed(true)}
        aria-label="Collapse map"
      >
        <span className={isMapCollapses ? styles.activeView : ""}>
          <i className="fa-solid fa-list" />
        </span>
      </button>
    </div>
  );
};

export default MobileMapToggleButtons;
