import DOMPurify from "dompurify";
import { SFGovEvent } from "hooks/SFGovAPI";
import { CATEGORY_COLORS, DAY_MAP } from "./constants";

// Utility function to safely sanitize HTML content
export const sanitizeHtml = (html: string): string => {
  if (!html) return html;

  // Configure DOMPurify to allow only safe HTML elements and attributes
  const cleanHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "span", "div", "a"],
    ALLOWED_ATTR: ["href", "target", "rel"],
    ALLOWED_URI_REGEXP: /^https?:\/\//, // Only allow http/https links
  });

  return cleanHtml;
};

// Function to get color for a category
export const getCategoryColor = (index: number): string => {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
};

// Function to get darker version of color for text/borders
export const getDarkerColor = (color: string): string => {
  // Simple function to darken hex colors
  const hex = color.replace("#", "");
  const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - 40);
  const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - 40);
  const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - 40);
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

// Helper function to create category color mapping synchronously
export const createCategoryColorMap = (
  events: SFGovEvent[] | null
): Map<string, string> => {
  const colorMap = new Map<string, string>();

  if (!events) return colorMap;

  const uniqueCategories = Array.from(
    new Set(events.map((event) => event.category).filter(Boolean))
  ).sort();

  uniqueCategories.forEach((category, index) => {
    colorMap.set(category, getCategoryColor(index));
  });

  return colorMap;
};

// Helper function to parse days_of_week string and check if a date matches
export const shouldEventOccurOnDay = (
  daysOfWeek: string | undefined,
  date: Date
): boolean => {
  if (!daysOfWeek || daysOfWeek.trim() === "") {
    // No days specified, assume every day
    return true;
  }

  const dayOfWeek = date.getDay();

  // Handle range format like "M-F" (Monday through Friday)
  if (daysOfWeek.includes("-")) {
    const [start, end] = daysOfWeek.split("-");
    const startDay = DAY_MAP[start.trim()];
    const endDay = DAY_MAP[end.trim()];

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
  return days.some((day) => DAY_MAP[day] === dayOfWeek);
};

// Utility function to ensure HTTPS protocol
export const ensureHttpsProtocol = (url: string): string => {
  if (!url) return "";
  if (url.startsWith("http://")) {
    return url.replace("http://", "https://");
  }
  if (!url.startsWith("https://") && !url.startsWith("http://")) {
    return `https://${url}`;
  }
  return url;
};

// Helper function to format mobile date header
export const formatMobileDateHeader = (date: Date): string => {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

// Helper function to extract unique categories from events
export const extractUniqueCategories = (
  events: SFGovEvent[] | null
): string[] => {
  if (!events) return [];

  const uniqueCategories = Array.from(
    new Set(events.map((event) => event.category).filter(Boolean))
  ).sort();

  return uniqueCategories;
};
