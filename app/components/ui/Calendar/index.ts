// Main component
export { EventCalendar } from "./EventCalendar";

// Sub-components
export { CategoryFilters } from "./components/CategoryFilters";
export { MobileAgenda } from "./components/MobileAgenda";
export { EventSlideout } from "./components/EventSlideout";
export { CustomToolbar } from "./components/CustomToolbar";

// Types
export type {
  CalendarEvent,
  EventCalendarProps,
  CategoryFilter,
  CategoryFiltersProps,
  MobileAgendaProps,
  EventSlideoutProps,
} from "./types";

// Utilities
export {
  sanitizeHtml,
  getCategoryColor,
  getDarkerColor,
  createCategoryColorMap,
  shouldEventOccurOnDay,
  ensureHttpsProtocol,
  formatMobileDateHeader,
  extractUniqueCategories,
} from "./utils";

// Constants
export { CATEGORY_COLORS, DAY_MAP } from "./constants";

// Hooks
export { useEventProcessing, useEventTransformation } from "./hooks";
