import React from "react";
import { Link } from "react-router-dom";
import { Button } from "components/ui/inline/Button/Button";
import { Spotlight } from "models/Strapi";
import styles from "./SpotlightCard.module.scss";

export const SpotlightCard = ({ spotlight }: { spotlight: Spotlight }) => {
  const image = spotlight.image?.data?.attributes;
  return (
    <div className={styles.card}>
      {image?.url && (
        <img
          className={styles.image}
          src={image.url}
          alt={image.alternativeText ?? ""}
        />
      )}
      <div className={styles.content}>
        <p className={styles.eyebrow}>Spotlight</p>
        <h2 className={styles.title}>
          <Link to={`/spotlights/${spotlight.slug}`}>{spotlight.title}</Link>
        </h2>
        {spotlight.short_description && (
          <p className={styles.description}>{spotlight.short_description}</p>
        )}
        <Button
          arrowVariant="after"
          variant="linkBlue"
          mobileFullWidth={false}
          isVisualOnly
        >
          Learn more
        </Button>
      </div>
    </div>
  );
};
