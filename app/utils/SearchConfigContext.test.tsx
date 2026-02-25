import React from "react";
import { render, act } from "@testing-library/react";
import { SearchConfigProvider, useSearchConfig } from "./SearchConfigContext";

// Mock react-instantsearch-core's Configure to capture props
const capturedConfigs: Record<string, any>[] = [];
jest.mock("react-instantsearch-core", () => ({
  Configure: (props: any) => {
    capturedConfigs.push(props);
    return null;
  },
}));

/**
 * Test harness that exposes updateConfig and currentConfig via refs
 * so tests can drive state changes and inspect results.
 */
const ConfigInspector = ({
  onMount,
}: {
  onMount: (api: ReturnType<typeof useSearchConfig>) => void;
}) => {
  const api = useSearchConfig();
  const mounted = React.useRef(false);
  if (!mounted.current) {
    mounted.current = true;
    onMount(api);
  }
  return null;
};

describe("SearchConfigContext", () => {
  let updateConfig: ReturnType<typeof useSearchConfig>["updateConfig"];

  beforeEach(() => {
    capturedConfigs.length = 0;
  });

  function renderWithConfig(initialConfig: Record<string, any> = {}) {
    render(
      <SearchConfigProvider initialConfig={initialConfig}>
        <ConfigInspector
          onMount={(api) => {
            updateConfig = api.updateConfig;
          }}
        />
      </SearchConfigProvider>
    );
  }

  it("merges geo-only updates without overwriting existing filters", () => {
    // Start with a category filter (simulates BrowseResultsPage initial config)
    renderWithConfig({
      filters: "categories:'Housing'",
      hitsPerPage: 40,
    });

    // Simulate FilterHeader applying an eligibility filter
    act(() => {
      updateConfig({
        filters: "categories:'Housing' && eligibilities:`LGBTQ+`",
      });
    });

    // Simulate the geo useEffect firing (e.g. due to radius change)
    // This should NOT include filters — the fix removes it
    act(() => {
      updateConfig({
        hitsPerPage: 40,
        aroundLatLng: "37.7749,-122.4194",
        aroundRadius: 1609,
        aroundPrecision: 100,
        minimumAroundRadius: 100,
      });
    });

    // The last Configure render should still have the eligibility filter
    const lastConfig = capturedConfigs[capturedConfigs.length - 1];
    expect(lastConfig.filters).toBe(
      "categories:'Housing' && eligibilities:`LGBTQ+`"
    );
    expect(lastConfig.aroundLatLng).toBe("37.7749,-122.4194");
    expect(lastConfig.aroundRadius).toBe(1609);
  });

  it("allows filters to be explicitly updated", () => {
    renderWithConfig({
      filters: "categories:'Housing'",
      hitsPerPage: 40,
    });

    // Apply eligibility
    act(() => {
      updateConfig({
        filters: "categories:'Housing' && eligibilities:`Youth`",
      });
    });

    const lastConfig = capturedConfigs[capturedConfigs.length - 1];
    expect(lastConfig.filters).toBe(
      "categories:'Housing' && eligibilities:`Youth`"
    );
  });

  it("clears filters when explicitly set to empty string", () => {
    renderWithConfig({
      filters: "categories:'Housing' && eligibilities:`LGBTQ+`",
      hitsPerPage: 40,
    });

    // Simulate clearing filters (e.g. handleClear)
    act(() => {
      updateConfig({ filters: "categories:'Housing'" });
    });

    const lastConfig = capturedConfigs[capturedConfigs.length - 1];
    expect(lastConfig.filters).toBe("categories:'Housing'");
  });

  it("preserves filters through multiple geo updates", () => {
    renderWithConfig({
      filters: "categories:'Food'",
      hitsPerPage: 40,
    });

    // Apply eligibility
    act(() => {
      updateConfig({
        filters: "categories:'Food' && eligibilities:`Seniors`",
      });
    });

    // Multiple geo updates (simulating map interactions)
    act(() => {
      updateConfig({
        aroundLatLng: "37.78,-122.41",
        aroundRadius: 805,
      });
    });

    act(() => {
      updateConfig({
        insideBoundingBox: [[37.8, -122.5, 37.7, -122.3]],
        aroundLatLng: undefined,
        aroundRadius: undefined,
      });
    });

    const lastConfig = capturedConfigs[capturedConfigs.length - 1];
    expect(lastConfig.filters).toBe(
      "categories:'Food' && eligibilities:`Seniors`"
    );
  });
});
