import React from "react";
import { SiteSearchInput } from "components/ui/SiteSearchInput";
import { useMediaQuery } from "react-responsive";
import styles from "./ListingNavigationLayout.module.scss";

/**
 * Renders mobile and desktop views for Listings navigation
 */
export const ListingsNavigationLayout = ({
  descriptionText,
}: {
  descriptionText: string;
}) => {
  const isMobile = useMediaQuery({ query: "(max-width: 767px)" });

  if (isMobile) {
    return (
      <div className={styles.mobileInnerContainer}>
        <div className={styles.mobileInnerContainerLeft}>
          <h2>Services</h2>
          <details className={styles.searchInputDisclose}>
            <summary>
              <button
                type="button"
                aria-label="Show and hide search input button"
                className={`${styles.mobileSearchButton} fa-solid fa-magnifying-glass`}
              />
            </summary>
            <SiteSearchInput />
          </details>
        </div>
        <span>{descriptionText}</span>
      </div>
    );
  }

  return (
    <div className={styles.desktopInnerContainer}>
      <div className={styles.desktopInnerContainerLeft}>
        <h2>Services</h2>
        <SiteSearchInput />
      </div>
      <span>{descriptionText}</span>
    </div>
  );
};
