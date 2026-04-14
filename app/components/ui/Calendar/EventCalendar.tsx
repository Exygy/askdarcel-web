import React, { useMemo, useState } from "react";
import { useAllSFGovEvents } from "hooks/SFGovAPI";
import { Loader } from "../Loader";
import { EventFilterBar } from "./components/EventFilterBar";
import { MobileAgenda } from "./components/MobileAgenda";
import { EventSlideout } from "./components/EventSlideout";
import { EventCalendarProps, CalendarEvent, DistanceFilter } from "./types";
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
  const [currentMobileDate, setCurrentMobileDate] = useState<Date>(new Date());
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilter | null>(
    null
  );

  const { availableCategories, selectedCategory, setSelectedCategory } =
    useEventProcessing(events);

  const calendarEvents = useEventTransformation(
    events,
    selectedCategory,
    distanceFilter,
    currentMobileDate
  );

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

  const groupedEventsByTime = useMemo(() => {
    const groups: { [timeKey: string]: CalendarEvent[] } = {};

    calendarEvents.forEach((event) => {
      if (!event.start) return;

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

    const sortedGroups: { [timeKey: string]: CalendarEvent[] } = {};
    const timeKeys = Object.keys(groups).sort((a, b) => {
      if (a === "All Day") return -1;
      if (b === "All Day") return 1;

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
    setSelectedEvent(event);
    setDayEvents([]);
    setSelectedDate(null);
    setSlideoutOpen(true);

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
    setSelectedEvent(event);
    setDayEvents([]);
    setSelectedDate(null);
  };

  if (!events || eventsAreLoading) {
    return <Loader />;
  }

  return (
    <div className={styles.calendarContainer}>
      <EventFilterBar
        availableCategories={availableCategories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onDistanceFilterChange={setDistanceFilter}
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
