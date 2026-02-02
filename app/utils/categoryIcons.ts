/**
 * Icon mappings for categories
 *
 * Maps category names (from Typesense data) to Font Awesome icons.
 * If a category is not in this mapping, the default icon will be used.
 */

export interface CategoryIcon {
  name: string;
  provider: string;
}

/**
 * Convert category name to URL slug
 * e.g., "Arts & Culture" -> "arts-culture"
 * e.g., "Youth Jobs, Training and Life Skills" -> "youth-jobs-training-and-life-skills"
 */
export const categoryToSlug = (categoryName: string): string => {
  return categoryName
    .toLowerCase()
    .replace(/[,&]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

// Default icon for categories not in the mapping
export const DEFAULT_CATEGORY_ICON: CategoryIcon = {
  name: "fa-circle-question",
  provider: "fa",
};

// Icon mapping for known categories
export const CATEGORY_ICON_MAP: { [key: string]: CategoryIcon } = {
  "Family Support": {
    name: "fa-people-roof",
    provider: "fa",
  },
  Education: {
    name: "fa-school",
    provider: "fa",
  },
  "Youth Jobs, Training and Life Skills": {
    name: "fa-briefcase",
    provider: "fa",
  },
  "Health & Wellness": {
    name: "fa-heart-pulse",
    provider: "fa",
  },
  "After School & Summer Programs": {
    name: "fa-sun",
    provider: "fa",
  },
  "Sports & Recreation": {
    name: "fa-running",
    provider: "fa",
  },
  Childcare: {
    name: "fa-baby",
    provider: "fa",
  },
  "Arts & Culture": {
    name: "fa-palette",
    provider: "fa",
  },
};

/**
 * Get the icon for a category name
 * Returns the mapped icon or the default icon if not found
 */
export const getCategoryIcon = (categoryName: string): CategoryIcon => {
  return CATEGORY_ICON_MAP[categoryName] || DEFAULT_CATEGORY_ICON;
};
