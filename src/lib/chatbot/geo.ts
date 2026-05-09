export type GeoLocation = {
  lat: number;
  lng: number;
};

export function formatGeoLocation(location: GeoLocation | null) {
  if (!location) {
    return "Đà Lạt";
  }

  return `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
}