import React from "react";
import classNames from "classnames";
import styles from "./LabelTag.module.scss";

interface LabelTagProps {
  label: string;
}

export const LabelTag = (props: LabelTagProps) => {
  const { label } = props;

  if (label === "resource") {
    return (
      <span className={classNames(styles.labelTag, styles.organizationType)}>
        Organization
      </span>
    );
  }

  return (
    <span className={classNames(styles.labelTag, styles.serviceType)}>
      Service
    </span>
  );
};
