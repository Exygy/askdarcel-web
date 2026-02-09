import React, { useState, useRef, useCallback } from "react";
import { Button } from "components/ui/inline/Button/Button";
import { useAppContextUpdater } from "utils";
import MobileMapToggleButtons from "../Sidebar/MobileMapToggleButtons";
import { FilterDropdown } from "./FilterDropdown";
import { HoursFilterContent } from "./HoursFilterContent";
import { DistanceFilterContent } from "./DistanceFilterContent";
import { EligibilityFilterContent } from "./EligibilityFilterContent";
import { FilterFooter } from "./FilterFooter";
import { useFilterState } from "hooks/useFilterState";
import { useTypesenseFacets } from "hooks/TypesenseHooks";
import { useSearchConfig } from "utils/SearchConfigContext";
import { useSearchCapabilities } from "../../../search/hooks";
import { buildFilterString } from "utils/filterStringBuilder";
import styles from "./FilterHeader.module.scss";
import classNames from "classnames";

// Feature flag to enable/disable hours filter
// Set to false to hide the hours filter from both the standalone button and "All Filters" dropdown
const ENABLE_HOURS_FILTER = false;

interface FilterHeaderProps {
  isSearchResultsPage: boolean;
  pageFilter?: string;
  isMapCollapsed?: boolean;
  setIsMapCollapsed?: (_isMapCollapsed: boolean) => void;
  onLocationSelect?: (
    lat: number,
    lng: number,
    radius: number | "all"
  ) => void;
}

