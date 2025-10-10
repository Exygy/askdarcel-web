import React, { useMemo, useState } from "react";
import { useAllSFGovEvents } from "hooks/SFGovAPI";
import { Loader } from "../Loader";
import { CategoryFilters } from "./components/CategoryFilters";
import { MobileAgenda } from "./components/MobileAgenda";
import { EventSlideout } from "./components/EventSlideout";
import { EventCalendarProps, CalendarEvent } from "./types";
import { useEventProcessing, useEventTransformation } from "./hooks";
import { formatMobileDateHeader } from "./utils";
import styles from "./EventCalendar.module.scss";

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

  const goToToday = () => {
    setCurrentMobileDate(new Date());
  };

  // Group events by start time for agenda view (used for both mobile and desktop)
  const groupedEventsByTime = useMemo(() => {
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

  return (
    <div className={styles.calendarContainer}>
      <CategoryFilters
        availableCategories={availableCategories}
        categoryFilters={categoryFilters}
        onToggleCategory={toggleCategory}
      />

      <MobileAgenda
        currentDate={currentMobileDate}
        groupedEvents={groupedEventsByTime}
        onNavigatePrevious={navigateToPreviousDay}
        onNavigateNext={navigateToNextDay}
        onGoToToday={goToToday}
        onEventSelect={handleSelectEvent}
        formatDateHeader={formatMobileDateHeader}
      />

      {/* Event Details Slideout */}
      <EventSlideout
        isOpen={slideoutOpen}
        onClose={closeSlideout}
        selectedEvent={selectedEvent}
        dayEvents={dayEvents}
        selectedDate={selectedDate}
        onEventSelect={handleSlideoutEventSelect}
      />
    </div>
  );
};
