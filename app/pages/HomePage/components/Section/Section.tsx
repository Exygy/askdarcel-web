import { Button } from "components/ui/inline/Button/Button";
import React from "react";
import styles from "./Section.module.scss";
import { BackgroundColorVariant } from "models";

export interface Slug {
  current: string;
  _type: string;
}

export const HomePageSection = ({
  title,
  description,
  backgroundColor,
  link,
  children,
}: {
  title?: string;
  description?: string;
  backgroundColor: BackgroundColorVariant;
  children?: React.ReactNode;
  link?: {
    label: string;
    slug: Slug;
  };
}) => (
  <section className={`${styles.section} ${styles[backgroundColor]}`}>
    <div className={styles.content}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.description}>{description}</p>
        </div>

        {link && (
          <Button href={link.slug.current} arrowVariant="after" size="lg">
            {link.label}
          </Button>
        )}
      </div>
      {children}
    </div>
  </section>
);
