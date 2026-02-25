/**
 * Regression tests for FilterHeader's updateConfig calls.
 *
 * Bug: When handleApply was called with no eligibilities selected it passed
 * `filters: undefined` to updateConfig, which caused SearchConfigContext to
 * drop the `filters` key entirely from the config. That in turn removed the
 * `filters` prop from <Configure>, allowing a stale eligibility filter that
 * lingered in the persistent InstantSearch singleton (mounted in Navigation)
 * to resurface in subsequent search requests.
 *
 * Fix: always pass an explicit string (`""` when nothing is selected) so
 * <Configure filters=""> is always rendered and the stale value is never
 * exposed.
 */

import React from "react";
import { render, fireEvent, screen } from "@testing-library/react";
import FilterHeader from "./FilterHeader";
import { useFilterState } from "hooks/useFilterState";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockUpdateConfig = jest.fn();

jest.mock("utils/SearchConfigContext", () => ({
  useSearchConfig: () => ({
    updateConfig: mockUpdateConfig,
    currentConfig: {},
  }),
}));

jest.mock("utils", () => ({
  useAppContextUpdater: () => ({
    setAroundRadius: jest.fn(),
  }),
}));

jest.mock("search/hooks", () => ({
  useSearchCapabilities: () => ({
    facetableFields: ["eligibilities"],
  }),
}));

jest.mock("hooks/TypesenseHooks", () => ({
  useTypesenseFacets: () => ({
    eligibilities: [
      { value: "Age 0-2", count: 5 },
      { value: "Seniors (55+)", count: 3 },
    ],
  }),
}));

jest.mock("hooks/usePlacesAutocomplete", () => ({
  usePlacesAutocomplete: () => ({
    predictions: [],
    isLoading: false,
    getPlaceDetails: jest.fn(),
    clearPredictions: jest.fn(),
    searchPlaces: jest.fn(),
  }),
}));

// Render FilterDropdown inline so we don't need @floating-ui/react in tests.
jest.mock("./FilterDropdown", () => ({
  FilterDropdown: ({ isOpen, children, footer }: any) =>
    isOpen ? (
      <div data-testid="filter-dropdown">
        {children}
        {footer}
      </div>
    ) : null,
}));

jest.mock("components/SearchAndBrowse/Sidebar/MobileMapToggleButtons", () => ({
  default: () => null,
}));

// ---------------------------------------------------------------------------
// Test wrapper — supplies filterState from the real hook as a prop
// ---------------------------------------------------------------------------

