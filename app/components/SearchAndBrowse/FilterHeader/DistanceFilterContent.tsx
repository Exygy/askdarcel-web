import React, { useState } from "react";
import styles from "./FilterHeader.module.scss";

interface DistanceFilterContentProps {
  locationText: string;
  selectedRadius: number | "all";
  onLocationChange: (
    text: string,
    coords: { lat: number; lng: number } | null
  ) => void;
  onRadiusChange: (value: number | "all") => void;
}

// TODO: Replace with Google Places Autocomplete when API key is available
function stubGeocode(_query: string): { lat: number; lng: number } {
  // Hardcoded stub location for proof of concept
  return { lat: 37.742775, lng: -122.386192 };
}

const RADIUS_OPTIONS: { label: string; value: number | "all" }[] = [
  { label: "Within 1 mile", value: 1609 },
  { label: "Within 2 miles", value: 3219 },
  { label: "Within 3 miles", value: 4828 },
  { label: "Full map area", value: "all" },
];

export const DistanceFilterContent = ({
  locationText,
  selectedRadius,
  onLocationChange,
  onRadiusChange,
}: DistanceFilterContentProps) => {
  const [inputValue, setInputValue] = useState(locationText);

  const handleSearch = () => {
    if (!inputValue.trim()) return;
    const coords = stubGeocode(inputValue);
    onLocationChange("Stub location (37.74, -122.39)", coords);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div>
      <div className={styles.locationSearchWrapper}>
        <input
          type="text"
          className={styles.locationSearchInput}
          placeholder="Search for a location"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          className={styles.locationSearchButton}
          onClick={handleSearch}
          aria-label="Search location"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M11.7 10.3L15.7 14.3C15.9 14.5 15.9 14.9 15.7 15.1L15.1 15.7C14.9 15.9 14.5 15.9 14.3 15.7L10.3 11.7C9.2 12.5 7.9 13 6.5 13C2.9 13 0 10.1 0 6.5C0 2.9 2.9 0 6.5 0C10.1 0 13 2.9 13 6.5C13 7.9 12.5 9.2 11.7 10.3ZM6.5 11C8.99 11 11 8.99 11 6.5C11 4.01 8.99 2 6.5 2C4.01 2 2 4.01 2 6.5C2 8.99 4.01 11 6.5 11Z"
              fill="currentColor"
            />
          </svg>
        </button>
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
