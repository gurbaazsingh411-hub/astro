import { useState, useEffect, useCallback } from 'react';

export interface Orientation {
    alpha: number | null; // Compass heading (0-360)
    beta: number | null;  // Pitch (-180 to 180)
    gamma: number | null; // Roll (-90 to 90)
    isSupported: boolean;
    isPermissionGranted: boolean;
}

export const useDeviceOrientation = () => {
    const [orientation, setOrientation] = useState<Orientation>({
        alpha: null,
        beta: null,
        gamma: null,
        isSupported: typeof window !== 'undefined' && !!window.DeviceOrientationEvent,
        isPermissionGranted: false
    });

    const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
        // webkitCompassHeading is for iOS
        const alpha = (event as any).webkitCompassHeading || event.alpha;
        setOrientation(prev => ({
            ...prev,
            alpha: alpha,
            beta: event.beta,
            gamma: event.gamma
        }));
    }, []);

    const requestPermission = async () => {
        if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
            try {
                const response = await (DeviceOrientationEvent as any).requestPermission();
                if (response === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation);
                    setOrientation(prev => ({ ...prev, isPermissionGranted: true }));
                    return true;
                }
            } catch (error) {
                console.error('DeviceOrientation permission error:', error);
            }
        } else {
            // Non-iOS or older devices
            window.addEventListener('deviceorientation', handleOrientation);
            setOrientation(prev => ({ ...prev, isPermissionGranted: true }));
            return true;
        }
        return false;
    };

    useEffect(() => {
        const handleAbsoluteOrientation = (event: DeviceOrientationEvent) => {
            if (event.alpha !== null) {
                setOrientation(prev => ({
                    ...prev,
                    alpha: event.alpha,
                    beta: event.beta,
                    gamma: event.gamma
                }));
            }
        };

        // Check if absolute orientation is supported
        if ('ondeviceorientationabsolute' in window) {
            (window as any).addEventListener('deviceorientationabsolute', handleAbsoluteOrientation);
        } else if (typeof (DeviceOrientationEvent as any).requestPermission !== 'function') {
            (window as any).addEventListener('deviceorientation', handleOrientation);
            setOrientation(prev => ({ ...prev, isPermissionGranted: true }));
        }

        return () => {
            (window as any).removeEventListener('deviceorientationabsolute', handleAbsoluteOrientation);
            (window as any).removeEventListener('deviceorientation', handleOrientation);
        };
    }, [handleOrientation]);

    return { ...orientation, requestPermission };
};
