import React from "react";
import { SearchHit } from "../search/types";
import { round } from "./numbers";
import config from "../config";

type GeoCoordinates = { lat: number; lng: number };

export type UserLocation = {
  coords: GeoCoordinates;
  inSanFrancisco: boolean;
};

export const COORDS_MID_SAN_FRANCISCO: GeoCoordinates = {
  lat: 37.7749,
  lng: -122.4194,
};

/**
 * Bounding box that encompasses all of San Francisco.
 * Used to initialize the map so every user sees the full city
 * regardless of screen size, ensuring consistent search results.
 */
export const SF_MAP_BOUNDS = {
  ne: { lat: 37.83, lng: -122.35 },
  sw: { lat: 37.7, lng: -122.52 },
} as const;

export const areCoordsInSanFrancisco = (coords: GeoCoordinates): boolean => {
  // These are conservative bounds, extending into the ocean, the Bay, and Daly City.
  const bb = {
    top: 37.820633,
    left: -122.562447,
    bottom: 37.688167,
    right: -122.326927,
  };
  return (
    coords.lat > bb.bottom &&
    coords.lat < bb.top &&
    coords.lng > bb.left &&
    coords.lng < bb.right
  );
};

export const DEFAULT_AROUND_PRECISION = 1600;

/**
 * Get location via HTML5 Geolocation API.
 */
export const getLocationBrowser = () =>
  new Promise<UserLocation>((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: GeoCoordinates = {
            lat: round(position.coords.latitude, 4),
            lng: round(position.coords.longitude, 4),
          };
          if (areCoordsInSanFrancisco(coords)) {
            resolve({ coords, inSanFrancisco: true });
          } else {
            const msg = `User location out of bounds: ${coords.lat},${coords.lng}`;
            console.log(msg); // eslint-disable-line no-console
            reject(msg);
          }
        },
        (error) => {
          console.log(error); // eslint-disable-line no-console
          reject(error);
        }
      );
    } else {
      const msg = "Geolocation is not supported by this browser.";
      console.log(msg); // eslint-disable-line no-console
      reject(msg);
    }
  });

/**
 * Get location via the Google Maps Geolocation API.
 */
export const getLocationGoogle = () =>
  new Promise<UserLocation>((resolve, reject) => {
    // Results are not very accurate
    let url = "https://www.googleapis.com/geolocation/v1/geolocate";
    if (config.GOOGLE_API_KEY) {
      url += `?key=${config.GOOGLE_API_KEY}`;
    }
    fetch(url, { method: "post" })
      .then((r) => r.json())
      .then(({ location }: { location: GeoCoordinates }) => {
        if (areCoordsInSanFrancisco(location)) {
          resolve({ coords: location, inSanFrancisco: true });
        } else {
          const msg = "User location out of bounds";
          console.log(msg); // eslint-disable-line no-console
          reject(msg);
        }
      })
      .catch(reject);
  });

export const useDefaultSanFranciscoLocation = () =>
  new Promise<UserLocation>((resolve) => {
    resolve({ coords: COORDS_MID_SAN_FRANCISCO, inSanFrancisco: false });
  });

/**
 * Get user location.
 *
 * Makes use of both the HTML5 Geolocation API and the Google Maps Geolocation
 * API. Currently restricts the location to within San Francisco to avoid
 * inaccurate geolocation results, but this should be removed if more locations
 * are added.
 *
 * @todo if getLocationBrowser is outside SF, errs and tries to load google as well. Fix
 * @returns A Promise of a location, which is either an object with `lat` and
 * `lng` properties or an error if location is unavaible or out of bounds.
 */
export const getLocation = () =>
  getLocationBrowser()
    .catch(() => getLocationGoogle())
    .catch(() => useDefaultSanFranciscoLocation());

/**
 * Calculate the distance in meters between two lat/lng coordinates using the Haversine formula.
 */
export const haversineDistanceMeters = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Renders address metadata based on the `addresses` array in the `hit_` object.
 *
 */
export const renderAddressMetadata = (hit_: SearchHit): JSX.Element => {
  if (!hit_.addresses || hit_.addresses.length === 0) {
    return <span>No address found</span>;
  }
  if (hit_.addresses.length > 1) {
    return <span>This service has multiple locations</span>;
  }
  if (hit_.addresses[0].address_1) {
    return <span>{hit_.addresses[0].address_1}</span>;
  }
  return <span>No address found</span>;
};
