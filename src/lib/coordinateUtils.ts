export interface ScreenPosition {
    x: number;
    y: number;
}

// Field of view in degrees - typical mobile camera
const FOV_DEGREES = 60;

/**
 * Converts celestial altitude/azimuth to screen position.
 * 
 * @param altitude - Celestial object altitude in degrees (0 = horizon, 90 = zenith)
 * @param azimuth - Celestial object azimuth in degrees (0 = North, 90 = East, 180 = South, 270 = West)
 * @param deviceHeading - Device compass heading (alpha) in degrees (0 = North, clockwise)
 * @param devicePitch - Device pitch (beta) in degrees (0 = flat, 90 = vertical pointing forward)
 * @param screenWidth - Screen width in pixels
 * @param screenHeight - Screen height in pixels
 * @returns Screen position {x, y} in pixels, or position for objects outside view
 */
export const altAzToScreenPosition = (
    altitude: number,
    azimuth: number,
    deviceHeading: number | null,
    devicePitch: number | null,
    screenWidth: number,
    screenHeight: number
): ScreenPosition => {
    // Default to North-facing, vertical device if no sensors
    const heading = deviceHeading ?? 0;
    const pitch = devicePitch ?? 90;

    // Convert device pitch to look altitude
    // When device is vertical (beta=90), we're looking at horizon (alt=0)
    // When device is tilted back (beta=45), we're looking up at ~45° altitude
    const lookAltitude = 90 - pitch;

    // Calculate angular difference in azimuth (horizontal direction)
    let deltaAz = azimuth - heading;
    // Normalize to -180 to +180 range
    while (deltaAz > 180) deltaAz -= 360;
    while (deltaAz < -180) deltaAz += 360;

    // Calculate angular difference in altitude (vertical direction)
    const deltaAlt = altitude - lookAltitude;

    // Convert angular offsets to screen coordinates
    // Using gnomonic (tangent plane) projection for more accurate mapping
    const fovRadians = (FOV_DEGREES * Math.PI) / 180;
    const halfFov = fovRadians / 2;

    // Calculate screen position
    // Horizontal: deltaAz of 0 = center, positive = right
    const xNormalized = Math.tan((deltaAz * Math.PI) / 180) / Math.tan(halfFov);
    // Vertical: deltaAlt of 0 = center, positive = up (invert for screen coords)
    const yNormalized = -Math.tan((deltaAlt * Math.PI) / 180) / Math.tan(halfFov);

    // Map to screen pixels (-1 to +1 -> 0 to width/height)
    let x = (xNormalized + 1) * (screenWidth / 2);
    let y = (yNormalized + 1) * (screenHeight / 2);

    // Clamp to prevent extreme values
    if (!isFinite(x)) x = screenWidth / 2;
    if (!isFinite(y)) y = screenHeight / 2;

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

    let deltaAz = azimuth - heading;
    while (deltaAz > 180) deltaAz -= 360;
    while (deltaAz < -180) deltaAz += 360;

    const deltaAlt = altitude - lookAltitude;

    // Check if within reasonable viewing angle (FOV + margin)
    const viewLimit = FOV_DEGREES / 2 + 10;
    return Math.abs(deltaAz) < viewLimit && Math.abs(deltaAlt) < viewLimit;
};
