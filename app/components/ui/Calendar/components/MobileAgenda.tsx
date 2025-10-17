import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/16/solid";
import { MobileAgendaProps, CalendarEvent } from "../types";
import { sanitizeHtml } from "../utils";
import styles from "../EventCalendar.module.scss";

export const MobileAgenda: React.FC<MobileAgendaProps> = ({
  currentDate,
  groupedEvents,
  onNavigatePrevious,
  onNavigateNext,
  onGoToToday,
  onEventSelect,
  formatDateHeader,
}) => {
  return (
    <div className={styles.mobileAgenda}>
      {/* Mobile Navigation Header */}
      <div className={styles.mobileDateHeader}>
        <button
          type="button"
          className={styles.dateNavButton}
          onClick={onNavigatePrevious}
          aria-label="Previous day"
        >
          <ChevronLeftIcon
            width={24}
            height={24}
            style={{ pointerEvents: "none" }}
          />
        </button>
        <div className={styles.dateHeaderTitle}>
          <h2>{formatDateHeader(currentDate)}</h2>
          {new Date().toDateString() !== currentDate.toDateString() && (
            <button type="button" onClick={onGoToToday}>
              Go to today
            </button>
          )}
        </div>
        <button
          type="button"
          className={styles.dateNavButton}
          onClick={onNavigateNext}
          aria-label="Next day"
        >
          <ChevronRightIcon
            width={24}
            height={24}
            style={{ pointerEvents: "none" }}
          />
        </button>
      </div>

      {/* Scrollable Events Content */}
      <div className={styles.agendaContent}>
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
  return (
    <button
      className={styles.agendaEventChip}
      onClick={() => onSelect(event)}
      type="button"
    >
      <div
        className={styles.agendaChipTitle}
        dangerouslySetInnerHTML={{
          __html: sanitizeHtml(event.title || ""),
        }}
      />
      {event.location && (
        <div className={styles.agendaChipLocation}>{event.location}</div>
      )}
    </button>
  );
};
