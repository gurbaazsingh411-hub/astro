import { useState, useEffect, useCallback } from 'react';

export interface Coords {
    latitude: number;
    longitude: number;
}

const DEFAULT_COORDS: Coords = {
    latitude: 40.7128, // NYC
    longitude: -74.0060
};

export const useLocation = () => {
    const [coords, setCoords] = useState<Coords>(() => {
        const saved = localStorage.getItem('skyar_location');
        return saved ? JSON.parse(saved) : DEFAULT_COORDS;
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setError('Geolocation not supported');
            setLoading(false);
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const newCoords = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                setCoords(newCoords);
                localStorage.setItem('skyar_location', JSON.stringify(newCoords));
                setError(null);
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    }, []);

    useEffect(() => {
        refreshLocation();
    }, [refreshLocation]);

    const setManualLocation = (newCoords: Coords) => {
        setCoords(newCoords);
        localStorage.setItem('skyar_location', JSON.stringify(newCoords));
        setError(null);
    };

    return { coords, error, loading, refreshLocation, setManualLocation };
};
