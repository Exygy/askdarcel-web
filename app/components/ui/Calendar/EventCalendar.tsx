import React, { useMemo, useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import { useAllSFGovEvents } from "hooks/SFGovAPI";
import { Loader } from "../Loader";
import { CategoryFilters } from "./components/CategoryFilters";
import { MobileAgenda } from "./components/MobileAgenda";
import { EventSlideout } from "./components/EventSlideout";
import { CustomToolbar } from "./components/CustomToolbar";
import { EventCalendarProps, CalendarEvent } from "./types";
import { useEventProcessing, useEventTransformation } from "./hooks";
import {
  getDarkerColor,
  getCategoryColor,
  formatMobileDateHeader,
} from "./utils";
import { CATEGORY_COLORS } from "./constants";
import styles from "./EventCalendar.module.scss";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Setup the localizer
const localizer = momentLocalizer(moment);

export const EventCalendar: React.FC<EventCalendarProps> = ({
  onEventSelect,
}) => {
  const { data: events, isLoading: eventsAreLoading } = useAllSFGovEvents();

  const [slideoutOpen, setSlideoutOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [dayEvents, setDayEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // State for mobile agenda navigation
  const [currentMobileDate, setCurrentMobileDate] = useState<Date>(new Date());

  // Process events and categories
  const {
    availableCategories,
    categoryFilters,
    enabledCategories,
    categoryColorMap,
    toggleCategory,
  } = useEventProcessing(events);

  // Transform events for calendar
  const calendarEvents = useEventTransformation(
    events,
    categoryFilters,
    enabledCategories,
    currentMobileDate
  );

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

    // Call parent callback if provided
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

  const handleSlideoutEventSelect = (event: CalendarEvent) => {
    // When viewing an event from the day events list, show its details
    setSelectedEvent(event);
    setDayEvents([]);
    setSelectedDate(null);
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    // Get category color with improved fallback
    let categoryColor = categoryColorMap.get(event.originalEvent.category);

    // If color not found in map, calculate it directly to prevent blue flash
    if (!categoryColor && event.originalEvent.category) {
      const categories = Array.from(
        new Set(events?.map((e) => e.category).filter(Boolean) || [])
      ).sort();
      const categoryIndex = categories.indexOf(event.originalEvent.category);
      categoryColor =
        categoryIndex >= 0
          ? getCategoryColor(categoryIndex)
          : CATEGORY_COLORS[0];
    } else if (!categoryColor) {
      // Final fallback - use first color from palette instead of blue
      categoryColor = CATEGORY_COLORS[0];
    }

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

  // Loading states
  if (!events || eventsAreLoading) {
    return <Loader />;
  }

  // Show loader if category colors aren't ready to prevent blue flash
  if (
    events &&
    availableCategories.length > 0 &&
    categoryFilters.length === 0
  ) {
    return <Loader />;
  }

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  return (
    <div className={styles.calendarContainer}>
      <CategoryFilters
        availableCategories={availableCategories}
        categoryFilters={categoryFilters}
        onToggleCategory={toggleCategory}
      />

      {isMobile ? (
        <MobileAgenda
          currentDate={currentMobileDate}
          groupedEvents={groupedEventsByTime}
          onNavigatePrevious={navigateToPreviousDay}
          onNavigateNext={navigateToNextDay}
          onEventSelect={handleSelectEvent}
          formatDateHeader={formatMobileDateHeader}
        />
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
          components={{
            toolbar: CustomToolbar,
          }}
          tooltipAccessor={(event: CalendarEvent) =>
            `${event.title} - ${event.originalEvent.category}`
          }
        />
      )}

      {/* Event Details Slideout */}
      <EventSlideout
        isOpen={slideoutOpen}
        onClose={closeSlideout}
        selectedEvent={selectedEvent}
        dayEvents={dayEvents}
        selectedDate={selectedDate}
        categoryColorMap={categoryColorMap}
        onEventSelect={handleSlideoutEventSelect}
      />
    </div>
  );
};
