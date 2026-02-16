import React, { useState } from "react";
import GoogleMap from "google-map-react";
import { Tooltip } from "react-tippy";
import "react-tippy/dist/tippy.css";
import SearchEntry from "components/SearchAndBrowse/SearchMap/SearchEntry";
import { useAppContext, useAppContextUpdater } from "utils";
import { groupHitsByLocation, computeGridOffset } from "utils/map";
import { Button } from "components/ui/inline/Button/Button";
import {
  createMapOptions,
  UserLocationMarker,
  CustomMarker,
  SearchLocationMarker,
} from "components/ui/MapElements";
import "./SearchMap.scss";
import type { SearchHit, Location } from "../../../search/types";
import config from "../../../config";
import { SearchMapActions } from "components/SearchAndBrowse/SearchResults/SearchResults";

interface SearchMapProps {
  hits: SearchHit[];
  mobileMapIsCollapsed: boolean;
  handleSearchMapAction: (searchMapAction: SearchMapActions) => void;
  customCenter?: { lat: number; lng: number } | null;
  customZoom?: number | null;
  highlightedHitId?: string | null;
}

export const SearchMap = ({
  hits,
  mobileMapIsCollapsed,
  handleSearchMapAction,
  customCenter,
  customZoom,
  highlightedHitId,
}: SearchMapProps) => {
  const [googleMapObject, setMapObject] = useState<google.maps.Map | null>(
    null
  );
  const [clickedHitId, setClickedHitId] = useState<string | null>(null);
  const { userLocation, aroundLatLng, boundingBox } = useAppContext();
  const { setAroundLatLng, setBoundingBox } = useAppContextUpdater();

  // Pan to custom center and zoom when they change (e.g. from distance filter)
  React.useEffect(() => {
    if (googleMapObject && customCenter) {
      googleMapObject.panTo({ lat: customCenter.lat, lng: customCenter.lng });

      // Use custom zoom if provided, otherwise zoom in by 3 levels
      if (customZoom) {
        googleMapObject.setZoom(customZoom);
      } else {
        const currentZoom = googleMapObject.getZoom() || 14;
        const newZoom = Math.min(currentZoom + 3, 18);
        googleMapObject.setZoom(newZoom);
      }

      // After pan/zoom animation completes, capture the new bounds
      const idleListener = googleMapObject.addListener("idle", () => {
        google.maps.event.removeListener(idleListener);

        const bounds = googleMapObject.getBounds();
        if (bounds) {
          const ne = bounds.getNorthEast();
          const sw = bounds.getSouthWest();
          const boundingBoxString = `${ne.lat()},${sw.lng()},${sw.lat()},${ne.lng()}`;
          setBoundingBox(boundingBoxString);
        }
      });
    }
  }, [googleMapObject, customCenter, customZoom, setBoundingBox]);

  function handleSearchThisAreaClick() {
    const map = googleMapObject;
    if (map) {
      // Get the visible bounds of the map
      const bounds = map.getBounds();
      if (bounds) {
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();

        // Format as Algolia expects: "lat1,lng1,lat2,lng2"
        // Where (lat1, lng1) is the top-left (NW) corner and (lat2, lng2) is the bottom-right (SE) corner
        const boundingBoxString = `${ne.lat()},${sw.lng()},${sw.lat()},${ne.lng()}`;

        // Update the bounding box for search (takes precedence over radius-based filtering)
        setBoundingBox(boundingBoxString);

        // Keep center point updated for reference (used for map centering)
        const center = map.getCenter();
        if (center) {
          const centerStr = `${center.lat()}, ${center.lng()}`;
          setAroundLatLng(centerStr);
        }

        // Notify SearchResultsPage component to reset pagination
        handleSearchMapAction(SearchMapActions.SearchThisArea);
      }
    } else {
      handleSearchMapAction(SearchMapActions.SearchThisArea);
    }
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
      return { lat: userLocation?.coords.lat, lng: userLocation?.coords.lng };
    } else {
      return undefined;
    }
  };

  const groupedHits = groupHitsByLocation(hits);

  const markers = Object.keys(groupedHits).flatMap((key) => {
    const group = groupedHits[key];
    const total = group.length;

    if (total === 1) {
      const { hit, location } = group[0];
      return (
        <GoogleSearchHitMarkerWorkaround
          key={`${location.id}-single`}
          lat={Number(location.lat)}
          lng={Number(location.long)}
          hit={hit}
          location={location}
          isHighlighted={highlightedHitId === hit.id || clickedHitId === hit.id}
          onTooltipShow={() => setClickedHitId(hit.id)}
          onTooltipHide={() => setClickedHitId(null)}
        />
      );
    } else {
      const epicenterLat = Number(group[0].location.lat);
      const epicenterLng = Number(group[0].location.long);

      const groupMarkers = group.map((item, index) => {
        const { offsetLat, offsetLng } = computeGridOffset(index, total, {
          lat: epicenterLat,
          lng: epicenterLng,
        });
        return (
          <GoogleSearchHitMarkerWorkaround
            key={`${item.location.id}-${index}`}
            lat={offsetLat}
            lng={offsetLng}
            hit={item.hit}
            location={item.location}
            isHighlighted={highlightedHitId === item.hit.id || clickedHitId === item.hit.id}
            onTooltipShow={() => setClickedHitId(item.hit.id)}
            onTooltipHide={() => setClickedHitId(null)}
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
            libraries: ["places"],
          }}
          center={googleMapsCenter()}
          defaultZoom={14}
          onGoogleApiLoaded={({ map }) => {
            // SetMapObject shares the Google Map object across parent/sibling components
            // so that they can adjustments to markers, coordinates, layout, etc.,
            setMapObject(map);

            // If we have a bounding box from App.tsx, fit the map to it
            // This ensures the map shows the same area as the search results
            if (boundingBox) {
              const [neLat, swLng, swLat, neLng] = boundingBox
                .split(",")
                .map(Number);
              const bounds = new google.maps.LatLngBounds(
                new google.maps.LatLng(swLat, swLng), // SW corner
                new google.maps.LatLng(neLat, neLng) // NE corner
              );
              map.fitBounds(bounds);

              // Notify that map is initialized
              handleSearchMapAction(SearchMapActions.MapInitialized);
            } else {
              // Fallback: Set initial bounding box from map bounds when first loaded
              const idleListener = map.addListener("idle", () => {
                // Remove the listener so it only fires once
                google.maps.event.removeListener(idleListener);

                const bounds = map.getBounds();
                if (bounds) {
                  const ne = bounds.getNorthEast();
                  const sw = bounds.getSouthWest();
                  const boundingBoxString = `${ne.lat()},${sw.lng()},${sw.lat()},${ne.lng()}`;
                  setBoundingBox(boundingBoxString);

                  // Notify that map is initialized
                  handleSearchMapAction(SearchMapActions.MapInitialized);
                }
              });
            }
          }}
          options={createMapOptions}
        >
          {userLocation.inSanFrancisco && (
            <UserLocationMarker
              lat={userLocation?.coords.lat}
              lng={userLocation?.coords.lng}
              key="user-location"
            />
          )}
          {customCenter && (
            <SearchLocationMarker
              lat={customCenter.lat}
              lng={customCenter.lng}
              key="search-location"
            />
          )}
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
  lat,
  lng,
  location,
  isHighlighted,
  onTooltipShow,
  onTooltipHide,
}: {
  lat: number;
  lng: number;
  hit: SearchHit;
  location: Location;
  isHighlighted?: boolean;
  onTooltipShow?: () => void;
  onTooltipHide?: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
    onTooltipShow?.();
  };

  const handleClose = () => {
    setIsOpen(false);
    onTooltipHide?.();
  };

  return (
    // TODO: Figure out why TS complaining after pckg update
    /* eslint-disable @typescript-eslint/ban-ts-comment */
    // @ts-ignore
    <Tooltip
      arrow
      html={
        <SearchEntry
          hit={hit}
          lat={lat}
          lng={lng}
          location={location}
          onClose={handleClose}
        />
      }
      interactive
      open={isOpen}
      onRequestClose={handleClose}
      position="bottom"
      theme="light"
      trigger="click"
      useContext
      onShow={handleOpen}
      onHide={handleClose}
      style={{ display: "inline-block", transform: "translate(-50%, -100%)" }}
      popperOptions={{
        modifiers: {
          flip: { enabled: false },
          preventOverflow: { boundariesElement: "viewport" },
        },
      }}
    >
      <CustomMarker isHighlighted={isHighlighted} />
    </Tooltip>
  );
};
/* eslint-enable react/no-unused-prop-types */
