
import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import './css/GlobalPopup.css'; // We will create this

const GlobalPopup = ({ position, onClose, children, offset = [0, 0] }) => {
    const map = useMap();
    const [containerPoint, setContainerPoint] = useState(null);
    const popupRef = useRef(null);

    useEffect(() => {
        if (!map || !position) return;

        const updatePosition = () => {
            const latLng = L.latLng(position);
            const point = map.latLngToContainerPoint(latLng);
            setContainerPoint(point);
        };

        updatePosition();

        map.on('move', updatePosition);
        map.on('zoom', updatePosition);
        map.on('viewreset', updatePosition);

        return () => {
            map.off('move', updatePosition);
            map.off('zoom', updatePosition);
            map.off('viewreset', updatePosition);
        };
    }, [map, position]);

    if (!containerPoint) return null;

    // Calculate position style
    const style = {
        position: 'absolute',
        top: `${containerPoint.y + offset[1]}px`,
        left: `${containerPoint.x + offset[0]}px`,
        transform: 'translate(-50%, -100%)', // Center horizontally, place above
        zIndex: 9999999, // Super high z-index
        pointerEvents: 'auto',
    };

    // Create portal target if it doesn't exist? 
    // actually document.body is fine, but we need to ensure we clean up.

    return ReactDOM.createPortal(
        <div className="global-popup-wrapper" style={style} ref={popupRef}>
            <div className="global-popup-content">
                <button className="global-popup-close" onClick={onClose}>×</button>
                {children}
            </div>
        </div>,
        document.body
    );
};

export default GlobalPopup;
