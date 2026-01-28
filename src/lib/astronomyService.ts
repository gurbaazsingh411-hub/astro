import {
  Observer,
  Body,
  Equator,
  Horizon,
  AstroTime,
  Vector,
  SearchHourAngle,
  SearchRiseSet,
  NextTransit
} from 'astronomy-engine';

export interface CelestialPosition {
  altitude: number;
  azimuth: number;
  visible: boolean;
}

export const calculatePlanetPosition = (
  body: Body,
  date: Date,
  latitude: number,
  longitude: number
): CelestialPosition => {
  const observer = new Observer(latitude, longitude, 0);
  const time = new AstroTime(date);

  const equ_2000 = Equator(body, time, observer, true, true);
  const hor = Horizon(time, observer, equ_2000.ra, equ_2000.dec, 'normal');

  return {
    altitude: hor.altitude,
    azimuth: hor.azimuth,
    visible: hor.altitude > 0
  };
};

export const getBodyFromId = (id: string): Body | null => {
  const map: Record<string, Body> = {
    'mercury': Body.Mercury,
    'venus': Body.Venus,
    'mars': Body.Mars,
    'jupiter': Body.Jupiter,
    'saturn': Body.Saturn,
    'uranus': Body.Uranus,
    'neptune': Body.Neptune,
    'moon': Body.Moon,
    'sun': Body.Sun,
  };
  return map[id.toLowerCase()] || null;
};

export const calculateStarPosition = (
  ra: number, // Right Ascension in hours
  dec: number, // Declination in degrees
  date: Date,
  latitude: number,
  longitude: number
): CelestialPosition => {
  const observer = new Observer(latitude, longitude, 0);
  const time = new AstroTime(date);

  const hor = Horizon(time, observer, ra, dec, 'normal');

  return {
    altitude: hor.altitude,
    azimuth: hor.azimuth,
    visible: hor.altitude > 0
  };
};
