import React, { ReactNode } from "react";
import styles from "./ListingInfoTable.module.scss";

interface ListingInfoTableProps<T = any> {
  rows?: T[];
  rowRenderer?: (row: T) => JSX.Element;
  children?: ReactNode;
}

export const ListingInfoTable = ({
  rows,
  rowRenderer,
  children,
}: ListingInfoTableProps) => {
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
