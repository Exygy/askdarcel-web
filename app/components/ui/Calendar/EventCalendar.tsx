import React, { useMemo, useState } from "react";
import { Calendar, momentLocalizer, Event, Views } from "react-big-calendar";
import moment from "moment";
import DOMPurify from "dompurify";
import { SFGovEvent } from "hooks/SFGovAPI";
import { Loader } from "../Loader";
import styles from "./EventCalendar.module.scss";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";

// Setup the localizer
const localizer = momentLocalizer(moment);

// Utility function to safely sanitize HTML content
const sanitizeHtml = (html: string): string => {
  if (!html) return html;

  // Configure DOMPurify to allow only safe HTML elements and attributes
  const cleanHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "span", "div", "a"],
    ALLOWED_ATTR: ["href", "target", "rel"],
    ALLOWED_URI_REGEXP: /^https?:\/\//, // Only allow http/https links
  });

  return cleanHtml;
};

// Color palette for categories
const CATEGORY_COLORS = [
  "#E3F2FD", // Light Blue
  "#E8F5E8", // Light Green
  "#F3E5F5", // Light Purple
  "#FFF3E0", // Light Orange
  "#FCE4EC", // Light Pink
  "#FFFDE7", // Light Yellow
  "#E0F7FA", // Light Cyan
  "#F0F4FF", // Light Periwinkle
  "#F5F5F5", // Light Gray
];

// Function to get color for a category
const getCategoryColor = (index: number): string => {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
};

// Function to get darker version of color for text/borders
const getDarkerColor = (color: string): string => {
  // Simple function to darken hex colors
  const hex = color.replace("#", "");
  const r = Math.max(0, parseInt(hex.substr(0, 2), 16) - 40);
  const g = Math.max(0, parseInt(hex.substr(2, 2), 16) - 40);
  const b = Math.max(0, parseInt(hex.substr(4, 2), 16) - 40);
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

// Helper function to parse days_of_week string and check if a date matches
const shouldEventOccurOnDay = (
  daysOfWeek: string | undefined,
  date: Date
): boolean => {
  if (!daysOfWeek || daysOfWeek.trim() === "") {
    // No days specified, assume every day
    return true;
  }

  // Map of day abbreviations to JavaScript day numbers (0 = Sunday, 6 = Saturday)
  const dayMap: { [key: string]: number } = {
    Su: 0,
    M: 1,
    T: 2,
    W: 3,
    Th: 4,
    F: 5,
    Sa: 6,
  };

  const dayOfWeek = date.getDay();

  // Handle range format like "M-F" (Monday through Friday)
  if (daysOfWeek.includes("-")) {
    const [start, end] = daysOfWeek.split("-");
    const startDay = dayMap[start.trim()];
    const endDay = dayMap[end.trim()];

    if (startDay !== undefined && endDay !== undefined) {
      // Handle wrap-around (e.g., F-M would be Friday through Monday)
      if (startDay <= endDay) {
        return dayOfWeek >= startDay && dayOfWeek <= endDay;
      } else {
        return dayOfWeek >= startDay || dayOfWeek <= endDay;
      }
    }
  }

  // Handle comma-separated format like "T,W,F,Sa"
  const days = daysOfWeek.split(",").map((d) => d.trim());
  return days.some((day) => dayMap[day] === dayOfWeek);
};

// Helper function to ensure URLs have proper protocol
const ensureHttpsProtocol = (url: string): string => {
  if (!url || url.trim() === "") return url;

  const trimmedUrl = url.trim();

  // Security: Block potentially dangerous protocols
  const dangerousProtocols = ["javascript", "data", "vbscript", "file", "ftp"];
  const lowerUrl = trimmedUrl.toLowerCase();
  if (
    dangerousProtocols.some((protocol) => lowerUrl.startsWith(`${protocol}:`))
  ) {
    return ""; // Return empty string for dangerous protocols
  }

  // If it already has a safe protocol, return as is
  if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
    return trimmedUrl;
  }

  // If it's a relative path, return as-is
  if (
    trimmedUrl.startsWith("/") ||
    trimmedUrl.startsWith("./") ||
    trimmedUrl.startsWith("../")
  ) {
    return trimmedUrl;
  }

  // Try to parse as a valid URL; if it fails, prepend https:// and try again
  try {
    // Try parsing as is (may throw if missing protocol)
    new URL(trimmedUrl);
    // If no error, but no protocol, add https://
    return `https://${trimmedUrl}`;
  } catch {
    try {
      // Try parsing with https:// prepended
      const testUrl = new URL(`https://${trimmedUrl}`);

      // Additional security: Ensure the URL has a valid hostname
      if (testUrl.hostname && testUrl.hostname !== "localhost") {
        return `https://${trimmedUrl}`;
      }

      // If hostname is suspicious, return original
      return trimmedUrl;
    } catch {
      // If still invalid, return original
      return trimmedUrl;
    }
  }
};
interface CalendarEvent extends Event {
  id: string;
  pageLink: string;
  description: string;
  location?: string;
  originalEvent: SFGovEvent;
}

