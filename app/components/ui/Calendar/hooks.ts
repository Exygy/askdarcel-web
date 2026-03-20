import { useMemo, useState } from "react";
import { SFGovEvent } from "hooks/SFGovAPI";
import { haversineDistanceMeters } from "utils/location";
import { CalendarEvent, DistanceFilter } from "./types";
import {
  extractUniqueCategories,
  shouldEventOccurOnDay,
  ensureHttpsProtocol,
} from "./utils";

export const useEventProcessing = (events: SFGovEvent[] | null) => {
  const availableCategories = useMemo(
    () => extractUniqueCategories(events),
    [events]
  );

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return {
    availableCategories,
    selectedCategory,
    setSelectedCategory,
  };
};

export const useEventTransformation = (
  events: SFGovEvent[] | null,
  selectedCategory: string | null,
  distanceFilter: DistanceFilter | null,
  currentMobileDate: Date
) => {
  const calendarEvents = useMemo(() => {
    if (!events) return [];

    const transformedEvents: CalendarEvent[] = [];

    events
      .filter((event) => {
        if (!event.event_start_date) return false;

        if (selectedCategory && event.events_category !== selectedCategory) {
          return false;
        }

        if (distanceFilter) {
          const lat = parseFloat(event.latitude);
          const lng = parseFloat(event.longitude);
          if (isNaN(lat) || isNaN(lng)) {
            return false;
          }
          const dist = haversineDistanceMeters(
            distanceFilter.coords.lat,
            distanceFilter.coords.lng,
            lat,
            lng
          );
          if (dist > distanceFilter.radiusMeters) return false;
        }

        return true;
      })
      .forEach((event) => {
        const startDateOnly = new Date(event.event_start_date);
        const endDateOnly = event.event_end_date
          ? new Date(event.event_end_date)
          : new Date(event.event_start_date);

        const isRecurringEvent =
          event.event_end_date &&
          event.start_time &&
          event.end_time &&
          startDateOnly.toDateString() !== endDateOnly.toDateString();

        if (isRecurringEvent) {
          const currentDate = new Date(startDateOnly);

          while (currentDate <= endDateOnly) {
            if (shouldEventOccurOnDay(event.days_of_week, currentDate)) {
              const [startHours, startMinutes, startSeconds = 0] =
                event.start_time.split(":").map(Number);
              const [endHours, endMinutes, endSeconds = 0] = event.end_time
                .split(":")
                .map(Number);

              const dayStartDate = new Date(currentDate);
              dayStartDate.setHours(startHours, startMinutes, startSeconds);

              const dayEndDate = new Date(currentDate);
              dayEndDate.setHours(endHours, endMinutes, endSeconds);

              transformedEvents.push({
                id: `${event.id}-${currentDate.toISOString().split("T")[0]}`,
                title: event.event_name,
                start: dayStartDate,
                end: dayEndDate,
                pageLink: ensureHttpsProtocol(event.more_info || ""),
                description: event.event_description || "",
                location: event.site_location_name || "",
                allDay: false,
                originalEvent: event,
              });
            }

            currentDate.setDate(currentDate.getDate() + 1);
          }
        } else {
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
              endDate = new Date(startDate);
              endDate.setHours(endDate.getHours() + 1);
            } else {
              endDate.setHours(23, 59, 59, 999);
            }
          } else {
            endDate = new Date(startDate);
            if (event.start_time && !event.end_time) {
              endDate.setHours(endDate.getHours() + 1);
            } else if (isAllDayEvent) {
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

    const currentDateStr = currentMobileDate.toDateString();
    return transformedEvents.filter((event) => {
      return event.start && event.start.toDateString() === currentDateStr;
    });
  }, [events, selectedCategory, distanceFilter, currentMobileDate]);

  return calendarEvents;
};
