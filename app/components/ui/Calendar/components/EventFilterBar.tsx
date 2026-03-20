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
  const [locationCoords, setLocationCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationText, setLocationText] = useState("");
  const [selectedRadius, setSelectedRadius] = useState<number | null>(null);
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

  const applyFilter = useCallback(
    (
      coords: { lat: number; lng: number } | null,
      text: string,
      radius: number | null
    ) => {
      if (coords && radius) {
        const filter: DistanceFilter = {
          coords,
          radiusMeters: radius,
          locationText: text,
        };
        onDistanceFilterChange(filter);
      } else {
        onDistanceFilterChange(null);
      }
    },
    [onDistanceFilterChange]
  );

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

    if (locationCoords) {
      setLocationCoords(null);
      setLocationText("");
      onDistanceFilterChange(null);
    }
  };

  const handleSelectPlace = async (prediction: PlacePrediction) => {
    setInputValue(prediction.description);
    setShowDropdown(false);
    clearPredictions();

    const coords = await getPlaceDetails(prediction.placeId);
    if (coords) {
      setLocationCoords(coords);
      setLocationText(prediction.description);
      applyFilter(coords, prediction.description, selectedRadius);
    }
  };

  const handleClearInput = () => {
    setInputValue("");
    setLocationCoords(null);
    setLocationText("");
    clearPredictions();
    setShowDropdown(false);
    setHighlightedIndex(-1);
    onDistanceFilterChange(null);
    inputRef.current?.focus();
  };

  const handleSearchClick = () => {
    if (predictions.length > 0) {
      handleSelectPlace(predictions[0]);
    } else if (inputValue.length >= 2) {
      searchPlaces(inputValue);
      setShowDropdown(true);
    }
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? parseInt(e.target.value) : null;
    setSelectedRadius(value);
    applyFilter(locationCoords, locationText, value);
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
        <p className={calStyles.filterBarLabel}>Find an event near you</p>
        <div className={calStyles.filterBarRow}>
          {/* Location input — same structure as DistanceFilterContent */}
          <div
            className={filterStyles.locationSearchWrapper}
            style={{ flex: 1, marginBottom: 0 }}
            ref={wrapperRef}
          >
            <input
              ref={inputRef}
              type="text"
              className={filterStyles.locationSearchInput}
              placeholder="Search by address, school, or place"
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
              aria-expanded={showDropdown}
              aria-autocomplete="list"
              aria-controls="calendar-places-autocomplete-list"
            />
            {inputValue && (
              <button
                type="button"
                className={filterStyles.locationClearButton}
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
            <button
              type="button"
              className={filterStyles.locationSearchIcon}
              onClick={handleSearchClick}
              aria-label="Search location"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M11.7 10.3L15.7 14.3C15.9 14.5 15.9 14.9 15.7 15.1L15.1 15.7C14.9 15.9 14.5 15.9 14.3 15.7L10.3 11.7C9.2 12.5 7.9 13 6.5 13C2.9 13 0 10.1 0 6.5C0 2.9 2.9 0 6.5 0C10.1 0 13 2.9 13 6.5C13 7.9 12.5 9.2 11.7 10.3ZM6.5 11C8.99 11 11 8.99 11 6.5C11 4.01 8.99 2 6.5 2C4.01 2 2 4.01 2 6.5C2 8.99 4.01 11 6.5 11Z"
                  fill="currentColor"
                />
              </svg>
            </button>

            {showDropdown &&
              predictions.length > 0 &&
              dropdownPos &&
              ReactDOM.createPortal(
                <div
                  id="calendar-places-autocomplete-list"
                  className={filterStyles.autocompleteDropdown}
                  role="listbox"
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
              value={selectedRadius ?? ""}
              onChange={handleRadiusChange}
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
              value={selectedCategory ?? ""}
              onChange={(e) => onCategoryChange(e.target.value || null)}
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
    </div>
  );
};