interface EventCalendarProps {
  events: SFGovEvent[] | null;
  onEventSelect?: (event: CalendarEvent) => void;
}

interface CategoryFilter {
  category: string;
  enabled: boolean;
  color: string;
}

export const EventCalendar: React.FC<EventCalendarProps> = ({
  events,
  onEventSelect,
}) => {
  // State for slideout menu
  const [slideoutOpen, setSlideoutOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  // State for showing multiple events from a day
  const [dayEvents, setDayEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // State for mobile agenda navigation
  const [currentMobileDate, setCurrentMobileDate] = useState<Date>(new Date());

  // Navigation functions for mobile agenda view
  const navigateToPreviousDay = () => {
    setCurrentMobileDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  const navigateToNextDay = () => {
    setCurrentMobileDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  const formatMobileDateHeader = (date: Date): string => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  // Extract unique categories from events and create filter state
  const availableCategories = useMemo(() => {
    if (!events) return [];

    const uniqueCategories = Array.from(
      new Set(events.map((event) => event.category).filter(Boolean))
    ).sort();

    return uniqueCategories;
  }, [events]);

  // State for category filters - all categories enabled by default
  const [categoryFilters, setCategoryFilters] = useState<CategoryFilter[]>(() =>
    availableCategories.map((category, index) => ({
      category,
      enabled: true,
      color: getCategoryColor(index),
    }))
  );

  // Update category filters when available categories change
  React.useEffect(() => {
    setCategoryFilters((prev) => {
      const existingCategories = new Set(prev.map((f) => f.category));
      const newFilters = [...prev];

      // Add new categories that weren't present before
      availableCategories.forEach((category, index) => {
        if (!existingCategories.has(category)) {
          newFilters.push({
            category,
            enabled: true,
            color: getCategoryColor(availableCategories.indexOf(category)),
          });
        }
      });

      // Remove categories that no longer exist
      return newFilters.filter((filter) =>
        availableCategories.includes(filter.category)
      );
    });
  }, [availableCategories]);

  // Get enabled category names
  const enabledCategories = useMemo(
    () =>
      new Set(categoryFilters.filter((f) => f.enabled).map((f) => f.category)),
    [categoryFilters]
  );

  // Toggle category filter
  const toggleCategory = (category: string) => {
    setCategoryFilters((prev) =>
      prev.map((filter) =>
        filter.category === category
          ? { ...filter, enabled: !filter.enabled }
          : filter
      )
    );
  };

  // Get category color mapping
  const categoryColorMap = useMemo(() => {
    const map = new Map<string, string>();
    categoryFilters.forEach((filter) => {
      map.set(filter.category, filter.color);
    });
    return map;
  }, [categoryFilters]);

  // Responsive views and default view for mobile
  const calendarViews = useMemo(() => {
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      return [Views.AGENDA];
    }
    return [Views.MONTH];
  }, []);

  const defaultView = useMemo(() => {
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      return Views.AGENDA;
    }
    return Views.MONTH;
  }, []);

  // Responsive calendar height
  const calendarHeight = useMemo(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth <= 768 ? 600 : 800;
    }
    return 800;
  }, []);

  const calendarEvents = useMemo(() => {
    if (!events) return [];

    const transformedEvents: CalendarEvent[] = [];

    events
      .filter((event) => {
        // Filter out events without start date
        if (!event.event_start_date) return false;

        // Filter by category if category filters are active
        if (
          categoryFilters.length > 0 &&
          !enabledCategories.has(event.category)
        ) {
          return false;
        }

        return true;
      })
      .forEach((event) => {
        const startDateOnly = new Date(event.event_start_date);
        const endDateOnly = event.event_end_date
          ? new Date(event.event_end_date)
          : new Date(event.event_start_date);

        // Check if this is a recurring event (has both start/end dates AND start/end times)
        const isRecurringEvent =
          event.event_end_date &&
          event.start_time &&
          event.end_time &&
          startDateOnly.toDateString() !== endDateOnly.toDateString();

        if (isRecurringEvent) {
          // Create individual events for each day between start and end dates
          const currentDate = new Date(startDateOnly);

          while (currentDate <= endDateOnly) {
            // Check if event should occur on this day of the week
            if (shouldEventOccurOnDay(event.days_of_week, currentDate)) {
              // Parse times for this specific day
              const [startHours, startMinutes, startSeconds = 0] =
                event.start_time.split(":").map(Number);
              const [endHours, endMinutes, endSeconds = 0] = event.end_time
                .split(":")
                .map(Number);

              // Create start datetime for this day
              const dayStartDate = new Date(currentDate);
              dayStartDate.setHours(startHours, startMinutes, startSeconds);

              // Create end datetime for this day
              const dayEndDate = new Date(currentDate);
              dayEndDate.setHours(endHours, endMinutes, endSeconds);

              // Add individual event for this day
              transformedEvents.push({
                id: `${event.id}-${currentDate.toISOString().split("T")[0]}`, // Unique ID per day
                title: event.event_name,
                start: dayStartDate,
                end: dayEndDate,
                pageLink: ensureHttpsProtocol(event.more_info || ""),
                description: event.event_description || "",
                location: event.site_location_name || "",
                allDay: false, // These are timed events
                originalEvent: event,
              });
            }

            // Move to next day
            currentDate.setDate(currentDate.getDate() + 1);
          }
        } else {
          // Handle as single event (existing logic)
          const startDate = new Date(event.event_start_date);
          if (event.start_time) {
            const [hours, minutes, seconds] = event.start_time
              .split(":")
              .map(Number);
            startDate.setHours(hours, minutes, seconds || 0);
          }

          let endDate: Date;
          const isAllDayEvent = !event.start_time && !event.end_time;

          if (event.event_end_date) {
            endDate = new Date(event.event_end_date);
            if (event.end_time) {
              const [hours, minutes, seconds] = event.end_time
                .split(":")
                .map(Number);
              endDate.setHours(hours, minutes, seconds || 0);
            } else if (event.start_time) {
              // If there's a start time but no end time, default to 1 hour duration
              endDate = new Date(startDate);
              endDate.setHours(endDate.getHours() + 1);
            } else {
              // No specific time, treat as all day event - end date should be same day
              endDate.setHours(23, 59, 59, 999);
            }
          } else {
            // If no end date, assume same day as start
            endDate = new Date(startDate);
            if (event.start_time && !event.end_time) {
              // If there's a start time but no end time, default to 1 hour duration
              endDate.setHours(endDate.getHours() + 1);
            } else if (isAllDayEvent) {
              // All day event - end should be same day
              endDate.setHours(23, 59, 59, 999);
            }
          }

          transformedEvents.push({
            id: event.id,
            title: event.event_name,
            start: startDate,
            end: endDate,
            pageLink: ensureHttpsProtocol(event.more_info || ""),
            description: event.event_description || "",
            location: event.site_location_name || "",
            allDay: isAllDayEvent,
            originalEvent: event,
          });
        }
      });

    // Filter events for mobile agenda view to show only current day
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
    if (isMobile) {
      const currentDateStr = currentMobileDate.toDateString();
      return transformedEvents.filter((event) => {
        return event.start && event.start.toDateString() === currentDateStr;
      });
    }

    return transformedEvents;
  }, [events, categoryFilters.length, enabledCategories, currentMobileDate]);

  // Group events by start time for mobile agenda view
  const groupedEventsByTime = useMemo(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
    if (!isMobile) return {};

    const groups: { [timeKey: string]: CalendarEvent[] } = {};

    calendarEvents.forEach((event) => {
      if (!event.start) return;

      // Create time key - format as HH:MM for grouping
      const timeKey = event.allDay
        ? "All Day"
        : event.start.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });

      if (!groups[timeKey]) {
        groups[timeKey] = [];
      }
      groups[timeKey].push(event);
    });

    // Sort time keys to ensure proper chronological order
    const sortedGroups: { [timeKey: string]: CalendarEvent[] } = {};
    const timeKeys = Object.keys(groups).sort((a, b) => {
      if (a === "All Day") return -1;
      if (b === "All Day") return 1;

      // Convert time strings to comparable format
      const timeA = new Date(`1970-01-01 ${a}`);
      const timeB = new Date(`1970-01-01 ${b}`);
      return timeA.getTime() - timeB.getTime();
    });

    timeKeys.forEach((key) => {
      sortedGroups[key] = groups[key];
    });

    return sortedGroups;
  }, [calendarEvents]);

  const handleSelectEvent = (event: CalendarEvent) => {
    // Open slideout with single event details
    setSelectedEvent(event);
    setDayEvents([]);
    setSelectedDate(null);
    setSlideoutOpen(true);

    // Still call the optional onEventSelect prop if provided
    if (onEventSelect) {
      onEventSelect(event);
    }
  };

  const handleShowMore = (events: CalendarEvent[], date: Date) => {
    // Open slideout with multiple events for the day
    setDayEvents(events);
    setSelectedDate(date);
    setSelectedEvent(null);
    setSlideoutOpen(true);
  };

  const closeSlideout = () => {
    setSlideoutOpen(false);
    setSelectedEvent(null);
    setDayEvents([]);
    setSelectedDate(null);
  };

  // Handle escape key to close slideout
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && slideoutOpen) {
        closeSlideout();
      }
    };

    if (slideoutOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when slideout is open
      document.body.style.overflow = "hidden";

      // Focus management - focus the close button when slideout opens
      setTimeout(() => {
        const closeBtn = document.querySelector(
          ".close-slideout-btn"
        ) as HTMLElement;
        closeBtn?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [slideoutOpen]);

  const eventStyleGetter = (event: CalendarEvent) => {
    const categoryColor =
      categoryColorMap.get(event.originalEvent.category) || "#007bff";
    const darkerColor = getDarkerColor(categoryColor);

    return {
      style: {
        backgroundColor: categoryColor,
        borderRadius: "6px",
        opacity: 0.9,
        color: "#000000",
        border: `2px solid ${darkerColor}`,
        display: "block",
        cursor: "pointer",
        fontWeight: "500",
      },
    };
  };

  // Components object for react-big-calendar
  const calendarComponents = useMemo(() => {
    // Custom toolbar component for balanced layout
    const CustomToolbar = ({
      date,
      onNavigate,
      label,
    }: {
      date: Date;
      onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
      label: string;
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

    // Custom event component for agenda view
    const AgendaEvent = ({ event }: { event: CalendarEvent }) => {
      const categoryColor =
        categoryColorMap.get(event.originalEvent.category) || "#007bff";

      return (
        <div
          className="agenda-event-container"
          style={{ "--category-color": categoryColor } as React.CSSProperties}
        >
          <span
            className="agenda-category-chip"
            style={{ backgroundColor: categoryColor }}
          >
            {event.originalEvent.category}
          </span>
          <div className="agenda-event-title">{event.title}</div>
          {event.location && (
            <div className="agenda-event-location">📍 {event.location}</div>
          )}
        </div>
      );
    };

    const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

    if (isMobile) {
      return {
        agenda: {
          event: AgendaEvent,
        },
      };
    }

    // Desktop components with custom toolbar
    return {
      toolbar: CustomToolbar,
    };
  }, [categoryColorMap]);

  if (!events) {
    return <Loader />;
  }

  return (
    <div className={styles.calendarContainer}>
      {/* Category Filters */}
      {availableCategories.length > 0 && (
        <div className={styles.categoryFilters}>
          <h3 className={styles.filterTitle}>Filter by Category</h3>
          <div className={styles.filterChips}>
            {categoryFilters.map(({ category, enabled, color }) => (
              <button
                key={category}
                className={`${styles.categoryChip} ${
                  enabled ? styles.enabled : styles.disabled
                }`}
                onClick={() => toggleCategory(category)}
                style={
                  {
                    "--category-color": color,
                    "--category-dark-color": getDarkerColor(color),
                  } as React.CSSProperties
                }
              >
                <span className={styles.chipIndicator}></span>
                <span className={styles.chipLabel}>{category}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Date Navigation Header */}
      {typeof window !== "undefined" && window.innerWidth <= 768 && (
        <div className={styles.mobileDateHeader}>
          <button
            className={styles.dateNavButton}
            onClick={navigateToPreviousDay}
            aria-label="Previous day"
          >
            <ChevronLeftIcon width={24} height={24} />
          </button>
          <h2 className={styles.dateHeaderTitle}>
            {formatMobileDateHeader(currentMobileDate)}
          </h2>
          <button
            className={styles.dateNavButton}
            onClick={navigateToNextDay}
            aria-label="Next day"
          >
            <ChevronRightIcon width={24} height={24} />
          </button>
        </div>
      )}

      {/* Custom Mobile Agenda View */}
      {typeof window !== "undefined" && window.innerWidth <= 768 ? (
        <div className={styles.mobileAgenda}>
          {Object.keys(groupedEventsByTime).length === 0 ? (
            <div className={styles.noEventsMessage}>
              <p>No events scheduled for this day.</p>
            </div>
          ) : (
            Object.entries(groupedEventsByTime).map(([timeKey, events]) => (
              <div key={timeKey} className={styles.agendaTimeGroup}>
                <div className={styles.agendaTimeColumn}>
                  <span className={styles.agendaTime}>{timeKey}</span>
                </div>
                <div className={styles.agendaEventsColumn}>
                  {events.map((event) => {
                    const categoryColor =
                      categoryColorMap.get(event.originalEvent.category) ||
                      "#007bff";
                    return (
                      <button
                        key={event.id}
                        className={styles.agendaEventChip}
                        style={
                          {
                            "--category-color": categoryColor,
                          } as React.CSSProperties
                        }
                        onClick={() => handleSelectEvent(event)}
                        type="button"
                      >
                        <span
                          className={styles.agendaChipCategory}
                          style={{ backgroundColor: categoryColor }}
                        >
                          {event.originalEvent.category}
                        </span>
                        <div className={styles.agendaChipContent}>
                          <div className={styles.agendaChipTitle}>
                            {event.title}
                          </div>
                          {event.location && (
                            <div className={styles.agendaChipLocation}>
                              📍 {event.location}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          titleAccessor="title"
          style={{
            height: calendarHeight,
            minHeight: calendarHeight - 100,
          }}
          onSelectEvent={handleSelectEvent}
          onShowMore={handleShowMore}
          eventPropGetter={eventStyleGetter}
          views={calendarViews}
          defaultView={defaultView}
          components={calendarComponents}
          date={
            typeof window !== "undefined" && window.innerWidth <= 768
              ? currentMobileDate
              : undefined
          }
          onNavigate={(date) => {
            if (typeof window !== "undefined" && window.innerWidth <= 768) {
              setCurrentMobileDate(date);
            }
          }}
          toolbar={
            typeof window !== "undefined" && window.innerWidth <= 768
              ? false
              : true
          }
          tooltipAccessor={(event: CalendarEvent) =>
            `${event.title}${event.location ? ` - ${event.location}` : ""}`
          }
        />
      )}

      {/* Event Details Slideout */}
      {slideoutOpen && (selectedEvent || dayEvents.length > 0) && (
        <>
          {/* Backdrop */}
          <div
            className={styles.slideoutBackdrop}
            onClick={closeSlideout}
            onKeyDown={(e) => e.key === "Escape" && closeSlideout()}
            role="button"
            tabIndex={0}
            aria-label="Close event details"
          />

          {/* Slideout Panel */}
          <div className={styles.slideoutPanel}>
            <div className={styles.slideoutHeader}>
              <h2 className={styles.slideoutTitle}>
                {selectedEvent
                  ? selectedEvent.title
                  : selectedDate
                  ? `Events for ${selectedDate.toLocaleDateString()}`
                  : "Event Details"}
              </h2>
              <button
                className={`${styles.closeButton} close-slideout-btn`}
                onClick={closeSlideout}
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
                        backgroundColor:
                          categoryColorMap.get(
                            selectedEvent.originalEvent.category
                          ) || "#007bff",
                      }}
                    >
                      {selectedEvent.originalEvent.category}
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
                            backgroundColor:
                              categoryColorMap.get(
                                event.originalEvent.category
                              ) || "#007bff",
                          }}
                        />
                        <h4 className={styles.eventCardTitle}>{event.title}</h4>
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
                              backgroundColor:
                                categoryColorMap.get(
                                  event.originalEvent.category
                                ) || "#007bff",
                            }}
                          >
                            {event.originalEvent.category}
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
                              setSelectedEvent(event);
                              setDayEvents([]);
                              setSelectedDate(null);
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
              <button
                className={styles.secondaryButton}
                onClick={closeSlideout}
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
