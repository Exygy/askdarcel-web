import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BlocksRenderer } from "@strapi/blocks-react-renderer";
import { useSpotlightData } from "hooks/StrapiAPI";
import { SpotlightEntry, useSpotlightItems } from "hooks/useSpotlightItems";
import { Spotlight } from "models/Strapi";
import { Loader } from "components/ui/Loader";
import { Button } from "components/ui/inline/Button/Button";
import { LabelTag } from "components/ui/LabelTag";
import { CustomMarker } from "components/ui/MapElements";
import { formatCalendarEventDisplay } from "components/ui/Cards/FormattedDate";
import { SearchMap } from "components/SearchAndBrowse/SearchMap/SearchMap";
import { SearchResult } from "components/SearchAndBrowse/SearchResults/SearchResult";
import searchResultsStyles from "components/SearchAndBrowse/SearchResults/SearchResults.module.scss";
import { PageNotFoundPage } from "pages/PageNotFoundPage/PageNotFoundPage";
import styles from "./SpotlightPage.module.scss";

// The GoogleMap component positions children by their lat and lng props.
/* eslint-disable react/no-unused-prop-types */
const SpotlightLocationMarker = ({
  label,
}: {
  lat: number;
  lng: number;
  label: string;
}) => (
  <span
    role="img"
    aria-label={label}
    className={styles.locationMarker}
    title={label}
  >
    <CustomMarker fill="#111928" stroke="#111928" />
  </span>
);
/* eslint-enable react/no-unused-prop-types */

const ExternalLinkCard = ({ label, url }: { label: string; url: string }) => {
  let host = "";
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    // Staff entered something that isn't a full web address.
  }
  return (
    <div className={searchResultsStyles.searchResult}>
      <div className={searchResultsStyles.searchResultContentContainer}>
        <div className={searchResultsStyles.titleContainer}>
          <div>
            <h3 className={searchResultsStyles.title}>
              <a href={url} className={searchResultsStyles.titleLink}>
                {label}
              </a>
            </h3>
            {host && (
              <div className={searchResultsStyles.serviceOf}>{host}</div>
            )}
          </div>
          <div className={searchResultsStyles.searchResultSubcatContainer}>
            <LabelTag label="External link" />
          </div>
        </div>
      </div>
      <div className={`${searchResultsStyles.sideLinks} no-print`}>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={url}
          className={`${searchResultsStyles.icon} ${searchResultsStyles["icon-popout"]}`}
          aria-label={`Visit ${label} (opens in new tab)`}
        />
      </div>
    </div>
  );
};

