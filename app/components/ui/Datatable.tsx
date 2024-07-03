import React from "react";
import styles from "./DataTable.module.scss";

interface DataTableProps<T = any> {
  rows: T[];
  rowRenderer: (row: T) => JSX.Element;
}

export const DataTable = <T extends unknown>({
  rows,
  rowRenderer,
}: DataTableProps<T>) => {
  return (
    <table className={styles.dataTable}>
      <tbody>{rows.map((row) => rowRenderer(row))}</tbody>
    </table>
  );
};
