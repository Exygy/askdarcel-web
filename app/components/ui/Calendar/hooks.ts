import { useMemo, useLayoutEffect, useState, useEffect } from "react";
import { SFGovEvent } from "hooks/SFGovAPI";
import { CalendarEvent, CategoryFilter } from "./types";
import {
  extractUniqueCategories,
  createCategoryColorMap,
  getCategoryColor,
  shouldEventOccurOnDay,
  ensureHttpsProtocol,
} from "./utils";

export const useEventProcessing = (events: SFGovEvent[] | null) => {
  // Extract unique categories from events
  const availableCategories = useMemo(
    () => extractUniqueCategories(events),
    [events]
  );

  // State for category filters - initialize empty to prevent flash
  const [categoryFilters, setCategoryFilters] = useState<CategoryFilter[]>([]);

  // Use useLayoutEffect to set category filters before paint to prevent flashing
  useLayoutEffect(() => {
    if (availableCategories.length > 0) {
      setCategoryFilters(
        availableCategories.map((category, index) => ({
          category,
          enabled: true,
          color: getCategoryColor(index),
        }))
      );
    }
  }, [availableCategories]);

  // Update category filters when available categories change
  useEffect(() => {
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

  // Get category color mapping - use pre-calculated mapping to prevent flashing
  const categoryColorMap = useMemo(() => {
    // First try to get from categoryFilters if available
    if (categoryFilters.length > 0) {
      const map = new Map<string, string>();
      categoryFilters.forEach((filter) => {
        map.set(filter.category, filter.color);
      });
      return map;
    }

    // Fallback to direct calculation to prevent blue flash
    return createCategoryColorMap(events);
  }, [categoryFilters, events]);

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

  return {
    availableCategories,
    categoryFilters,
    enabledCategories,
    categoryColorMap,
    toggleCategory,
  };
};

export const useEventTransformation = (
  events: SFGovEvent[] | null,
  categoryFilters: CategoryFilter[],
  enabledCategories: Set<string>,
  currentMobileDate: Date
) => {
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

  return calendarEvents;
};
