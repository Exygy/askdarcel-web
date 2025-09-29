import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import { MobileAgendaProps, CalendarEvent } from "../types";
import { CATEGORY_COLORS } from "../constants";
import styles from "../EventCalendar.module.scss";

export const MobileAgenda: React.FC<MobileAgendaProps> = ({
  currentDate,
  groupedEvents,
  onNavigatePrevious,
  onNavigateNext,
  onEventSelect,
  formatDateHeader,
}) => {
  return (
    <div className={styles.mobileAgenda}>
      {/* Mobile Navigation Header */}
      <div className={styles.mobileDateHeader}>
        <button
          className={styles.dateNavButton}
          onClick={onNavigatePrevious}
          aria-label="Previous day"
        >
          <ChevronLeftIcon width={24} height={24} />
        </button>
        <h2 className={styles.dateHeaderTitle}>
          {formatDateHeader(currentDate)}
        </h2>
        <button
          className={styles.dateNavButton}
          onClick={onNavigateNext}
          aria-label="Next day"
        >
          <ChevronRightIcon width={24} height={24} />
        </button>
      </div>

      {/* Events Content */}
      {Object.keys(groupedEvents).length === 0 ? (
        <div className={styles.noEventsMessage}>
          <p>No events scheduled for this day.</p>
        </div>
      ) : (
        Object.entries(groupedEvents).map(([timeKey, events]) => (
          <div key={timeKey} className={styles.agendaTimeGroup}>
            <div className={styles.agendaTimeColumn}>
              <span className={styles.agendaTime}>{timeKey}</span>
            </div>
            <div className={styles.agendaEventsColumn}>
              {events.map((event) => (
                <AgendaEventChip
                  key={event.id}
                  event={event}
                  onSelect={onEventSelect}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

interface AgendaEventChipProps {
  event: CalendarEvent;
  onSelect: (event: CalendarEvent) => void;
}

const AgendaEventChip: React.FC<AgendaEventChipProps> = ({
  event,
  onSelect,
}) => {
  // Use first color from palette as fallback
  const categoryColor = CATEGORY_COLORS[0];

  return (
    <button
      className={styles.agendaEventChip}
      style={
        {
          "--category-color": categoryColor,
        } as React.CSSProperties
      }
      onClick={() => onSelect(event)}
      type="button"
    >
      <span
        className={styles.agendaChipCategory}
        style={{ backgroundColor: categoryColor }}
      >
        {event.originalEvent.category}
      </span>
      <div className={styles.agendaChipContent}>
        <div className={styles.agendaChipTitle}>{event.title}</div>
        {event.location && (
          <div className={styles.agendaChipLocation}>📍 {event.location}</div>
        )}
      </div>
    </button>
  );
};
