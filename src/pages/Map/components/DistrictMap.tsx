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

// Sample DHIS2 Legends
const sampleLegends = [
  {
    "name": "legend 1",
    "legends": [
      {
        "name": "Low",
        "startValue": 0,
        "endValue": 500,
        "color": "#FFFFB2"
      },
      {
        "name": "Medium",
        "startValue": 500,
        "endValue": 800,
        "color": "#FED976"
      },
      {
        "name": "High",
        "startValue": 800,
        "endValue": 2000,
        "color": "#FD8D3C"
      }
    ]
  },
  {
    "name": "legend 2",
    "legends": [
      {
        "name": "Very Low",
        "startValue": 0,
        "endValue": 300,
        "color": "#EDF8FB"
      },
      {
        "name": "Low",
        "startValue": 300,
        "endValue": 600,
        "color": "#B2E2E2"
      },
      {
        "name": "Medium",
        "startValue": 600,
        "endValue": 900,
        "color": "#66C2A4"
      },
      {
        "name": "High",
        "startValue": 900,
        "endValue": 1200,
        "color": "#2CA25F"
      },
      {
        "name": "Very High",
        "startValue": 1200,
        "endValue": 2000,
        "color": "#006D2C"
      }
    ]
  }
];

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

interface LegendClass {
  name: string;
  startValue: number;
  endValue: number;
  color: string;
}

interface Legend {
  name: string;
  legends: LegendClass[];
}

const DistrictMap = () => {
  const [districts, setDistricts] = useState<ProcessedDistrict[]>([]);
  const [valueMap, setValueMap] = useState<Map<string, string>>(new Map());
  const [legendType, setLegendType] = useState<string>("auto"); // "auto" or "dhis2"
  const [selectedLegendSet, setSelectedLegendSet] = useState<Legend>(sampleLegends[0]);
  const [autoLegend, setAutoLegend] = useState<LegendClass[]>([]);
  
  useEffect(() => {
    // Process the data to join geometry with analytics
    if (geoData && analyticsData && metaData) {
      // Create a map to store values by district ID or other identifier
      const dataValues = new Map<string, string>();
      
      // Process analytics rows
      analyticsData.rows.forEach(row => {
        const identifier = row[1]; // This might be districtId, period, or some other identifier
        const value = row[2];
        dataValues.set(identifier, value);
      });
      
      // Store the value map for later use
      setValueMap(dataValues);
      
      const processedDistricts = geoData.map(district => {
        // Parse the coordinates string to GeoJSON format
        const coordinates = parseCoordinates(district.co);
        
        // For your current data, we have just one value
        // In a more complex scenario, you would look up the value based on district ID
        let value = null;
        if (analyticsData.rows.length === 1) {
          value = parseFloat(analyticsData.rows[0][2]);
        } else {
          const districtValue = dataValues.get(district.id);
          value = districtValue ? parseFloat(districtValue) : null;
        }
        
        return {
          id: district.id,
          name: district.na,
          value: value,
          coordinates: coordinates,
          code: district.code,
          region: district.pn
        };
      });
      
      setDistricts(processedDistricts);
      
      // Generate automatic legend
      generateAutoLegend(processedDistricts);
    }
  }, [geoData, analyticsData, metaData]);
  
  // Generate automatic legend based on data values
  const generateAutoLegend = (districts: ProcessedDistrict[]) => {
    const values = districts
      .map(d => d.value)
      .filter((value): value is number => value !== null);
    
    if (values.length === 0) return;
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    
    // Generate a 5-class legend
    const step = range / 5;
    const autoLegend: LegendClass[] = [
      {
        name: "Very Low",
        startValue: min,
        endValue: min + step,
        color: "#EDF8FB"
      },
      {
        name: "Low",
        startValue: min + step,
        endValue: min + 2 * step,
        color: "#B3CDE3"
      },
      {
        name: "Medium",
        startValue: min + 2 * step,
        endValue: min + 3 * step,
        color: "#8C96C6"
      },
      {
        name: "High",
        startValue: min + 3 * step,
        endValue: min + 4 * step,
        color: "#8856A7"
      },
      {
        name: "Very High",
        startValue: min + 4 * step,
        endValue: max,
        color: "#810F7C"
      }
    ];
    
    setAutoLegend(autoLegend);
  };
  
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
  
  // Get color for a value based on the active legend
  const getColorForValue = (value: number | null) => {
    if (value === null) return "#FFFFFF"; // Default color for no data
    
    // Get the active legend classes
    const legendClasses = legendType === "auto" ? autoLegend : selectedLegendSet.legends;
    
    // Find the matching class
    for (const legendClass of legendClasses) {
      if (value >= legendClass.startValue && value <= legendClass.endValue) {
        return legendClass.color;
      }
    }
    
    return "#FFFFFF"; // Default color if no matching class
  };
  
  // Style function for GeoJSON based on data values
  const getStyle = (feature: any) => {
    const value = feature.properties.value;
    const color = getColorForValue(value);
    
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
      displayValue = valueMap.get(props.id) || 'No data';
    }
    
    layer.bindPopup(`
      <strong>${props.name}</strong><br/>
      Code: ${props.code}<br/>
      Region: ${props.region}<br/>
      Value: ${displayValue || 'No data'}
    `);
  };
  
  // Legend control component
  const Legend = () => {
    // Get active legend classes
    const legendClasses = legendType === "auto" ? autoLegend : selectedLegendSet.legends;
    
    return (
      <div style={{
        padding: '10px',
        backgroundColor: 'white',
        boxShadow: '0 0 15px rgba(0,0,0,0.2)',
        borderRadius: '5px',
        position: 'absolute',
        bottom: '20px',
        right: '10px',
        zIndex: 1000
      }}>
        <div style={{ marginBottom: '10px', fontWeight: 'bold' }}>
          {legendType === "auto" ? "Automatic Legend" : selectedLegendSet.name}
        </div>
        {legendClasses.map((item, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
            <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: item.color,
              marginRight: '5px',
              border: '1px solid #ccc'
            }}></div>
            <span>{item.name}: {item.startValue.toFixed(1)} - {item.endValue.toFixed(1)}</span>
          </div>
        ))}
      </div>
    );
  };
  
  // Legend type and set selectors
  const LegendControls = () => {
    return (
      <div style={{ marginBottom: '10px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label style={{ marginRight: '10px' }}>
            <input
              type="radio"
              value="auto"
              checked={legendType === "auto"}
              onChange={() => setLegendType("auto")}
            />
            Automatic Legend
          </label>
          <label>
            <input
              type="radio"
              value="dhis2"
              checked={legendType === "dhis2"}
              onChange={() => setLegendType("dhis2")}
            />
            DHIS2 Legend
          </label>
        </div>
        
        {legendType === "dhis2" && (
          <select
            value={selectedLegendSet.name}
            onChange={(e) => {
              const selected = sampleLegends.find(legend => legend.name === e.target.value);
              if (selected) setSelectedLegendSet(selected);
            }}
            style={{ padding: '5px', width: '200px' }}
          >
            {sampleLegends.map((legend, index) => (
              <option key={index} value={legend.name}>{legend.name}</option>
            ))}
          </select>
        )}
      </div>
    );
  };
  
  return (
    <div>
      <LegendControls />
      <div style={{ height: '600px', width: '100%', position: 'relative' }}>
        {districts.length > 0 ? (
          <>
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
            <Legend />
          </>
        ) : (
          <div>Loading map data...</div>
        )}
      </div>
    </div>
  );
};

export default DistrictMap;