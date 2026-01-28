export interface Planet {
  id: string;
  name: string;
  symbol: string;
  color: string;
  size: number;
  distance: string;
  visibleToNakedEye: boolean;
  facts: string[];
  orbitSpeed: number;
  screenPos?: { x: number; y: number } | null;
  celestialPos?: { altitude: number; azimuth: number; visible: boolean };
}

export interface Constellation {
  id: string;
  name: string;
  latinName: string;
  mythology: string;
  ra: number;
  dec: number;
  stars: {
    ra: number;
    dec: number;
    brightness: number;
    screenPos?: { x: number; y: number } | null;
  }[];
  lines: [number, number][];
  centerScreenPos?: { x: number; y: number } | null;
}

export interface SkyEvent {
  id: string;
  title: string;
  date: Date;
  type: 'meteor-shower' | 'eclipse' | 'opposition' | 'conjunction' | 'satellite-pass';
  description: string;
}

export interface ViewSettings {
  showConstellations: boolean;
  showPlanets: boolean;
  showSatellites: boolean;
  nightMode: boolean;
  timeOffset: number; // hours from now
}
