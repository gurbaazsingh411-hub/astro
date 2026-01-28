import { useState, useEffect, useCallback, useRef } from 'react';

export interface Orientation {
    alpha: number | null; // Compass heading (0-360, 0 = North)
    beta: number | null;  // Pitch (-180 to 180)
    gamma: number | null; // Roll (-90 to 90)
    isSupported: boolean;
    isPermissionGranted: boolean;
    hasAbsoluteOrientation: boolean;
}

export const useDeviceOrientation = () => {
    const [orientation, setOrientation] = useState<Orientation>({
        alpha: null,
        beta: null,
        gamma: null,
        isSupported: typeof window !== 'undefined' && !!window.DeviceOrientationEvent,
        isPermissionGranted: false,
        hasAbsoluteOrientation: false
    });

    const isAbsoluteRef = useRef(false);

    // Handler for standard device orientation (may not have absolute heading)
    const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
        // Skip if we already have absolute orientation
        if (isAbsoluteRef.current) return;

        // iOS provides webkitCompassHeading for true compass heading
        const compassHeading = (event as any).webkitCompassHeading;

        if (compassHeading !== undefined && compassHeading !== null) {
            // iOS with compass - webkitCompassHeading is degrees from North (clockwise)
            setOrientation(prev => ({
                ...prev,
                alpha: compassHeading,
                beta: event.beta,
                gamma: event.gamma,
                hasAbsoluteOrientation: true
            }));
            isAbsoluteRef.current = true;
        } else if (event.alpha !== null) {
            // Android without absolute - alpha is relative, NOT compass heading
            // We still use it but mark as non-absolute
            setOrientation(prev => ({
                ...prev,
                alpha: event.alpha,
                beta: event.beta,
                gamma: event.gamma,
                hasAbsoluteOrientation: false
            }));
        }
    }, []);

    // Handler for absolute device orientation (Android Chrome)
    const handleAbsoluteOrientation = useCallback((event: DeviceOrientationEvent) => {
        if (event.alpha !== null && (event as any).absolute === true) {
            // This is true compass heading on Android
            setOrientation(prev => ({
                ...prev,
                alpha: 360 - event.alpha!, // Convert to match iOS convention (0 = North, clockwise)
                beta: event.beta,
                gamma: event.gamma,
                hasAbsoluteOrientation: true
            }));
            isAbsoluteRef.current = true;
        }
    }, []);

    const requestPermission = async (): Promise<boolean> => {
        // iOS 13+ requires permission request
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            try {
                const response = await (DeviceOrientationEvent as any).requestPermission();
                if (response === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation, true);
                    setOrientation(prev => ({ ...prev, isPermissionGranted: true }));
                    return true;
                }
            } catch (error) {
                console.error('DeviceOrientation permission error:', error);
                return false;
            }
        }
        return true; // Non-iOS doesn't need explicit permission
    };

    useEffect(() => {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

        // Try absolute orientation first (Android Chrome)
        if ('ondeviceorientationabsolute' in window && !isIOS) {
            (window as any).addEventListener('deviceorientationabsolute', handleAbsoluteOrientation, true);
        }

        // Also listen to regular orientation as fallback
        if (typeof (DeviceOrientationEvent as any).requestPermission !== 'function') {
            // Non-iOS: auto-start listening
            window.addEventListener('deviceorientation', handleOrientation, true);
            setOrientation(prev => ({ ...prev, isPermissionGranted: true }));
        }

        return () => {
            (window as any).removeEventListener('deviceorientationabsolute', handleAbsoluteOrientation, true);
            window.removeEventListener('deviceorientation', handleOrientation, true);
        };
    }, [handleOrientation, handleAbsoluteOrientation]);

    return { ...orientation, requestPermission };
};
