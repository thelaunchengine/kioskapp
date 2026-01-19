import React, { useState, useEffect, useRef } from 'react';
import { Marker, Tooltip, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import axios from 'axios';

/**
 * GeolocationMarker Handles:
 * 1. Requesting browser location permission.
 * 2. Flying the map to the user's location on success.
 * 3. Rendering the "YOU ARE HERE" marker at the user's location (or default).
 */
const GeolocationMarker = () => {
    const [userLocation, setUserLocation] = useState(null);
    const map = useMap();
    const hasCentered = useRef(false);

    useEffect(() => {
        console.log("Geolocation: Initializing...");

        if (!navigator.geolocation) {
            console.error("Geolocation: Not supported by this browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                console.log("Geolocation: User location acquired:", latitude, longitude);
                setUserLocation([latitude, longitude]);
            },
            (error) => {
                console.error("Geolocation Error:", error.message);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, []);

    // Effect to handle map re-centering once location is acquired
    useEffect(() => {
        if (userLocation && !hasCentered.current) {
            console.log("Geolocation: Triggering map re-center to", userLocation);

            // Using a small timeout to ensure the map is ready for movement
            const timeoutId = setTimeout(() => {
                map.setView(userLocation, 11, { animate: true });
                console.log("Geolocation: Map move command executed.");
                hasCentered.current = true;
            }, 500);

            return () => clearTimeout(timeoutId);
        }
    }, [userLocation, map]);

    // Default pin location: Tybee Island
    const defaultPosition = [32.02278559728223, -80.8438064757624];
    const markerPosition = userLocation || defaultPosition;

    return (
        <Marker
            position={markerPosition}
            icon={new Icon({
                iconUrl: require(`./images/yellowpin.png`),
                iconSize: [25],
                iconAnchor: [12, 12]
            })}
            interactive={false}
        >
            <Tooltip direction="left" offset={[0, 0]} opacity={1} permanent>
                <div className="tooltip_vessel_title_yourhere">
                    <span className="vessel_title_yourhere">YOU ARE HERE</span>
                </div>
            </Tooltip>
        </Marker>
    );
};

export default GeolocationMarker;
