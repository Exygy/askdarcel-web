import { SFGovEvent } from "hooks/SFGovAPI";
import { ReactNode } from "react";

// Base event interface (replacing react-big-calendar's Event type)
export interface BaseEvent {
  title?: ReactNode;
  start?: Date;
  end?: Date;
  allDay?: boolean;
  resource?: unknown;
}

export interface CalendarEvent extends BaseEvent {
  id: string;
  pageLink: string;
  description: string;
  location?: string;
  originalEvent: SFGovEvent;
}

export interface EventCalendarProps {
  onEventSelect?: (event: CalendarEvent) => void;
}

export interface CategoryFilter {
  category: string;
  enabled: boolean;
  color: string;
}

export interface CategoryFiltersProps {
  availableCategories: string[];
  categoryFilters: CategoryFilter[];
  onToggleCategory: (category: string) => void;
}

export interface MobileAgendaProps {
  currentDate: Date;
  groupedEvents: { [timeKey: string]: CalendarEvent[] };
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
  onGoToToday: () => void;
  onEventSelect: (event: CalendarEvent) => void;
  formatDateHeader: (date: Date) => string;
}

export interface EventSlideoutProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEvent: CalendarEvent | null;
  dayEvents: CalendarEvent[];
  selectedDate: Date | null;
  onEventSelect: (event: CalendarEvent) => void;
}
