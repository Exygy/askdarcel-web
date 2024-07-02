import React from "react";
import styles from "./ListingInfoSection.module.scss";
import classNames from "classnames";

type ListingInfoSectionProps = {
  title: string;
  borderBottom?: boolean;
} & React.HTMLProps<HTMLDivElement>;

export const ListingInfoSection = ({
  children,
  title,
  borderBottom = true,
  ...props
}: ListingInfoSectionProps) => {
  const sectionClassnames = classNames(
    styles.listingInfoSection,
    borderBottom && styles.borderBottom
  );

  return (
    <section className={sectionClassnames} {...props}>
      <h2>{title}</h2>
      {children}
    </section>
  );
};
