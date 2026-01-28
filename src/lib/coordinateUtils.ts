export interface ScreenPosition {
    x: number;
    y: number;
}

// Approximate field of view for mobile cameras
const DEFAULT_FOV_HORIZONTAL = 60;
const DEFAULT_FOV_VERTICAL = 80;

export const altAzToScreenPosition = (
    altitude: number,
    azimuth: number,
    alpha: number | null, // Compass heading of device
    beta: number | null,  // Pitch of device
    width: number,
    height: number
): ScreenPosition => {
    // Falls back to North-facing vertical view if sensors are unavailable (Desktop)
    const activeAlpha = alpha ?? 0;
    const activeBeta = beta ?? 90;

    // Normalized device orientation
    // alpha is 0 at North, clockwise.
    // azimuth is 0 at North, clockwise.
    // beta is 90 when device is vertical pointing ahead.

    // Calculate relative azimuth (-180 to 180)
    let diffAz = (azimuth - activeAlpha + 360) % 360;
    if (diffAz > 180) diffAz -= 360;

    // Calculate relative altitude
    // beta is the pitch. If device is held vertical (Portrait), beta is ~90.
    // We assume the device is held roughly vertically for AR.
    const deviceAlt = 90 - activeBeta;
    const diffAlt = altitude - deviceAlt;

    // Map to screen
    // Horizontal FOV maps to width
    let x = (width / 2) + (diffAz / DEFAULT_FOV_HORIZONTAL) * width;
    // Vertical FOV maps to height
    let y = (height / 2) - (diffAlt / DEFAULT_FOV_VERTICAL) * height;

    // Protection against NaN or Infinity
    if (!isFinite(x)) x = 0;
    if (!isFinite(y)) y = 0;

    return { x, y };
};
