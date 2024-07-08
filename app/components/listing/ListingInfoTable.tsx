import React, { ReactNode } from "react";
import styles from "./ListingInfoTable.module.scss";

interface ListingInfoTableProps<T = any> {
  rows?: T[];
  rowRenderer?: (row: T) => JSX.Element;
  children?: ReactNode;
}

export const ListingInfoTable = <T extends unknown>({
  rows,
  rowRenderer,
  children,
}: ListingInfoTableProps<T>) => {
  return (
    <table className={styles.listingInfoTable}>
      <tbody>
        {children}
        {!children &&
          rows &&
          rowRenderer &&
          rows.map((row) => rowRenderer(row))}
      </tbody>
    </table>
  );
};
