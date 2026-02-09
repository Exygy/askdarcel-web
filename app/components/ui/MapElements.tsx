import googleMapReact from "google-map-react";
import React from "react";
import { MapPinIcon } from "@heroicons/react/16/solid";

export const createMapOptions = (maps: googleMapReact.Maps) => ({
  zoomControlOptions: {
    position: maps.ControlPosition.TOP_LEFT,
  },
  fullscreenControlOptions: {
    position: maps.ControlPosition.LEFT_TOP,
  },
  clickableIcons: false,
});

// eslint-disable-next-line react/no-unused-prop-types, no-empty-pattern
export const UserLocationMarker = ({}: { lat?: number; lng?: number }) => (
  <svg width="20" height="20" data-testid="user-location-marker">
    <circle
      cx="10"
      cy="10"
      r="5"
      fill="none"
      stroke="#007ac7"
      strokeWidth="5"
    />
  </svg>
);

/* eslint-disable react/no-unused-prop-types */
export const CustomMarker = ({
  isHighlighted,
}: {
  lat?: number;
  lng?: number;
  text?: string;
  isHighlighted?: boolean;
}) => (
  <svg
    width="36"
    height="50"
    viewBox="0 0 110 85"
    className="marker"
    data-testid="custom-marker"
  >
    <g fill="none" fillRule="evenodd">
      <g transform="translate(-58, 0)" id="pin">
        <path
          d="M160.39 34.315c0 18.546-36.825 83.958-36.825 83.958S86.74 52.86 86.74 34.315C86.74 15.768 104.885.73 123.565.73c18.68 0 36.825 15.038 36.825 33.585z"
          strokeWidth="3"
          style={{
            fill: isHighlighted ? "#007ac7" : "#F15A29",
            stroke: isHighlighted ? "#005f9e" : "#CD4A23",
            transition: "fill 0.3s ease, stroke 0.3s ease",
          }}
        />
      </g>
    </g>
  </svg>
);

export const SearchLocationMarker = ({}: { lat?: number; lng?: number }) => (
  <div style={{ transform: "translate(-16px, -32px)" }}>
    <MapPinIcon width={32} height={32} color="#FBB040" />
  </div>
);

/* eslint-enable react/no-unused-prop-types */
