import React, { useMemo } from "react";
import { Calendar, momentLocalizer, Event, Views } from "react-big-calendar";
import moment from "moment";
import { SFGovEvent } from "hooks/SFGovAPI";
import { Loader } from "../Loader";
import styles from "./EventCalendar.module.scss";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Setup the localizer for Big Calendar
const localizer = momentLocalizer(moment);

interface CalendarEvent extends Event {
  id: string;
  pageLink: string;
  description: string;
  location?: string;
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

    const transformedEvents = events
      .filter((event) => {
        // Filter out events without start date
        return event.event_start_date;
      })
      .map((event): CalendarEvent => {
        // Parse start date and time
        const startDate = new Date(event.event_start_date);
        if (event.start_time) {
          const [hours, minutes, seconds] = event.start_time
            .split(":")
            .map(Number);
          startDate.setHours(hours, minutes, seconds || 0);
        }

        // Parse end date and time
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

        return {
          id: event.id,
          title: event.event_name,
          start: startDate,
          end: endDate,
          pageLink: event.more_info || "",
          description: event.event_description || "",
          location: event.site_location_name || "",
          allDay: isAllDayEvent,
        };
      });

    return transformedEvents;
  }, [events]);

  const handleSelectEvent = (event: CalendarEvent) => {
    if (onEventSelect) {
      onEventSelect(event);
    } else if (event.pageLink) {
      console.log({ event });
      // Default behavior: navigate to the page_link
      //   window.open(event.pageLink, "_blank", "noopener noreferrer");
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
