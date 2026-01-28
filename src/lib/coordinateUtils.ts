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
    screenHeight: number
): ScreenPosition => {
    // Default to North-facing, device held vertically if no sensors
    const heading = deviceHeading ?? 0;
    const beta = devicePitch ?? 90;

    // Convert beta (device pitch) to look altitude
    // beta = 0° means device flat (looking down at ground)
    // beta = 90° means device vertical (looking at horizon)
    // beta = 180° means device flat facing up (looking at zenith)
    // For most AR use: beta ~90° means looking at horizon
    const lookAltitude = beta - 90; // When beta=90, lookAlt=0 (horizon)

    // Calculate angular differences
    // Horizontal difference (azimuth)
    let deltaAz = azimuth - heading;
    // Normalize to -180 to +180
    while (deltaAz > 180) deltaAz -= 360;
    while (deltaAz < -180) deltaAz += 360;

    // Vertical difference (altitude)
    const deltaAlt = altitude - lookAltitude;

    // Debug logging (only occasionally to avoid spam)
    if (Math.random() < 0.005) {
        console.log('📍 Transform:', {
            object: { alt: altitude.toFixed(1), az: azimuth.toFixed(1) },
            device: { heading: heading.toFixed(1), beta: beta.toFixed(1), lookAlt: lookAltitude.toFixed(1) },
            delta: { deltaAz: deltaAz.toFixed(1), deltaAlt: deltaAlt.toFixed(1) }
        });
    }

    // Convert angular differences to screen position using perspective projection
    const fovRad = toRadians(FOV_DEGREES);
    const halfFovRad = fovRad / 2;
    const tanHalfFov = Math.tan(halfFovRad);

    // Calculate normalized device coordinates (-1 to +1)
    // Using tangent for perspective projection
    const deltaAzRad = toRadians(deltaAz);
    const deltaAltRad = toRadians(deltaAlt);

    // For small angles, tan(θ) ≈ θ, but we use full tan for accuracy
    const ndcX = Math.tan(deltaAzRad) / tanHalfFov;
    const ndcY = -Math.tan(deltaAltRad) / tanHalfFov; // Negative because screen Y increases downward

    // Map NDC to screen pixels
    // NDC -1 = left/top edge, NDC +1 = right/bottom edge
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
    devicePitch: number | null
): boolean => {
    const heading = deviceHeading ?? 0;
    const beta = devicePitch ?? 90;
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
