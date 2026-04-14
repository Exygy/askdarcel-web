import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import {
  usePlacesAutocomplete,
  PlacePrediction,
} from "hooks/usePlacesAutocomplete";
import { EventFilterBarProps, DistanceFilter } from "../types";
import calStyles from "../EventCalendar.module.scss";
import filterStyles from "../../../SearchAndBrowse/FilterHeader/FilterHeader.module.scss";

const RADIUS_OPTIONS = [
  { label: "Within 0.5 miles", value: 805 },
  { label: "Within 1 mile", value: 1609 },
  { label: "Within 2 miles", value: 3219 },
  { label: "Within 3 miles", value: 4828 },
];

export const EventFilterBar: React.FC<EventFilterBarProps> = ({
  availableCategories,
  selectedCategory,
  onCategoryChange,
  onDistanceFilterChange,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [pendingCoords, setPendingCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [pendingLocationText, setPendingLocationText] = useState("");
  const [pendingRadius, setPendingRadius] = useState<number | null>(null);
  const [pendingCategory, setPendingCategory] = useState<string | null>(
    selectedCategory
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    predictions,
    isLoading,
    getPlaceDetails,
    clearPredictions,
    searchPlaces,
  } = usePlacesAutocomplete({ debounceMs: 300, minLength: 2 });

  const updateDropdownPos = useCallback(() => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setHighlightedIndex(-1);

    if (value.length >= 2) {
      searchPlaces(value);
      setShowDropdown(true);
    } else {
      clearPredictions();
      setShowDropdown(false);
    }

    if (pendingCoords) {
      setPendingCoords(null);
      setPendingLocationText("");
    }
  };

  const handleSelectPlace = async (prediction: PlacePrediction) => {
    setInputValue(prediction.description);
    setShowDropdown(false);
    clearPredictions();

    const coords = await getPlaceDetails(prediction.placeId);
    if (coords) {
      setPendingCoords(coords);
      setPendingLocationText(prediction.description);
    }
  };

  const handleClearInput = () => {
    setInputValue("");
    setPendingCoords(null);
    setPendingLocationText("");
    clearPredictions();
    setShowDropdown(false);
    setHighlightedIndex(-1);
    // Clear immediately on explicit clear action
    onDistanceFilterChange(null);
    inputRef.current?.focus();
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? parseInt(e.target.value) : null;
    setPendingRadius(value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPendingCategory(e.target.value || null);
  };

  const handleSearchSubmit = () => {
    if (pendingCoords && pendingRadius) {
      const filter: DistanceFilter = {
        coords: pendingCoords,
        radiusMeters: pendingRadius,
        locationText: pendingLocationText,
      };
      onDistanceFilterChange(filter);
    } else {
      onDistanceFilterChange(null);
    }
    onCategoryChange(pendingCategory);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || predictions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < predictions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : predictions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < predictions.length) {
          handleSelectPlace(predictions[highlightedIndex]);
        } else if (predictions.length > 0) {
          handleSelectPlace(predictions[0]);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleSelectKeyDown = (e: React.KeyboardEvent<HTMLSelectElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      try {
        (
          e.currentTarget as HTMLSelectElement & { showPicker(): void }
        ).showPicker();
      } catch {
        // showPicker not supported — fall back to simulating a click
        e.currentTarget.click();
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const portalDropdown = document.getElementById(
        "calendar-places-autocomplete-list"
      );
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(target) &&
        (!portalDropdown || !portalDropdown.contains(target))
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (predictions.length > 0) {
      updateDropdownPos();
      setShowDropdown(true);
    }
  }, [predictions, updateDropdownPos]);

  useEffect(() => {
    if (!showDropdown) return;
    const handleReposition = () => updateDropdownPos();
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    return () => {
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [showDropdown, updateDropdownPos]);

  return (
    <div className={calStyles.filterBar}>
      <div className={calStyles.filterBarLeft}>
        <p className={calStyles.filterBarLabel}>Search by location</p>
        <div className={calStyles.filterBarRow}>
          {/* Location autocomplete input */}
          <div
            className={filterStyles.locationSearchWrapper}
            style={{ flex: 1, marginBottom: 0 }}
            ref={wrapperRef}
          >
            <input
              ref={inputRef}
              type="text"
              className={`${filterStyles.locationSearchInput} ${filterStyles.locationSearchInputNoIcon}`}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (predictions.length > 0) {
                  updateDropdownPos();
                  setShowDropdown(true);
                }
              }}
              autoComplete="off"
              role="combobox"
              aria-label="Search by location"
              aria-expanded={showDropdown}
              aria-autocomplete="list"
              aria-controls="calendar-places-autocomplete-list"
              aria-haspopup="listbox"
            />
            {inputValue && (
              <button
                type="button"
                className={`${filterStyles.locationClearButton} ${filterStyles.locationClearButtonNoIcon}`}
                onClick={handleClearInput}
                aria-label="Clear location"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M11 1L1 11M1 1L11 11"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}

            {showDropdown &&
              predictions.length > 0 &&
              dropdownPos &&
              ReactDOM.createPortal(
                <div
                  id="calendar-places-autocomplete-list"
                  className={filterStyles.autocompleteDropdown}
                  role="listbox"
                  aria-label="Location suggestions"
                  style={{
                    position: "fixed",
                    top: dropdownPos.top,
                    left: dropdownPos.left,
                    width: dropdownPos.width,
                  }}
                >
                  {predictions.map((prediction, index) => (
                    <div
                      key={prediction.placeId}
                      className={`${filterStyles.autocompleteItem} ${
                        index === highlightedIndex
                          ? filterStyles.autocompleteItemHighlighted
                          : ""
                      }`}
                      onClick={() => handleSelectPlace(prediction)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleSelectPlace(prediction);
                        }
                      }}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      role="option"
                      aria-selected={index === highlightedIndex}
                      tabIndex={0}
                    >
                      <span className={filterStyles.autocompleteMainText}>
                        {prediction.mainText}
                      </span>
                      {prediction.secondaryText && (
                        <span
                          className={filterStyles.autocompleteSecondaryText}
                        >
                          {prediction.secondaryText}
                        </span>
                      )}
                    </div>
                  ))}
                </div>,
                document.body
              )}

            {isLoading &&
              predictions.length === 0 &&
              dropdownPos &&
              ReactDOM.createPortal(
                <div
                  className={filterStyles.autocompleteDropdown}
                  style={{
                    position: "fixed",
                    top: dropdownPos.top,
                    left: dropdownPos.left,
                    width: dropdownPos.width,
                  }}
                >
                  <div className={filterStyles.autocompleteLoading}>
                    Searching...
                  </div>
                </div>,
                document.body
              )}
          </div>

          <div className={calStyles.filterSelectWrapper}>
            <select
              className={calStyles.pillSelect}
              value={pendingRadius ?? ""}
              onChange={handleRadiusChange}
              onKeyDown={handleSelectKeyDown}
              aria-label="Distance filter"
            >
              <option value="">Any distance</option>
              {RADIUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={calStyles.filterBarRight}>
        <p className={calStyles.filterBarLabel}>Filter by category</p>
        <div className={calStyles.filterBarRow}>
          <div
            className={`${calStyles.filterSelectWrapper} ${calStyles.filterSelectWithIcon}`}
          >
            <svg
              className={calStyles.filterSelectIcon}
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <rect
                x="1"
                y="2"
                width="14"
                height="13"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path d="M1 6h14" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M5 1v2M11 1v2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <select
              className={`${calStyles.pillSelect} ${calStyles.pillSelectIconPadding}`}
              value={pendingCategory ?? ""}
              onChange={handleCategoryChange}
              onKeyDown={handleSelectKeyDown}
              aria-label="Category filter"
            >
              <option value="">All event types</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={calStyles.filterBarSearch}>
        <button
          type="button"
          className={calStyles.filterSearchButton}
          onClick={handleSearchSubmit}
        >
          Search
        </button>
      </div>
    </div>
  );
};
