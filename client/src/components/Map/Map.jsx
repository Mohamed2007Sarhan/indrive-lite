import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, useMapEvents, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in React-Leaflet/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapClickHandler = ({ onClick }) => {
    useMapEvents({
        click(e) {
            onClick(e.latlng);
        },
    });
    return null;
};

const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

const MapComponent = ({ markers = [], height = '100%', center = [30.0444, 31.2357], onClick, routePoints }) => {
    return (
        <MapContainer center={center} zoom={13} style={{ height: height, width: '100%', borderRadius: '16px', zIndex: 0 }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {markers.map((marker, idx) => (
                <Marker key={idx} position={marker.position}>
                    <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent className="map-label">
                        {marker.label}
                    </Tooltip>
                </Marker>
            ))}

            {routePoints && routePoints.length > 1 && (
                <Polyline positions={routePoints} color="blue" weight={5} opacity={0.7} />
            )}

            <MapUpdater center={center} />
            {onClick && <MapClickHandler onClick={onClick} />}
        </MapContainer>
    );
};

export default MapComponent;
