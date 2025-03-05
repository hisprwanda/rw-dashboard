import React, { useState } from 'react';
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

// Basemap Type
type BasemapType = 'osm-light' | 'osm-detailed';

// Basemap Configuration
const BASEMAPS = {
  'osm-light': {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    name: 'OSM Light'
  },
  'osm-detailed': {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', // You might want to use a different URL for detailed map
    name: 'OSM Detailed'
  }
};

// Main Map Component
const MapComponent: React.FC = () => {
  // State for current basemap
  const [currentBasemap, setCurrentBasemap] = useState<BasemapType>('osm-light');

  // Sample data (moved inside the component)
  const mapData = [
    { 
      id: '1', 
      name: 'Kigali University Teaching Hospital (CHUK)', 
      latitude: -1.9524, 
      longitude: 30.0632, 
      value: 2500 
    },
    { 
      id: '2', 
      name: 'King Faisal Hospital', 
      latitude: -1.9403, 
      longitude: 30.0578, 
      value: 2200 
    },
    { 
      id: '3', 
      name: 'Butaro District Hospital', 
      latitude: -1.3854, 
      longitude: 30.0515, 
      value: 1800 
    },
    { 
      id: '4', 
      name: 'Gihundwe District Hospital', 
      latitude: -2.2158, 
      longitude: 29.2875, 
      value: 1600 
    },
    { 
      id: '5', 
      name: 'Ruhengeri Hospital', 
      latitude: -1.5044, 
      longitude: 29.6339, 
      value: 2000 
    },
    { 
      id: '6', 
      name: 'Kibungo District Hospital', 
      latitude: -2.1392, 
      longitude: 30.5424, 
      value: 1700 
    },
    { 
      id: '7', 
      name: 'Muhima District Hospital', 
      latitude: -1.9417, 
      longitude: 30.0619, 
      value: 1900 
    }
  ];

  const centerPosition: [number, number] = [-1.9403, 30.0578]; 

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 p-4 border-r">
        <h2 className="text-lg font-bold mb-4">Add Layer</h2>
        
        {/* Basemap Selection */}
        <div className="space-y-2">
          <h3 className="font-semibold">Basemap</h3>
          {(Object.keys(BASEMAPS) as BasemapType[]).map((basemap) => (
            <div 
              key={basemap}
              className={`
                p-2 cursor-pointer border rounded 
                ${currentBasemap === basemap ? 'bg-blue-100 border-blue-500' : 'hover:bg-gray-200'}
              `}
              onClick={() => setCurrentBasemap(basemap)}
            >
              {BASEMAPS[basemap].name}
            </div>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-grow h-full">
        <MapContainer 
          center={centerPosition} 
          zoom={10} 
          className="h-full w-full"
        >
          <TileLayer
            url={BASEMAPS[currentBasemap].url}
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
    </div>
  );
};

export default MapComponent;