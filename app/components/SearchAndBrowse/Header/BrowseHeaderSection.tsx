import React from "react";
import styles from "./SearchHeaderSection.module.scss";

/**
 * Renders mobile and desktop views for Listings navigation
 */
export const BrowseHeaderSection = ({
  title = "Services",
  descriptionText,
}: {
  title?: string;
  descriptionText: string;
}) => {
  return (
    <div className={styles.searchHeaderContainer}>
      <div className={styles.searchHeaderContainerLeft}>
        <h1>{title}</h1>
      </div>
      <span>{descriptionText}</span>
    </div>
  );
};
