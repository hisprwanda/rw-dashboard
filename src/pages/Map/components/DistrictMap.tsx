import {geoData, analyticsData, metaData} from "../constants" 
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix the default icon issue
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Define interfaces for your data
interface GeoDistrict {
  id: string;
  code: string;
  na: string;
  pn: string;
  co: string;
  [key: string]: any;
}

interface AnalyticsData {
  headers: any[];
  metaData: any;
  rows: any[][];
  height: number;
  width: number;
  [key: string]: any;
}

interface MetaData {
  metaData: {
    items: {
      [key: string]: {
        uid: string;
        name: string;
        code?: string;
        [key: string]: any;
      }
    },
    dimensions: {
      [key: string]: string[];
    }
  },
  [key: string]: any;
}

interface ProcessedDistrict {
  id: string;
  name: string;
  value: number | null;
  coordinates: number[][][];
  code: string;
  region: string;
}

interface DistrictMapProps {
  geoData: GeoDistrict[];
  analyticsData: AnalyticsData;
  metaData: MetaData;
}

const DistrictMap = () => {
  const [districts, setDistricts] = useState<ProcessedDistrict[]>([]);
  const [valueMap, setValueMap] = useState<Map<string, string>>(new Map());
  
  useEffect(() => {
    // Process the data to join geometry with analytics
    if (geoData && analyticsData && metaData) {
      // Create a map to store values by district ID or other identifier
      const dataValues = new Map<string, string>();
      
      // Process analytics rows
      // This is a simplistic approach - you'll need to adjust based on your data structure
      analyticsData.rows.forEach(row => {
        // Assuming row structure is [dataElementId, districtId/ouId, value]
        // Or for your current example [dataElementId, period, value]
        const identifier = row[1]; // This might be districtId, period, or some other identifier
        const value = row[2];
        dataValues.set(identifier, value);
      });
      
      // Store the value map for later use
      setValueMap(dataValues);
      
      const processedDistricts = geoData.map(district => {
        // Parse the coordinates string to GeoJSON format
        const coordinates = parseCoordinates(district.co);
        
        return {
          id: district.id,
          name: district.na,
          value: null, // Value will be determined in onEachFeature
          coordinates: coordinates,
          code: district.code,
          region: district.pn
        };
      });
      
      setDistricts(processedDistricts);
    }
  }, [geoData, analyticsData, metaData]);
  
  // Function to parse coordinates string to proper GeoJSON format
  const parseCoordinates = (coordinatesString: string): number[][][] => {
    try {
      // Clean up the coordinate string which might have extra brackets
      const cleanString = coordinatesString
        .replace(/\]\]\]\]$/, ']]]')  // Remove any extra closing brackets
        .replace(/\[\[\[/, '[[[');    // Ensure proper opening format
      
      return JSON.parse(cleanString);
    } catch (e) {
      console.error('Error parsing coordinates:', e, coordinatesString);
      return [[[0, 0]]]; // Return a default in case of parsing error
    }
  };
  
  // Style function for GeoJSON based on data values
  const getStyle = (feature: any) => {
    const value = feature.properties.value || 0;
    
    // Create a color scale based on value
    let color = '#FFFFFF'; // Default
    if (value > 800) color = '#FF0000'; // High values
    else if (value > 500) color = '#FFA500'; // Medium values
    else if (value > 0) color = '#FFFF00'; // Low values
    
    return {
      fillColor: color,
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7
    };
  };
  
  // Convert our processed data to GeoJSON format
  const createGeoJSON = () => {
    return {
      type: 'FeatureCollection',
      features: districts.map(district => ({
        type: 'Feature',
        properties: {
          id: district.id,
          name: district.name,
          value: district.value,
          code: district.code,
          region: district.region
        },
        geometry: {
          type: 'Polygon',
          coordinates: district.coordinates
        }
      }))
    };
  };
  
  // Popup content for when districts are clicked
  const onEachFeature = (feature: any, layer: any) => {
    const props = feature.properties;
    
    // For your current data, we have just one value, so we'll use that
    // In a more complex scenario, you would look up the value based on district ID
    let displayValue;
    
    // Check if we have multiple rows or just one
    if (analyticsData.rows.length === 1) {
      // If we have just one row, use that value for all districts
      displayValue = analyticsData.rows[0][2];
    } else {
      // If we have multiple rows, try to match by district ID or other identifier
      // This would need to be adjusted based on your actual data structure
      displayValue = valueMap.get(props.id) || 'No data';
    }
    
    layer.bindPopup(`
      <strong>${props.name}</strong><br/>
      Code: ${props.code}<br/>
      Region: ${props.region}<br/>
      Value: ${displayValue || 'No data'}
    `);
  };
  
  return (
    <div style={{ height: '600px', width: '100%' }}>
      {districts.length > 0 ? (
        <MapContainer 
          center={[-1.9, 30.0]} // Center on Rwanda
          zoom={8} 
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          <GeoJSON 
            data={createGeoJSON()} 
            style={getStyle}
            onEachFeature={onEachFeature}
          />
        </MapContainer>
      ) : (
        <div>Loading map data...</div>
      )}
    </div>
  );
};

export default DistrictMap;