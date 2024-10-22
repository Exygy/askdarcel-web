import React from "react";
import classNames from "classnames";
import styles from "./LabelTag.module.scss";

interface LabelTagProps {
  label: string;
}

const servicePillStyle = {
  background: "#FCE8E5",
};

const organizationPillStyle = {
  background: "#E1EFFE",
};

export const LabelTag = (props: LabelTagProps) => {
  const { label } = props;

  if (label === "resource") {
    return (
      <span
        className={classNames(styles.labelTag)}
        style={organizationPillStyle}
      >
        Organization
      </span>
    );
  }

  return (
    <span className={classNames(styles.labelTag)} style={servicePillStyle}>
      Service
    </span>
  );
};
