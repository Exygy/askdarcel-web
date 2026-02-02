import { useState, useCallback, useMemo } from "react";

export type HoursSelection = "any" | "openNow" | "openLate";

export interface FilterState {
  hoursSelection: HoursSelection;
  locationSearchText: string;
  locationCoords: { lat: number; lng: number } | null;
  distanceRadius: number | "all";
  selectedEligibilities: Set<string>;
}

const DEFAULT_STATE: FilterState = {
  hoursSelection: "any",
  locationSearchText: "",
  locationCoords: null,
  distanceRadius: "all",
  selectedEligibilities: new Set(),
};

function cloneState(state: FilterState): FilterState {
  return {
    ...state,
    selectedEligibilities: new Set(state.selectedEligibilities),
  };
}

function countChanges(state: FilterState): number {
  let count = 0;
  if (state.hoursSelection !== "any") count += 1;
  if (state.locationCoords !== null) count += 1;
  if (state.distanceRadius !== "all") count += 1;
  count += state.selectedEligibilities.size;
  return count;
}

export function useFilterState() {
  const [pending, setPending] = useState<FilterState>(cloneState(DEFAULT_STATE));
  const [applied, setApplied] = useState<FilterState>(cloneState(DEFAULT_STATE));

  const setPendingHours = useCallback((value: HoursSelection) => {
    setPending((prev) => ({ ...prev, hoursSelection: value }));
  }, []);

  const setPendingDistance = useCallback((value: number | "all") => {
    setPending((prev) => ({ ...prev, distanceRadius: value }));
  }, []);

  const setPendingLocation = useCallback(
    (text: string, coords: { lat: number; lng: number } | null) => {
      setPending((prev) => ({
        ...prev,
        locationSearchText: text,
        locationCoords: coords,
      }));
    },
    []
  );

  const togglePendingEligibility = useCallback((value: string) => {
    setPending((prev) => {
      const next = new Set(prev.selectedEligibilities);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return { ...prev, selectedEligibilities: next };
    });
  }, []);

  const applyFilters = useCallback(() => {
    setApplied(cloneState(pending));
  }, [pending]);

  const clearFilters = useCallback(() => {
    setPending(cloneState(DEFAULT_STATE));
    setApplied(cloneState(DEFAULT_STATE));
  }, []);

  const pendingChangeCount = useMemo(() => countChanges(pending), [pending]);

  return {
    pending,
    applied,
    setPendingHours,
    setPendingDistance,
    setPendingLocation,
    togglePendingEligibility,
    applyFilters,
    clearFilters,
    pendingChangeCount,
  };
}
