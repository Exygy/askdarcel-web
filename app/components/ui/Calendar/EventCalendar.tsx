import React, { useMemo } from "react";
import { Calendar, momentLocalizer, Event, Views } from "react-big-calendar";
import moment from "moment";
import { SFGovEvent } from "hooks/SFGovAPI";
import { Loader } from "../Loader";
import styles from "./EventCalendar.module.scss";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Setup the localizer for Big Calendar
const localizer = momentLocalizer(moment);

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

export const EventCalendar: React.FC<EventCalendarProps> = ({
  events,
  onEventSelect,
}) => {
  const calendarEvents = useMemo(() => {
    if (!events) return [];

    const transformedEvents: CalendarEvent[] = [];

    events
      .filter((event) => {
        // Filter out events without start date
        return event.event_start_date;
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
                pageLink: event.more_info || "",
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
            pageLink: event.more_info || "",
            description: event.event_description || "",
            location: event.site_location_name || "",
            allDay: isAllDayEvent,
            originalEvent: event,
          });
        }
      });

    return transformedEvents;
  }, [events]);

  const handleSelectEvent = (event: CalendarEvent) => {
    if (onEventSelect) {
      onEventSelect(event);
    } else if (event.pageLink) {
      console.log(event);
      // Default behavior: navigate to the page_link
      window.open(event.pageLink, "_blank", "noopener noreferrer");
    }
  };

  const eventStyleGetter = (event: CalendarEvent) => {
    return {
      style: {
        backgroundColor: "#007bff",
        borderRadius: "4px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
        cursor: "pointer",
      },
    };
  };

  if (!events) {
    return <Loader />;
  }

  return (
    <div className={styles.calendarContainer}>
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        style={{ height: 800 }}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        defaultView={Views.MONTH}
        popup
        tooltipAccessor={(event: CalendarEvent) =>
          `${event.title}${event.location ? ` - ${event.location}` : ""}`
        }
      />
    </div>
  );
};
