/**
 * Typesense-specific utility functions
 * Helper functions for working with Typesense search, especially geographic queries
 */

/**
 * Google Maps LatLngBounds interface (subset we need)
 */
export interface GoogleMapsBounds {
  getSouthWest: () => { lat: () => number; lng: () => number };
  getNorthEast: () => { lat: () => number; lng: () => number };
}

/**
 * Convert Google Maps bounds to Typesense bounding box format
 * Returns the format expected by SearchConfig.insideBoundingBox: [topLeftLat, topLeftLng, bottomRightLat, bottomRightLng]
 *
 * @param bounds Google Maps LatLngBounds object
 * @returns Array in format [topLeftLat, topLeftLng, bottomRightLat, bottomRightLng]
 */
export function googleMapsBoundsToSearchConfig(
  bounds: GoogleMapsBounds
): number[] {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();

  return [
    ne.lat(), // Top latitude
    sw.lng(), // Left longitude
    sw.lat(), // Bottom latitude
    ne.lng(), // Right longitude
  ];
}

/**
 * Convert Google Maps bounds to Typesense polygon filter string
 * Creates a closed polygon with 5 points (4 corners + closing point)
 *
 * This is used internally by TypesenseProvider but exposed for advanced usage
 *
 * @param bounds Google Maps LatLngBounds object
 * @returns Typesense filter string like "_geoloc:(lat1,lng1,lat2,lng2,...)"
 */
export function googleMapsBoundsToPolygonFilter(
  bounds: GoogleMapsBounds
): string {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();

  // Calculate all 4 corners
  const swLat = sw.lat();
  const swLng = sw.lng();
  const neLat = ne.lat();
  const neLng = ne.lng();

  // Build closed polygon (5 points)
  return `_geoloc:(${swLat},${swLng},${swLat},${neLng},${neLat},${neLng},${neLat},${swLng},${swLat},${swLng})`;
}

/**
 * Convert lat/lng point and radius to Typesense radius filter string
 *
 * @param lat Latitude
 * @param lng Longitude
 * @param radiusInMeters Radius in meters
 * @returns Typesense filter string like "_geoloc:(lat,lng,5 km)"
 */
export function pointAndRadiusToFilter(
  lat: number,
  lng: number,
  radiusInMeters: number
): string {
  const radiusInKm = radiusInMeters / 1000;
  return `_geoloc:(${lat},${lng},${radiusInKm} km)`;
}

/**
 * Create a sort_by parameter for distance-based sorting
 *
 * @param lat Latitude
 * @param lng Longitude
 * @returns Typesense sort_by string like "_geoloc(lat,lng):asc"
 */
export function createDistanceSort(lat: number, lng: number): string {
  return `_geoloc(${lat},${lng}):asc`;
}
