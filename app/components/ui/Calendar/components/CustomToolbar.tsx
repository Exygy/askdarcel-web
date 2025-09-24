import React from "react";
import { ToolbarProps } from "react-big-calendar";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { CalendarEvent } from "../types";
import styles from "../EventCalendar.module.scss";

/**
 * Custom toolbar for the event calendar with chevrons and centered date
 * Matches the original EventCalendar toolbar layout with left/center/right sections
 */
export const CustomToolbar: React.FC<ToolbarProps<CalendarEvent, object>> = ({
  date,
  onNavigate,
  label,
}) => {
  return (
    <div className={styles.customToolbar}>
      <div className={styles.toolbarLeft}>
        <button
          className={styles.toolbarButton}
          onClick={() => onNavigate("PREV")}
        >
          <ChevronLeftIcon width={16} height={16} /> Back
        </button>
      </div>
      <div className={styles.toolbarCenter}>
        <h2 className={styles.toolbarLabel}>{label}</h2>
      </div>
      <div className={styles.toolbarRight}>
        <button
          className={styles.toolbarButton}
          onClick={() => onNavigate("TODAY")}
        >
          Today
        </button>
        <button
          className={styles.toolbarButton}
          onClick={() => onNavigate("NEXT")}
        >
          Next <ChevronRightIcon width={16} height={16} />
        </button>
      </div>
    </div>
  );
};
