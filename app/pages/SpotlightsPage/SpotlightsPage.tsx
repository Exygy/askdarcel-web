import React from "react";
import { Helmet } from "react-helmet-async";
import { useSpotlightsData } from "hooks/StrapiAPI";
import { Loader } from "components/ui/Loader";
import { PageHeader } from "components/ui/Navigation/PageHeader";
import { BrowseHeaderSection } from "components/SearchAndBrowse/Header/BrowseHeaderSection";
import { SpotlightCard } from "components/ui/Cards/SpotlightCard";
import styles from "./SpotlightsPage.module.scss";

export const SpotlightsPage = () => {
  const { data: spotlights, error, isLoading } = useSpotlightsData();

  return (
    <>
      <Helmet>
        <title>Our415 - Spotlights</title>
      </Helmet>
      <PageHeader>
        <BrowseHeaderSection
          title="Spotlights"
          descriptionText="See what's happening for San Francisco families right now."
        />
      </PageHeader>
      <div className={styles.container}>
        {isLoading && <Loader />}
        {error && (
          <p>Spotlights could not be loaded. Please try again later.</p>
        )}
        {spotlights && (
          <>
            <p className={styles.count}>
              {spotlights.length}{" "}
              {spotlights.length === 1 ? "spotlight" : "spotlights"}
            </p>
            <ul className={styles.grid}>
              {spotlights.map((spotlight) => (
                <li key={spotlight.slug}>
                  <SpotlightCard spotlight={spotlight} />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  );
};
