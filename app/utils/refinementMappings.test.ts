import {
  filterByMappingValues,
  normalizeRefinementLabels,
  deduplicateItemsByLabel,
} from "./refinementMappings";
import { RefinementListItem } from "instantsearch.js/es/connectors/refinement-list/connectRefinementList";

const mockMapping = {
  "Pacific Islander": ["API (Asian/Pacific Islander)", "Pacific Islander"],
  Toddler: ["Toddler Age", "Toddler"],
  "Transgender and Gender Non-Conforming": [
    "Transgender and Gender Non-Conforming",
  ],
  Uninsured: ["Uninsured"],
  "Multiple Values": ["First", "Second", "Third"],
};

describe("refinementMappings Helpers", () => {
  describe("filterByMappingValues", () => {
    it("should return all items", () => {
      const items: RefinementListItem[] = [
        {
          label: "API (Asian/Pacific Islander)",
          value: "1",
          count: 1,
          isRefined: false,
        },
        {
          label: "Toddler",
          value: "2",
          count: 1,
          isRefined: false,
        },
        {
          label: "Transgender and Gender Non-Conforming",
          value: "3",
          count: 1,
          isRefined: false,
        },
        { label: "Uninsured", value: "4", count: 1, isRefined: false },
      ];

      const filtered = filterByMappingValues(items, mockMapping);
      expect(filtered).toHaveLength(4);
      expect(filtered.map((item) => item.label)).toEqual(
        expect.arrayContaining([
          "API (Asian/Pacific Islander)",
          "Toddler",
          "Transgender and Gender Non-Conforming",
          "Uninsured",
        ])
      );
    });

    it("should return only items that exist in mockMapping", () => {
      const items: RefinementListItem[] = [
        {
          label: "Toddler Age",
          value: "1",
          count: 1,
          isRefined: false,
        },
        {
          label: "Random value",
          value: "2",
          count: 1,
          isRefined: false,
        },
        {
          label: "Pacific Islander",
          value: "3",
          count: 1,
          isRefined: false,
        },
        {
          label: "Another random value",
          value: "4",
          count: 1,
          isRefined: false,
        },
      ];

      const filtered = filterByMappingValues(items, mockMapping);
      expect(filtered).toHaveLength(2);
      expect(filtered.map((item) => item.label)).toEqual(
        expect.arrayContaining(["Toddler Age", "Pacific Islander"])
      );
    });

    it("should return multiple items in a value array", () => {
      const items: RefinementListItem[] = [
        {
          label: "First",
          value: "1",
          count: 1,
          isRefined: false,
        },
        {
          label: "Second",
          value: "2",
          count: 1,
          isRefined: false,
        },
        {
          label: "Third",
          value: "3",
          count: 1,
          isRefined: false,
        },
      ];

      const filtered = filterByMappingValues(items, mockMapping);
      expect(filtered).toHaveLength(3);
      expect(filtered.map((item) => item.label)).toEqual(
        expect.arrayContaining(["First", "Second", "Third"])
      );
    });
  });

  describe("normalizeRefinementLabels", () => {
    it("should transform item labels to the mapping key when a match is found", () => {
      const items: RefinementListItem[] = [
        {
          label: "API (Asian/Pacific Islander)",
          value: "1",
          count: 1,
          isRefined: false,
        },
        { label: "Toddler Age", value: "2", count: 1, isRefined: false },
        {
          label: "Transgender and Gender Non-Conforming",
          value: "3",
          count: 1,
          isRefined: false,
        },
        { label: "Random Value", value: "4", count: 1, isRefined: false },
      ];

      const transformed = normalizeRefinementLabels(items, mockMapping);
      expect(transformed).toHaveLength(4);

      expect(transformed[0].label).toBe("Pacific Islander");
      expect(transformed[1].label).toBe("Toddler");
      expect(transformed[2].label).toBe(
        "Transgender and Gender Non-Conforming"
      );
      expect(transformed[3].label).toBe("Random Value");
    });

    it("should transform multiple item labels per key as separate array items", () => {
      const items: RefinementListItem[] = [
        {
          label: "API (Asian/Pacific Islander)",
          value: "1",
          count: 1,
          isRefined: false,
        },
        { label: "Pacific Islander", value: "2", count: 1, isRefined: false },
        {
          label: "Toddler Age",
          value: "3",
          count: 1,
          isRefined: false,
        },
        { label: "Toddler", value: "4", count: 1, isRefined: false },
      ];

      const transformed = normalizeRefinementLabels(items, mockMapping);
      expect(transformed).toHaveLength(4);

      expect(transformed[0].label).toBe("Pacific Islander");
      expect(transformed[1].label).toBe("Pacific Islander");
      expect(transformed[2].label).toBe("Toddler");
      expect(transformed[3].label).toBe("Toddler");
    });
  });

  describe("deduplicateItemsByLabel", () => {
    it("should remove duplicate items based on the label", () => {
      const items: RefinementListItem[] = [
        { label: "Pacific Islander", value: "1", count: 1, isRefined: false },
        { label: "Pacific Islander", value: "2", count: 1, isRefined: false }, // Duplicate label
        { label: "Toddler", value: "3", count: 1, isRefined: false },
        { label: "Toddler", value: "4", count: 1, isRefined: false }, // Duplicate label
        {
          label: "Transgender and Gender Non-Conforming",
          value: "5",
          count: 1,
          isRefined: false,
        },
      ];

      const deduplicated = deduplicateItemsByLabel(items);
      expect(deduplicated).toHaveLength(3);
      expect(deduplicated.map((item) => item.label)).toEqual(
        expect.arrayContaining([
          "Pacific Islander",
          "Toddler",
          "Transgender and Gender Non-Conforming",
        ])
      );
    });

    it("should keep the first occurrence of duplicate items", () => {
      const items: RefinementListItem[] = [
        { label: "Pacific Islander", value: "1", count: 1, isRefined: false },
        { label: "Pacific Islander", value: "2", count: 1, isRefined: false },
      ];

      const deduplicated = deduplicateItemsByLabel(items);
      expect(deduplicated).toHaveLength(1);
      expect(deduplicated[0].value).toBe("1");
    });
  });
});
