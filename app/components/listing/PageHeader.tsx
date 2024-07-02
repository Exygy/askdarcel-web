import React from "react";
import styles from "./PageHeader.module.scss";

type PageHeaderProps = {
  title: string;
  children?: React.ReactNode;
  dataCy: string;
};

const PageHeader = ({ title, children, dataCy }: PageHeaderProps) => (
  <header className={styles.pageHeader}>
    <h1 data-cy={dataCy} className="notranslate">
      {title}
    </h1>
    {children}
  </header>
);

export default PageHeader;
