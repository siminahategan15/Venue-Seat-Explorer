declare namespace google.maps {
  class Map {
    constructor(element: Element, options: MapOptions);
  }
  interface MapOptions {
    zoom?: number;
    center?: LatLng | LatLngLiteral;
    mapTypeControl?: boolean;
    fullscreenControl?: boolean;
  }
  class Marker {
    constructor(options: MarkerOptions);
  }
  interface MarkerOptions {
    position: LatLng | LatLngLiteral;
    map: Map;
    title?: string;
  }
  interface LatLng {
    lat(): number;
    lng(): number;
  }
  interface LatLngLiteral {
    lat: number;
    lng: number;
  }
}
