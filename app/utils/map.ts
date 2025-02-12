import { LocationDetails, TransformedSearchHit } from "models";

//  TODO: Refactor SearchMap so that both maps create markers from a list of locations, not from hits

export const groupHitsByLocation = (hits: TransformedSearchHit[]) => {
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

export const groupServiceLocations = (locations: LocationDetails[]) => {
  return locations.reduce((acc, location, i) => {
    const key = `${location.address.latitude}-${location.address.longitude}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push({ location, markerIndex: i + 1 });
    return acc;
  }, {} as Record<string, { location: LocationDetails; markerIndex: number }[]>);
};

export const computeGridOffset = (
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
