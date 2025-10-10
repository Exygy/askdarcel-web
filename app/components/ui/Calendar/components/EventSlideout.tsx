import React, { useEffect, useLayoutEffect, useRef } from "react";
import { XMarkIcon } from "@heroicons/react/16/solid";
import { EventSlideoutProps } from "../types";
import { sanitizeHtml } from "../utils";
import styles from "../EventCalendar.module.scss";

export const EventSlideout: React.FC<EventSlideoutProps> = ({
  isOpen,
  onClose,
  selectedEvent,
  dayEvents,
  selectedDate,
  onEventSelect,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Handle escape key to close slideout
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when slideout is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Focus management - focus the close button when slideout opens
  useLayoutEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen || (!selectedEvent && dayEvents.length === 0)) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={styles.slideoutBackdrop}
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close event details"
      />

      {/* Slideout Panel */}
      <div className={styles.slideoutPanel}>
        <div className={styles.slideoutHeader}>
          <h2 className={styles.slideoutTitle}>
            {selectedEvent ? (
              <span
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(String(selectedEvent.title || "")),
                }}
              />
            ) : selectedDate ? (
              `Events for ${selectedDate.toLocaleDateString()}`
            ) : (
              "Event Details"
            )}
          </h2>
          <button
            ref={closeButtonRef}
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close event details"
          >
            <XMarkIcon width={16} height={16} />
          </button>
        </div>

        <div className={styles.slideoutContent}>
          {/* Single Event Details */}
          {selectedEvent && (
            <>
              <div className={styles.eventDetail}>
                <div
                  className={styles.categoryBadge}
                  style={{
                    backgroundColor: "#000000",
                    color: "#ffffff",
                  }}
                >
                  {selectedEvent.originalEvent.events_category}
                </div>
              </div>

              {selectedEvent.location && (
                <div className={styles.eventDetail}>
                  <strong>📍 Location:</strong>
                  <span>{selectedEvent.location}</span>
                </div>
              )}

              <div className={styles.eventDetail}>
                <strong>📅 Date & Time:</strong>
                <span>
                  {selectedEvent.start &&
                    selectedEvent.start.toLocaleDateString()}{" "}
                  at{" "}
                  {selectedEvent.allDay
                    ? "All Day"
                    : selectedEvent.start?.toLocaleTimeString()}
                  {!selectedEvent.allDay &&
                    selectedEvent.end &&
                    ` - ${selectedEvent.end.toLocaleTimeString()}`}
                </span>
              </div>

              {selectedEvent.description && (
                <div className={styles.eventDetail}>
                  <strong>📝 Description:</strong>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(selectedEvent.description),
                    }}
                  />
                </div>
              )}

              {selectedEvent.originalEvent.org_name && (
                <div className={styles.eventDetail}>
                  <strong>🏢 Organization:</strong>
                  <span>{selectedEvent.originalEvent.org_name}</span>
                </div>
              )}

              {selectedEvent.originalEvent.site_address && (
                <div className={styles.eventDetail}>
                  <strong>🗺️ Address:</strong>
                  <span>{selectedEvent.originalEvent.site_address}</span>
                </div>
              )}

              {selectedEvent.originalEvent.site_phone && (
                <div className={styles.eventDetail}>
                  <strong>📞 Phone:</strong>
                  <span>{selectedEvent.originalEvent.site_phone}</span>
                </div>
              )}

              {selectedEvent.originalEvent.site_email && (
                <div className={styles.eventDetail}>
                  <strong>📧 Email:</strong>
                  <span>
                    <a
                      href={`mailto:${selectedEvent.originalEvent.site_email}`}
                    >
                      {selectedEvent.originalEvent.site_email}
                    </a>
                  </span>
                </div>
              )}

              {selectedEvent.originalEvent.fee !== undefined && (
                <div className={styles.eventDetail}>
                  <strong>💰 Fee:</strong>
                  <span>
                    {selectedEvent.originalEvent.fee ? "Yes" : "Free"}
                  </span>
                </div>
              )}

              {selectedEvent.originalEvent.age_group_eligibility_tags && (
                <div className={styles.eventDetail}>
                  <strong>👥 Age Group:</strong>
                  <span>
                    {selectedEvent.originalEvent.age_group_eligibility_tags}
                  </span>
                </div>
              )}
            </>
          )}

          {/* Multiple Events for a Day */}
          {dayEvents.length > 0 && (
            <div className={styles.dayEventsList}>
              <p className={styles.eventCount}>
                {dayEvents.length} event{dayEvents.length > 1 ? "s" : ""} on
                this day
              </p>

              {dayEvents.map((event) => (
                <div key={event.id} className={styles.eventCard}>
                  <div className={styles.eventCardHeader}>
                    <div
                      className={styles.eventCategoryDot}
                      style={{
                        backgroundColor: "#000000",
                      }}
                    />
                    <h4
                      className={styles.eventCardTitle}
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(String(event.title || "")),
                      }}
                    />
                  </div>

                  <div className={styles.eventCardContent}>
                    <div className={styles.eventCardMeta}>
                      <span className={styles.eventTime}>
                        {event.allDay
                          ? "All Day"
                          : `${event.start?.toLocaleTimeString()} ${
                              event.end
                                ? `- ${event.end.toLocaleTimeString()}`
                                : ""
                            }`}
                      </span>
                      {event.location && (
                        <span className={styles.eventLocation}>
                          📍 {event.location}
                        </span>
                      )}
                    </div>

                    <div className={styles.eventCardCategory}>
                      <span
                        className={styles.categoryTag}
                        style={{
                          backgroundColor: "#000000",
                          color: "#ffffff",
                        }}
                      >
                        {event.originalEvent.events_category}
                      </span>
                    </div>

                    {event.description && (
                      <p
                        className={styles.eventDescription}
                        dangerouslySetInnerHTML={{
                          __html: sanitizeHtml(
                            event.description.length > 120
                              ? `${event.description.substring(0, 120)}...`
                              : event.description
                          ),
                        }}
                      />
                    )}

                    <div className={styles.eventCardActions}>
                      <button
                        className={styles.viewEventButton}
                        onClick={() => {
                          onEventSelect(event);
                        }}
                      >
                        View Details
                      </button>
                      {event.pageLink && (
                        <button
                          className={styles.externalLinkButton}
                          onClick={() =>
                            window.open(
                              event.pageLink,
                              "_blank",
                              "noopener noreferrer"
                            )
                          }
                        >
                          More Info
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.slideoutFooter}>
          {selectedEvent && selectedEvent.pageLink && (
            <button
              className={styles.primaryButton}
              onClick={() =>
                window.open(
                  selectedEvent.pageLink,
                  "_blank",
                  "noopener noreferrer"
                )
              }
            >
              View More Details
            </button>
          )}
          <button className={styles.secondaryButton} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </>
  );
};
