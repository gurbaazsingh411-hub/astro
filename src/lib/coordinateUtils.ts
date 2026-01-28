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
 * Converts celestial altitude/azimuth to screen position using proper 3D rotation.
 * 
 * This approach:
 * 1. Converts celestial alt/az to a 3D unit vector
 * 2. Rotates the vector to match the device's viewing direction
 * 3. Projects the result onto the 2D screen
 */
export const altAzToScreenPosition = (
    altitude: number,
    azimuth: number,
    deviceHeading: number | null,
    devicePitch: number | null,
    screenWidth: number,
    screenHeight: number
): ScreenPosition => {
    // Default to North-facing, looking at horizon if no sensors
    const heading = deviceHeading ?? 0;
    const pitch = devicePitch ?? 90;

    // Convert device pitch to look direction
    // beta=90 means device vertical, looking at horizon (altitude 0)
    // beta=45 means device tilted back 45°, looking up at altitude 45°
    const lookAltitude = 90 - pitch;

    // Convert celestial position to 3D vector
    let point = altAzTo3D(altitude, azimuth);

    // Apply device orientation:
    // 1. Rotate around Z (vertical) axis by -heading to align North with device forward
    point = rotateZ(point, -heading);

    // 2. Rotate around X (horizontal) axis to account for device tilt
    // When looking at horizon (lookAltitude=0), no rotation needed
    // When looking up (lookAltitude=45), rotate scene down by 45°
    point = rotateX(point, -lookAltitude);

    // After rotation:
    // - point[1] > 0 means object is in front of us
    // - point[0] = left/right offset
    // - point[2] = up/down offset

    // If object is behind us (y <= 0), place it off-screen
    if (point[1] <= 0.01) {
        return {
            x: point[0] > 0 ? screenWidth * 2 : -screenWidth,
            y: point[2] > 0 ? -screenHeight : screenHeight * 2
        };
    }

    // Project to screen using perspective projection
    const fovRad = toRadians(FOV_DEGREES);
    const tanHalfFov = Math.tan(fovRad / 2);

    // Calculate normalized device coordinates (-1 to 1)
    // Divide by y (depth) for perspective
    const ndcX = (point[0] / point[1]) / tanHalfFov;
    const ndcY = -(point[2] / point[1]) / tanHalfFov; // Invert for screen coords

    // Map to screen pixels
    const x = (ndcX + 1) * (screenWidth / 2);
    const y = (ndcY + 1) * (screenHeight / 2);

    // Handle edge cases
    if (!isFinite(x) || !isFinite(y)) {
        return { x: screenWidth / 2, y: screenHeight / 2 };
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
    const pitch = devicePitch ?? 90;
    const lookAltitude = 90 - pitch;

    let point = altAzTo3D(altitude, azimuth);
    point = rotateZ(point, -heading);
    point = rotateX(point, -lookAltitude);

    // Object is in view if it's in front (y > 0) and within FOV
    if (point[1] <= 0) return false;

    const fovRad = toRadians(FOV_DEGREES);
    const tanHalfFov = Math.tan(fovRad / 2);

    const ndcX = Math.abs(point[0] / point[1]) / tanHalfFov;
    const ndcY = Math.abs(point[2] / point[1]) / tanHalfFov;

    return ndcX < 1.2 && ndcY < 1.2; // Allow small margin
};
