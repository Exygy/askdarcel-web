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
  const useRowRenderer = !children && rows && rowRenderer;

  return (
    <table className={styles.listingInfoTable}>
      <tbody>
        {children}
        {useRowRenderer && rows.map((row) => rowRenderer(row))}
      </tbody>
    </table>
  );
};