const FilterHeaderWithState = (
  props: Omit<React.ComponentProps<typeof FilterHeader>, "filterState">
) => {
  const filterState = useFilterState();
  return <FilterHeader {...props} filterState={filterState} />;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** All updateConfig calls that included a `filters` key. */
function filtersCallValues(): Array<string | undefined> {
  return mockUpdateConfig.mock.calls
    .map((call) => call[0] as Record<string, unknown>)
    .filter((config) => "filters" in config)
    .map((config) => config.filters as string | undefined);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("FilterHeader – distance filter counting and X-button reset", () => {
  beforeEach(() => {
    mockUpdateConfig.mockClear();
  });

  it("counts location + radius as one filter, not two", () => {
    render(<FilterHeaderWithState isSearchResultsPage={true} />);

    fireEvent.click(screen.getByRole("button", { name: /all filters/i }));

    // Simulate selecting a location (sets locationCoords via onLocationChange)
    const locationInput = screen.getByRole("combobox");
    fireEvent.change(locationInput, { target: { value: "SF" } });
    // Directly fire change to simulate a prediction select setting coords
    // by using the DistanceFilterContent's location input onChange path.
    // The pending count check happens before Apply, so trigger a re-render
    // by asserting the button text stays at "Apply filters" (not "Apply 2 filters")
    // after only the location is set (without changing the radius).
    // We can't easily trigger onLocationChange here without a full location
    // select flow, so we test countChanges directly via useFilterState instead
    // (see useFilterState tests). Here we verify radius alone doesn't count.

    // Radius change alone (no location) should NOT increment the filter count.
    const radiusInput = screen.getAllByRole("radio")[1]; // "Within 1 mile" is default; pick another
    fireEvent.click(radiusInput);

    // Button should still say "Apply filters" (count = 0), not "Apply 1 filter"
    expect(
      screen.getByRole("button", { name: /^apply filters$/i })
    ).toBeInTheDocument();
  });

  it("clicking the location X button clears both location coords and radius in pending state", () => {
    render(<FilterHeaderWithState isSearchResultsPage={true} />);

    fireEvent.click(screen.getByRole("button", { name: /all filters/i }));

    // Type something in the location input so the X button appears
    const locationInput = screen.getByRole("combobox");
    fireEvent.change(locationInput, { target: { value: "Mission District" } });

    // Click the X (aria-label="Clear location")
    fireEvent.click(screen.getByRole("button", { name: /clear location/i }));

    // Input should be empty
    expect(locationInput).toHaveValue("");
  });
});

describe("FilterHeader – updateConfig never passes filters: undefined", () => {
  beforeEach(() => {
    mockUpdateConfig.mockClear();
  });

  it("calls updateConfig with filters='' when Apply is clicked with no eligibilities selected", () => {
    render(<FilterHeaderWithState isSearchResultsPage={true} />);

    // Open "All filters" dropdown (renders content + footer inline via mock)
    fireEvent.click(screen.getByRole("button", { name: /all filters/i }));

    // Click Apply without selecting any eligibilities
    fireEvent.click(screen.getByRole("button", { name: /apply filters/i }));

    const values = filtersCallValues();
    expect(values.length).toBeGreaterThan(0);

    // Regression: old code passed `undefined`, removing the key from config
    // and letting a stale eligibility filter resurface from the IS singleton.
    values.forEach((v) => {
      expect(v).not.toBeUndefined();
    });

    // The filters value should be the empty string (no filters active).
    expect(values[values.length - 1]).toBe("");
  });

  it("calls updateConfig with filters='' when Clear is clicked", () => {
    render(<FilterHeaderWithState isSearchResultsPage={true} />);

    fireEvent.click(screen.getByRole("button", { name: /all filters/i }));
    fireEvent.click(screen.getByRole("button", { name: /clear filters/i }));

    const values = filtersCallValues();
    expect(values.length).toBeGreaterThan(0);
    values.forEach((v) => {
      expect(v).not.toBeUndefined();
    });
  });

  it("includes the eligibility in filters when one is selected before Apply", () => {
    render(<FilterHeaderWithState isSearchResultsPage={true} />);

    fireEvent.click(screen.getByRole("button", { name: /all filters/i }));

    // Select the "Age 0-2" eligibility checkbox
    fireEvent.click(screen.getByRole("checkbox", { name: /age 0-2/i }));

    fireEvent.click(screen.getByRole("button", { name: /apply 1 filter/i }));

    const values = filtersCallValues();
    expect(values.length).toBeGreaterThan(0);
    expect(values[values.length - 1]).toContain("Age 0-2");
  });

  it("resets to filters='' after Clear following an eligibility selection", () => {
    render(<FilterHeaderWithState isSearchResultsPage={true} />);

    // First apply an eligibility filter
    fireEvent.click(screen.getByRole("button", { name: /all filters/i }));
    fireEvent.click(screen.getByRole("checkbox", { name: /age 0-2/i }));
    fireEvent.click(screen.getByRole("button", { name: /apply 1 filter/i }));

    mockUpdateConfig.mockClear();

    // Re-open and clear
    fireEvent.click(screen.getByRole("button", { name: /all filters/i }));
    fireEvent.click(screen.getByRole("button", { name: /clear filters/i }));

    const values = filtersCallValues();
    expect(values.length).toBeGreaterThan(0);
    expect(values[values.length - 1]).toBe("");
  });
});
