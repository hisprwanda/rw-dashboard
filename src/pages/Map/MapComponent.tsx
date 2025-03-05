import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Interface for map data
interface MapData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  value?: number;
}

// Main Map Component
const MapComponent: React.FC = () => {
  // Sample data (moved inside the component)
  const mapData: MapData[] = [
    { 
      id: '1', 
      name: 'Health Facility A', 
      latitude: -1.292066, 
      longitude: 36.821946, 
      value: 1500 
    },
    { 
      id: '2', 
      name: 'Health Facility B', 
      latitude: -1.300577, 
      longitude: 36.782575, 
      value: 2300 
    }
  ];

  const centerPosition: [number, number] = [-1.292066, 36.821946];

  return (
    <div className="w-full h-[600px]">
      <MapContainer 
        center={centerPosition} 
        zoom={10} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {mapData.map((location) => (
          <Marker 
            key={location.id}
            position={[location.latitude, location.longitude]}
          >
            <Popup>
              <div>
                <h3>{location.name}</h3>
                <p>Value: {location.value}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;