const FilterHeader = ({
  isSearchResultsPage,
  pageFilter,
  isMapCollapsed = false,
  setIsMapCollapsed,
  onLocationSelect,
}: FilterHeaderProps) => {
  const [activeFilterMenu, setActiveFilterMenu] = useState<string | null>(null);
  const distanceButtonRef = useRef<HTMLDivElement>(null);
  const hoursButtonRef = useRef<HTMLDivElement>(null);
  const allFiltersButtonRef = useRef<HTMLDivElement>(null);

  const { setAroundRadius } = useAppContextUpdater();
  const { facetableFields } = useSearchCapabilities();
  const { updateConfig } = useSearchConfig();
  const facets = useTypesenseFacets();
  const filterState = useFilterState();

  const canShowEligibilities = facetableFields.includes("eligibilities");
  const eligibilities = canShowEligibilities
    ? facets?.eligibilities ?? []
    : [];

  const closeMenu = useCallback(() => setActiveFilterMenu(null), []);

  const toggleFilterMenu = (menuName: string) => {
    setActiveFilterMenu(activeFilterMenu === menuName ? null : menuName);
  };

  // When the user selects a location, store it in pending state.
  // The map will pan when Apply is clicked.
  const handleLocationChange = useCallback(
    (text: string, coords: { lat: number; lng: number } | null) => {
      filterState.setPendingLocation(text, coords);
    },
    [filterState]
  );

  const handleApply = useCallback(() => {
    filterState.applyFilters();

    const filterString = buildFilterString({
      pageFilter,
      eligibilities: filterState.pending.selectedEligibilities,
    });

    if (filterString) {
      updateConfig({ filters: filterString });
    } else {
      updateConfig({ filters: pageFilter || undefined });
    }

    // Apply distance radius
    setAroundRadius(filterState.pending.distanceRadius);

    // Update map center and zoom based on location and radius
    if (filterState.pending.locationCoords && onLocationSelect) {
      onLocationSelect(
        filterState.pending.locationCoords.lat,
        filterState.pending.locationCoords.lng,
        filterState.pending.distanceRadius
      );
    }

    closeMenu();
  }, [
    filterState,
    pageFilter,
    updateConfig,
    setAroundRadius,
    onLocationSelect,
    closeMenu,
  ]);

  const handleClear = useCallback(() => {
    filterState.clearFilters();
    updateConfig({ filters: pageFilter || undefined });
    setAroundRadius("all");
  }, [filterState, pageFilter, updateConfig, setAroundRadius]);

  const makeFooter = useCallback(
    () => (
      <FilterFooter
        pendingCount={filterState.pendingChangeCount}
        onApply={handleApply}
        onClear={handleClear}
        onClose={closeMenu}
      />
    ),
    [filterState.pendingChangeCount, handleApply, handleClear, closeMenu]
  );

  return (
    <div className={classNames(styles.filterHeader, "no-print")}>
      {setIsMapCollapsed && (
        <div className={styles.mobileToggleContainer}>
          <MobileMapToggleButtons
            isMapCollapsed={isMapCollapsed}
            setIsMapCollapsed={setIsMapCollapsed}
          />
        </div>
      )}

      <div className={styles.filterButtons}>
        {/* Distance Filter */}
        <div className={styles.filterButtonWrapper} ref={distanceButtonRef}>
          <Button
            variant={
              activeFilterMenu === "distance" ? "primary" : "secondary"
            }
            onClick={() => toggleFilterMenu("distance")}
            iconName="chevron-down"
            iconVariant="after"
            size="base"
          >
            Distance
          </Button>
          <FilterDropdown
            isOpen={activeFilterMenu === "distance"}
            onClose={closeMenu}
            title="Distance"
            triggerRef={distanceButtonRef}
            footer={makeFooter()}
          >
            <DistanceFilterContent
              locationText={filterState.pending.locationSearchText}
              selectedRadius={filterState.pending.distanceRadius}
              onLocationChange={handleLocationChange}
              onRadiusChange={filterState.setPendingDistance}
            />
          </FilterDropdown>
        </div>

        {/* Hours Filter */}
        {ENABLE_HOURS_FILTER && (
          <div className={styles.filterButtonWrapper} ref={hoursButtonRef}>
            <Button
              variant={activeFilterMenu === "hours" ? "primary" : "secondary"}
              onClick={() => toggleFilterMenu("hours")}
              iconName="chevron-down"
              iconVariant="after"
              size="base"
            >
              Hours
            </Button>
            <FilterDropdown
              isOpen={activeFilterMenu === "hours"}
              onClose={closeMenu}
              title="Availability"
              triggerRef={hoursButtonRef}
              footer={makeFooter()}
            >
              <HoursFilterContent
                selected={filterState.pending.hoursSelection}
                onChange={filterState.setPendingHours}
              />
            </FilterDropdown>
          </div>
        )}

        {/* All Filters */}
        <div className={styles.filterButtonWrapper} ref={allFiltersButtonRef}>
          <Button
            variant={activeFilterMenu === "all" ? "primary" : "secondary"}
            onClick={() => toggleFilterMenu("all")}
            iconName="sliders"
            iconVariant="before"
            size="base"
          >
            All filters
          </Button>
          <FilterDropdown
            isOpen={activeFilterMenu === "all"}
            onClose={closeMenu}
            title="All Filters"
            triggerRef={allFiltersButtonRef}
            footer={makeFooter()}
          >
            {ENABLE_HOURS_FILTER && (
              <div className={styles.filterGroup}>
                <h4 className={styles.filterGroupTitle}>Availability</h4>
                <HoursFilterContent
                  selected={filterState.pending.hoursSelection}
                  onChange={filterState.setPendingHours}
                />
              </div>
            )}

            <div className={styles.filterGroup}>
              <h4 className={styles.filterGroupTitle}>Distance</h4>
              <DistanceFilterContent
                locationText={filterState.pending.locationSearchText}
                selectedRadius={filterState.pending.distanceRadius}
                onLocationChange={handleLocationChange}
                onRadiusChange={filterState.setPendingDistance}
              />
            </div>

            {eligibilities.length > 0 && (
              <div className={styles.filterGroup}>
                <h4 className={styles.filterGroupTitle}>
                  {isSearchResultsPage ? "Eligibilities" : "Age"}
                </h4>
                <EligibilityFilterContent
                  eligibilities={eligibilities}
                  selected={filterState.pending.selectedEligibilities}
                  onToggle={filterState.togglePendingEligibility}
                />
              </div>
            )}
          </FilterDropdown>
        </div>
      </div>
    </div>
  );
};

export default FilterHeader;
