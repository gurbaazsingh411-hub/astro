export interface ScreenPosition {
    x: number;
    y: number;
}

// Field of view in degrees - typical mobile camera
const FOV_DEGREES = 60;

/**
 * Convert degrees to radians
 */
const toRadians = (deg: number): number => (deg * Math.PI) / 180;

/**
 * Convert radians to degrees  
 */
const toDegrees = (rad: number): number => (rad * 180) / Math.PI;

/**
 * Convert altitude/azimuth to 3D unit vector
 * Using astronomy convention: azimuth 0 = North, 90 = East
 */
const altAzTo3D = (altitude: number, azimuth: number): [number, number, number] => {
    const altRad = toRadians(altitude);
    const azRad = toRadians(azimuth);

    // x = East, y = North, z = Up (towards zenith)
    const cosAlt = Math.cos(altRad);
    return [
        cosAlt * Math.sin(azRad),  // x (East)
        cosAlt * Math.cos(azRad),  // y (North)
        Math.sin(altRad)           // z (Up)
    ];
};

/**
 * Rotate a 3D point around the Z axis (yaw/heading)
 */
const rotateZ = (v: [number, number, number], angleDeg: number): [number, number, number] => {
    const rad = toRadians(angleDeg);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return [
        v[0] * cos - v[1] * sin,
        v[0] * sin + v[1] * cos,
        v[2]
    ];
};

/**
 * Rotate a 3D point around the X axis (pitch/tilt)
 */
const rotateX = (v: [number, number, number], angleDeg: number): [number, number, number] => {
    const rad = toRadians(angleDeg);
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return [
        v[0],
        v[1] * cos - v[2] * sin,
        v[1] * sin + v[2] * cos
    ];
};

/**
 * Converts celestial altitude/azimuth to screen position.
 * 
 * This uses a simple angular difference approach:
 * 1. Calculate where the device is pointing (heading + pitch)
 * 2. Calculate angular difference between device direction and object
 * 3. Map angular difference to screen coordinates
 */
export const altAzToScreenPosition = (
    altitude: number,
    azimuth: number,
    deviceHeading: number | null,
    devicePitch: number | null,
    screenWidth: number,
    screenHeight: number,
    facingMode: "environment" | "user" = "environment"
): ScreenPosition => {
    // Default to North-facing, device held vertically if no sensors
    let heading = deviceHeading ?? 0;
    const beta = devicePitch ?? 90;

    // Adjust heading for front camera (opposite direction)
    if (facingMode === "user") {
        heading = (heading + 180) % 360;
    }

    // Convert beta (device pitch) to look altitude
    const lookAltitude = beta - 90;

    // Calculate angular differences
    let deltaAz = azimuth - heading;
    while (deltaAz > 180) deltaAz -= 360;
    while (deltaAz < -180) deltaAz += 360;

    const deltaAlt = altitude - lookAltitude;

    // Convert angular differences to screen position using perspective projection
    const fovRad = toRadians(FOV_DEGREES);
    const halfFovRad = fovRad / 2;
    const tanHalfFov = Math.tan(halfFovRad);

    const deltaAzRad = toRadians(deltaAz);
    const deltaAltRad = toRadians(deltaAlt);

    // NDC -1 = left/top edge, NDC +1 = right/bottom edge
    let ndcX = Math.tan(deltaAzRad) / tanHalfFov;
    const ndcY = -Math.tan(deltaAltRad) / tanHalfFov; // Negative because screen Y increases downward

    // Mirror X if front camera is mirrored
    if (facingMode === "user") {
        ndcX = -ndcX;
    }

    // Map NDC to screen pixels
    const x = (ndcX + 1) * (screenWidth / 2);
    const y = (ndcY + 1) * (screenHeight / 2);

    // Handle edge cases (objects way outside FOV)
    if (!isFinite(x) || !isFinite(y)) {
        // Place far off-screen based on direction
        return {
            x: deltaAz > 0 ? screenWidth * 2 : -screenWidth,
            y: deltaAlt > 0 ? -screenHeight : screenHeight * 2
        };
    }

    return { x, y };
};

/**
 * Checks if a celestial object is within the visible view frustum.
 */
export const isInView = (
    altitude: number,
    azimuth: number,
    deviceHeading: number | null,
    devicePitch: number | null,
    facingMode: "environment" | "user" = "environment"
): boolean => {
    let heading = deviceHeading ?? 0;
    const beta = devicePitch ?? 90;

    // Adjust heading for front camera (opposite direction)
    if (facingMode === "user") {
        heading = (heading + 180) % 360;
    }

    const lookAltitude = beta - 90;

    // Calculate angular differences
    let deltaAz = azimuth - heading;
    while (deltaAz > 180) deltaAz -= 360;
    while (deltaAz < -180) deltaAz += 360;

    const deltaAlt = altitude - lookAltitude;

    // Object is in view if within FOV + small margin
    const viewLimit = FOV_DEGREES / 2 + 15; // 15° margin
    return Math.abs(deltaAz) < viewLimit && Math.abs(deltaAlt) < viewLimit;
};
