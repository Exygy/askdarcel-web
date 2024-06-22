import React, { ReactNode } from "react";

import styles from "./SecondaryNavigation.module.scss";

// TODO
export const SecondaryNavigationLayout = ({
  children,
  navigationChildren,
}: {
  children: ReactNode;
  navigationChildren: ReactNode;
}) => {

  return (
    <>
      <div className={`${styles.container}`}>
      {navigationChildren}
      </div>
      {children}
    </>
  )
}
