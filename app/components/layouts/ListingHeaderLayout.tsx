import React from "react";
import { SiteSearchInput } from "components/ui/SiteSearchInput";
import styles from "./ListingHeaderLayout.module.scss";

/**
 * Renders mobile and desktop views for Listings navigation
 */
export const ListingHeaderLayout = ({
  descriptionText,
}: {
  descriptionText: string;
}) => (
  <>
    <div className={styles.mobileInnerContainer}>
      <div className={styles.mobileInnerContainerLeft}>
        <h2>Services</h2>
        <details className={styles.searchInputDisclose}>
          <summary>
            <button
              type="button"
              aria-label="search control"
              className={`${styles.mobileSearchButton} fa-solid fa-magnifying-glass`}
            />
          </summary>
          <SiteSearchInput />
        </details>
      </div>
      <span>{descriptionText}</span>
    </div>
    <div className={styles.desktopInnerContainer}>
      <div className={styles.desktopInnerContainerLeft}>
        <h2>Services</h2>
        <SiteSearchInput />
      </div>
      <span>{descriptionText}</span>
    </div>
  </>
);
