import * as satellite from 'satellite.js';

// Fallback TLE for ISS (approximate, should ideally fetch from CelesTrak)
const ISS_TLE = {
    line1: '1 25544U 98067A   24029.56239144  .00015949  00000-0  28257-3 0  9993',
    line2: '2 25544  51.6416 195.9404 0004554  48.0645  20.3168 15.49528654437299'
};

export interface SatellitePosition {
    altitude: number;
    azimuth: number;
}

export const calculateISSPosition = (
    date: Date,
    lat: number,
    lon: number
): SatellitePosition | null => {
    try {
        const satrec = satellite.twoline2satrec(ISS_TLE.line1, ISS_TLE.line2);
        const positionAndVelocity = satellite.propagate(satrec, date);

        const positionEci = positionAndVelocity.position;
        if (typeof positionEci === 'boolean') return null;

        const gmst = satellite.gstime(date);
        const positionGd = satellite.eciToGeodetic(positionEci as satellite.EciVec3<number>, gmst);

        // Look angles
        const observerGd = {
            longitude: satellite.degreesToRadians(lon),
            latitude: satellite.degreesToRadians(lat),
            height: 0
        };

        const lookAngles = satellite.ecfToLookAngles(
            observerGd,
            satellite.eciToEcf(positionEci as satellite.EciVec3<number>, gmst)
        );

        return {
            altitude: satellite.radiansToDegrees(lookAngles.elevation),
            azimuth: satellite.radiansToDegrees(lookAngles.azimuth)
        };
    } catch (err) {
        console.error("Satellite calculation failed:", err);
        return null;
    }
};
