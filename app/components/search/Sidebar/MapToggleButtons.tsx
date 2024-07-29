import React from "react";
import classNames from "classnames";
import styles from "./MapToggleButtons.module.scss";

const MapToggleButtons = ({
  collapseMap,
  setCollapseMap,
}: {
  collapseMap: boolean;
  setCollapseMap: (_collapseMap: boolean) => void;
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
        onClick={() => setCollapseMap(false)}
        aria-label="Expand map"
      >
        <span className={!collapseMap ? styles.activeView : ""}>
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
        onClick={() => setCollapseMap(true)}
        aria-label="Collapse map"
      >
        <span className={collapseMap ? styles.activeView : ""}>
          <i className="fa-solid fa-list" />
        </span>
      </button>
    </div>
  );
};

export default MapToggleButtons;
