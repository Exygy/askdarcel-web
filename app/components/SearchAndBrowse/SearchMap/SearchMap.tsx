import React, { useState } from "react";
import GoogleMap from "google-map-react";
import { Tooltip } from "react-tippy";
import "react-tippy/dist/tippy.css";
import SearchEntry from "components/SearchAndBrowse/SearchMap/SearchEntry";
import { useAppContext, useAppContextUpdater } from "utils";
import { Button } from "components/ui/inline/Button/Button";
import {
  createMapOptions,
  UserLocationMarker,
  CustomMarker,
} from "components/ui/MapElements";
import "./SearchMap.scss";
import { TransformedSearchHit } from "../../../models";
import config from "../../../config";
import { SearchMapActions } from "components/SearchAndBrowse/SearchResults/SearchResults";

interface SearchMapProps {
  hits: TransformedSearchHit[];
  mobileMapIsCollapsed: boolean;
  handleSearchMapAction: (searchMapAction: SearchMapActions) => void;
}

const groupHitsByLocation = (hits: TransformedSearchHit[]) => {
  return hits.reduce((acc, hit) => {
    hit.locations.forEach((location) => {
      const key = `${location.lat}-${location.long}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push({ hit, location });
    });
    return acc;
  }, {} as Record<string, { hit: TransformedSearchHit; location: { id: string; lat: string; long: string; label: string } }[]>);
};

const computeGridOffset = (
  index: number,
  total: number,
  epicenterLat: number,
  epicenterLng: number,
  spacing: number = 0.00004
): { offsetLat: number; offsetLng: number } => {
  const cols = Math.ceil(Math.sqrt(total));
  const rows = Math.ceil(total / cols);
  const row = Math.floor(index / cols);
  const col = index % cols;
  const offsetLat = epicenterLat + (row - (rows - 1) / 2) * spacing;
  const offsetLng = epicenterLng + (col - (cols - 1) / 2) * spacing;
  return { offsetLat, offsetLng };
};

export const SearchMap = ({
  hits,
  mobileMapIsCollapsed,
  handleSearchMapAction,
}: SearchMapProps) => {
  const [googleMapObject, setMapObject] = useState<google.maps.Map | null>(
    null
  );
  const { userLocation, aroundLatLng } = useAppContext();
  const { setAroundLatLng } = useAppContextUpdater();

  function handleSearchThisAreaClick() {
    const center = googleMapObject?.getCenter();
    if (center?.lat() && center?.lng()) {
      setAroundLatLng(`${center.lat()}, ${center.lng()}`);
    }
    handleSearchMapAction(SearchMapActions.SearchThisArea);
  }

  const aroundLatLngToMapCenter = {
    lat: Number(aroundLatLng.split(",")[0]),
    lng: Number(aroundLatLng.split(",")[1]),
  };

  // Center the map to the user's choice (`aroundLatLng`) with a fallback to our best guess when sniffing their
  // location on app start (`userLocation`)
  const googleMapsCenter = () => {
    if (aroundLatLng) {
      return aroundLatLngToMapCenter;
    } else if (userLocation) {
      return { lat: userLocation?.lat, lng: userLocation?.lng };
    } else {
      return undefined;
    }
  };

  const groupedMarkers = groupHitsByLocation(hits);

  const markers = Object.keys(groupedMarkers).flatMap((key) => {
    const group = groupedMarkers[key];
    const total = group.length;

    if (total === 1) {
      const { hit, location } = group[0];
      return (
        <GoogleSearchHitMarkerWorkaround
          key={`${location.id}-single`}
          lat={Number(location.lat)}
          lng={Number(location.long)}
          tag={location.label}
          hit={hit}
        />
      );
    } else {
      const epicenterLat = Number(group[0].location.lat);
      const epicenterLng = Number(group[0].location.long);

      const groupMarkers = group.map((item, index) => {
        const { offsetLat, offsetLng } = computeGridOffset(
          index,
          total,
          epicenterLat,
          epicenterLng
        );
        return (
          <GoogleSearchHitMarkerWorkaround
            key={`${item.location.id}-${index}`}
            lat={offsetLat}
            lng={offsetLng}
            tag={item.location.label}
            hit={item.hit}
          />
        );
      });
      return groupMarkers.reverse();
    }
  });

  return (
    <div className="results-map no-print">
      <h2 className="sr-only">Map of search results</h2>
      <div className="map-wrapper">
        {/* If map is being overlaid, hide the search area button. It is is neither clickable
            nor relevant in this mode.
        */}
        {!mobileMapIsCollapsed && (
          <Button
            addClass="searchAreaButton"
            variant="primary"
            iconName="fas fa-search"
            iconVariant="before"
            mobileFullWidth={false}
            onClick={() => handleSearchThisAreaClick()}
          >
            Search this area
          </Button>
        )}
        <GoogleMap
          bootstrapURLKeys={{
            key: config.GOOGLE_API_KEY,
          }}
          center={googleMapsCenter()}
          defaultZoom={14}
          onGoogleApiLoaded={({ map }) => {
            // SetMapObject shares the Google Map object across parent/sibling components
            // so that they can adjustments to markers, coordinates, layout, etc.,
            setMapObject(map);
          }}
          options={createMapOptions}
        >
          <UserLocationMarker
            lat={userLocation?.lat}
            lng={userLocation?.lng}
            key={1}
          />
          {markers}
        </GoogleMap>
      </div>
    </div>
  );
};

// The GoogleMap component expects children to be passed lat/long,
// even though we don't use them here.
//
/* eslint-disable react/no-unused-prop-types */
const GoogleSearchHitMarkerWorkaround = ({
  hit,
  tag,
}: {
  lat: number;
  lng: number;
  hit: TransformedSearchHit;
  tag: string;
}) => (
  // TODO: Figure out why TS complaining after pckg update
  /* eslint-disable @typescript-eslint/ban-ts-comment */
  // @ts-ignore
  <Tooltip
    arrow
    html={<SearchEntry hit={hit} />}
    interactive
    position="bottom"
    theme="light"
    trigger="click"
    useContext
  >
    <CustomMarker text={tag} />
  </Tooltip>
);
/* eslint-enable react/no-unused-prop-types */
