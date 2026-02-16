import React, { useState, useRef, useEffect } from "react";
import {
  usePlacesAutocomplete,
  PlacePrediction,
} from "hooks/usePlacesAutocomplete";
import styles from "./FilterHeader.module.scss";

interface DistanceFilterContentProps {
  locationText: string;
  selectedRadius: number;
  onLocationChange: (
    text: string,
    coords: { lat: number; lng: number } | null
  ) => void;
  onRadiusChange: (value: number) => void;
}

const RADIUS_OPTIONS: { label: string; value: number }[] = [
  { label: "Within 0.5 miles", value: 805 },
  { label: "Within 1 mile", value: 1609 },
  { label: "Within 2 miles", value: 3219 },
  { label: "Within 3 miles", value: 4828 },
];

export const DistanceFilterContent = ({
  locationText,
  selectedRadius,
  onLocationChange,
  onRadiusChange,
}: DistanceFilterContentProps) => {
  const [inputValue, setInputValue] = useState(locationText);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    predictions,
    isLoading,
    getPlaceDetails,
    clearPredictions,
    searchPlaces,
  } = usePlacesAutocomplete({ debounceMs: 300, minLength: 2 });

  // Handle input changes
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
  };

  // Handle place selection
  const handleSelectPlace = async (prediction: PlacePrediction) => {
    setInputValue(prediction.description);
    setShowDropdown(false);
    clearPredictions();

    const coords = await getPlaceDetails(prediction.placeId);
    if (coords) {
      onLocationChange(prediction.description, coords);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || predictions.length === 0) {
      if (e.key === "Enter" && predictions.length === 0) {
        // If no predictions shown, trigger search with first result when available
        searchPlaces(inputValue);
      }
      return;
    }

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
          // Select first result if none highlighted
          handleSelectPlace(predictions[0]);
        }
        break;
      case "Escape":
        setShowDropdown(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Handle click on search icon
  const handleSearchClick = () => {
    if (predictions.length > 0) {
      handleSelectPlace(predictions[0]);
    } else if (inputValue.length >= 2) {
      searchPlaces(inputValue);
      setShowDropdown(true);
    }
  };

  // Handle clear input
  const handleClearInput = () => {
    setInputValue("");
    clearPredictions();
    setShowDropdown(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show dropdown when predictions arrive
  useEffect(() => {
    if (predictions.length > 0) {
      setShowDropdown(true);
    }
  }, [predictions]);

  return (
    <div>
      <div className={styles.locationSearchWrapper} ref={wrapperRef}>
        <input
          ref={inputRef}
          type="text"
          className={styles.locationSearchInput}
          placeholder="Search by zip code or address"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (predictions.length > 0) {
              setShowDropdown(true);
            }
          }}
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-controls="places-autocomplete-list"
        />
        {inputValue && (
          <button
            type="button"
            className={styles.locationClearButton}
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
          className={styles.locationSearchIcon}
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

        {showDropdown && predictions.length > 0 && (
          <div
            id="places-autocomplete-list"
            className={styles.autocompleteDropdown}
            role="listbox"
          >
            {predictions.map((prediction, index) => (
              <div
                key={prediction.placeId}
                className={`${styles.autocompleteItem} ${
                  index === highlightedIndex
                    ? styles.autocompleteItemHighlighted
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
                <span className={styles.autocompleteMainText}>
                  {prediction.mainText}
                </span>
                {prediction.secondaryText && (
                  <span className={styles.autocompleteSecondaryText}>
                    {prediction.secondaryText}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {isLoading && predictions.length === 0 && (
          <div className={styles.autocompleteDropdown}>
            <div className={styles.autocompleteLoading}>Searching...</div>
          </div>
        )}
      </div>

      {locationText && (
        <p className={styles.locationLabel}>
          Location: <strong>{locationText}</strong>
        </p>
      )}

      <div className={styles.radioGrid}>
        {RADIUS_OPTIONS.map((opt) => (
          <label key={String(opt.value)} className={styles.radioOption}>
            <input
              type="radio"
              name="distanceRadius"
              className={styles.radioInput}
              checked={selectedRadius === opt.value}
              onChange={() => onRadiusChange(opt.value)}
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