const SpotlightHeader = ({ spotlight }: { spotlight: Spotlight }) => {
  const { title, description, image, event_date, location, link } = spotlight;
  const imageAttributes = image?.data?.attributes;
  const locationText = location
    ? [location.name, location.street].filter(Boolean).join(", ")
    : "";
  const directionsUrl =
    location?.latitude && location?.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`
      : null;

  return (
    <div className={styles.header}>
      <div className={styles.headerText}>
        <p className={styles.eyebrow}>Spotlight</p>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.description}>
          <BlocksRenderer content={description || []} />
        </div>
        {event_date?.startdate && (
          <p className={styles.detail}>
            <span className="fas fa-calendar" aria-hidden="true" />
            {formatCalendarEventDisplay(event_date)}
          </p>
        )}
        {locationText && (
          <p className={styles.detail}>
            <span className="fas fa-location-dot" aria-hidden="true" />
            {locationText}
          </p>
        )}
        {(link?.url || directionsUrl) && (
          <div className={styles.buttons}>
            {link?.url && (
              <Button
                variant="primary"
                iconName="arrow-up-right-from-square"
                iconVariant="after"
                href={link.url}
                isExternalLink
              >
                {link.text || "Visit website"}
              </Button>
            )}
            {directionsUrl && (
              <Button
                variant="secondary"
                iconName="diamond-turn-right"
                iconVariant="before"
                href={directionsUrl}
                isExternalLink
              >
                Directions
              </Button>
            )}
          </div>
        )}
      </div>
      {imageAttributes?.url && (
        <img
          className={styles.image}
          src={imageAttributes.url}
          alt={imageAttributes.alternativeText ?? ""}
        />
      )}
    </div>
  );
};

const SpotlightItems = ({
  spotlight,
  entries,
}: {
  spotlight: Spotlight;
  entries: SpotlightEntry[];
}) => {
  const [hoveredHitId, setHoveredHitId] = useState<string | null>(null);
  const { location } = spotlight;
  const locationMarker =
    location?.latitude && location?.longitude ? (
      <SpotlightLocationMarker
        lat={location.latitude}
        lng={location.longitude}
        label={`Spotlight location: ${[location.name, location.street]
          .filter(Boolean)
          .join(", ")}`}
      />
    ) : null;
  const hits = entries.flatMap((entry) =>
    entry.kind === "resource" ? [entry.hit] : []
  );

  if (entries.length === 0) {
    if (!locationMarker) return null;
    return (
      <section className={styles.items}>
        <h2 className={styles.itemsTitle}>Location</h2>
        <div className={styles.locationOnlyMap}>
          <SearchMap
            hits={[]}
            mobileMapIsCollapsed={false}
            handleSearchMapAction={() => undefined}
            showSearchAreaButton={false}
          >
            {locationMarker}
          </SearchMap>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.items}>
      <h2 className={styles.itemsTitle}>In this spotlight</h2>
      <p className={styles.itemsCount}>
        {entries.length} {entries.length === 1 ? "resource" : "resources"}
      </p>
      <div className={searchResultsStyles.searchResultsAndMapContainer}>
        <div className={searchResultsStyles.searchResultsContainer}>
          <ul className={searchResultsStyles.resultsList}>
            {entries.map((entry, index) =>
              entry.kind === "resource" ? (
                <li key={`resource-${entry.hit.id}`}>
                  <SearchResult
                    hit={entry.hit}
                    index={index}
                    isHighlighted={hoveredHitId === entry.hit.id}
                    onMouseEnter={() => setHoveredHitId(entry.hit.id)}
                    onMouseLeave={() => setHoveredHitId(null)}
                  />
                </li>
              ) : (
                <li key={`link-${entry.item.id}`}>
                  <ExternalLinkCard
                    label={entry.item.label}
                    url={entry.item.url}
                  />
                </li>
              )
            )}
          </ul>
        </div>
        <SearchMap
          hits={hits}
          mobileMapIsCollapsed={false}
          handleSearchMapAction={() => undefined}
          highlightedHitId={hoveredHitId}
          showSearchAreaButton={false}
        >
          {locationMarker}
        </SearchMap>
      </div>
    </section>
  );
};

export const SpotlightPage = () => {
  const { slug } = useParams();
  const {
    data: spotlight,
    error,
    isLoading,
  } = useSpotlightData(slug as string);
  const {
    data: entries,
    error: itemsError,
    isLoading: itemsLoading,
  } = useSpotlightItems(
    spotlight?.items ?? undefined,
    spotlight?.supervisor_district
  );

  if (isLoading) return <Loader />;
  if (error || !spotlight) return <PageNotFoundPage />;

  return (
    <div className={styles.page}>
      <Helmet>
        <title>{`Our415 - ${spotlight.title}`}</title>
      </Helmet>
      <div className={styles.headerContainer}>
        <Link to="/spotlights" className={styles.backLink}>
          <span className="fas fa-arrow-left" aria-hidden="true" />
          All spotlights
        </Link>
        <SpotlightHeader spotlight={spotlight} />
      </div>
      {itemsLoading && <Loader />}
      {itemsError && (
        <p className={styles.itemsError}>
          The resources in this spotlight could not be loaded. Please try again
          later.
        </p>
      )}
      {entries && <SpotlightItems spotlight={spotlight} entries={entries} />}
    </div>
  );
};
