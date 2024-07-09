import React from "react";
import styles from "./LabelTag.module.scss";

interface LabelTagProps {
  label: string;
}

export const LabelTag = (props: LabelTagProps) => {
  const label = props.label;

  return <span className={styles.labelTag}>{label}</span>;
};
