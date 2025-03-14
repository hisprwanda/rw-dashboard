//import  {geoFeaturesData, analyticsMapData, metaMapData} from "../constants"
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapSidebar from './MapSideBar'; 
// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { BasemapType, ProcessedDistrict,Legend,LegendClass } from '../../../types/maps';
import { BASEMAPS } from '../constants';
import { useAuthorities } from '../../../context/AuthContext';
import { MapUpdater } from './MapUpdater';
import { generateAutoLegend } from '../../../lib/mapHelpers';

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
        "name": "chris",
        "startValue": 75.3, 
        "endValue": 99.5,
        "color": "#ff0000"
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

// Main Map Component
const MapBody: React.FC = () => {
  const {geoFeaturesData, analyticsMapData, metaMapData} = useAuthorities();
  // State for current basemap
  const [currentBasemap, setCurrentBasemap] = useState<BasemapType>('osm-light');
  
  // District Map States
  const [districts, setDistricts] = useState<ProcessedDistrict[]>([]);
  const [valueMap, setValueMap] = useState<Map<string, string>>(new Map());
  const [legendType, setLegendType] = useState<string>("auto"); 
  const [selectedLegendSet, setSelectedLegendSet] = useState<Legend>(sampleLegends[0]);
  const [autoLegend, setAutoLegend] = useState<LegendClass[]>([]);
  
  // Default center for Rwanda - will be updated based on data
  const [centerPosition, setCenterPosition] = useState<[number, number]>([-1.9403, 30.0578]);
  const [dataProcessed, setDataProcessed] = useState<boolean>(false);
  const [hasDataToDisplay, setHasDataToDisplay] = useState<boolean>(false);
  
  // Calculate center position from district coordinates
  const calculateMapCenter = (districts: ProcessedDistrict[]): [number, number] => {
    if (!districts || districts.length === 0) {
      return [-1.9403, 30.0578]; // Default center for Rwanda if no data
    }
    
    // Filter to only districts with actual data values
    const districtsWithData = districts.filter(d => d.value !== null);
    
    if (districtsWithData.length === 0) {
      return [-1.9403, 30.0578]; // Default center if no districts have data
    }
    
    let latSum = 0;
    let lonSum = 0;
    let pointCount = 0;
    
    // Sample some points from each district to calculate average
    districtsWithData.forEach(district => {
      if (district.coordinates && district.coordinates.length > 0) {
        // Take a point from each polygon to avoid over-weighting large districts
        district.coordinates.forEach(polygon => {
          if (polygon && polygon.length > 0) {
            // Coordinates are in [lon, lat] format in GeoJSON
            lonSum += polygon[0][0];
            latSum += polygon[0][1];
            pointCount++;
          }
        });
      }
    });
    
    if (pointCount === 0) {
      return [-1.9403, 30.0578]; // Default center if no valid coordinates
    }
    
    return [latSum / pointCount, lonSum / pointCount];
  };

  // Effects and functions from DistrictMap
  useEffect(() => {
    console.log({
      geoFeaturesData, analyticsMapData, metaMapData
    });
    
    // Mark as processed even if data is incomplete or empty
    setDataProcessed(true);
    
    // Check if required data is available
    if (!geoFeaturesData || !Array.isArray(geoFeaturesData) || geoFeaturesData.length === 0) {
      console.log("geoFeaturesData is not ready yet or empty");
      return;
    }
    
    if (!analyticsMapData || !analyticsMapData.rows || !Array.isArray(analyticsMapData.rows)) {
      console.log("analyticsMapData is not ready yet or empty");
      return;
    }
    
    if (!metaMapData) {
      console.log("metaMapData is not ready yet");
      return;
    }
    
    // Only proceed if we have all the data
    try {
      // Create a map to store values by district ID or other identifier
      const dataValues = new Map<string, string>();
      
      // Process analytics rows
      analyticsMapData.rows.forEach(row => {
        if (row && row.length >= 3) {
          const identifier = row[1]; // This might be districtId, period, or some other identifier
          const value = row[2];
          dataValues.set(identifier, value);
        }
      });
      
      // Store the value map for later use
      setValueMap(dataValues);
      
      const processedDistricts = geoFeaturesData.map(district => {
        // Safety check for district object
        if (!district || !district.co || !district.id || !district.na) {
          return null;
        }
        
        // Parse the coordinates string to GeoJSON format
        const coordinates = parseCoordinates(district.co);
        
        // For your current data, we have just one value
        // In a more complex scenario, you would look up the value based on district ID
        let value = null;
        if (analyticsMapData.rows.length === 1 && analyticsMapData.rows[0] && analyticsMapData.rows[0][2]) {
          value = parseFloat(analyticsMapData.rows[0][2]);
        } else {
          const districtValue = dataValues.get(district.id);
          value = districtValue ? parseFloat(districtValue) : null;
        }
        
        return {
          id: district.id,
          name: district.na,
          value: value,
          coordinates: coordinates,
          code: district.code || "",
          region: district.pn || ""
        };
      }).filter(Boolean) as ProcessedDistrict[]; // Filter out any nulls
      
      setDistricts(processedDistricts);
      
      // Calculate and set map center position based on districts with data
      const center = calculateMapCenter(processedDistricts);
      setCenterPosition(center);
      
      // Check if we have any districts with actual data values
      const districtsWithData = processedDistricts.filter(d => d.value !== null);
      setHasDataToDisplay(districtsWithData.length > 0);
      
      // Generate automatic legend only if we have valid districts with values
      if (processedDistricts.length > 0) {
        const legend = generateAutoLegend(processedDistricts);
        setAutoLegend(legend);
      }
    } catch (error) {
      console.error("Error processing map data:", error);
    }
  }, [geoFeaturesData, analyticsMapData, metaMapData]);
  
  // Generate automatic legend based on data values

  
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
    if (!analyticsMapData || !analyticsMapData.rows) return;
    
    const props = feature.properties;
    
    // For your current data, we have just one value, so we'll use that
    // In a more complex scenario, you would look up the value based on district ID
    let displayValue;
    
    // Check if we have multiple rows or just one
    if (analyticsMapData.rows.length === 1) {
      // If we have just one row, use that value for all districts
      displayValue = analyticsMapData.rows[0] && analyticsMapData.rows[0][2] ? analyticsMapData.rows[0][2] : 'No data';
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

  // Initial view state for the MapContainer
  // Set a moderate default zoom level
  const defaultZoom = 8; // Reduced from 14 to 8 for initial view

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <MapSidebar 
        basemaps={BASEMAPS}
        currentBasemap={currentBasemap}
        onBasemapChange={setCurrentBasemap}
      />

      {/* Map Container */}
      <div className="flex-grow h-full">
        {/* Only show legend controls if we have district data */}
        {districts.length > 0 && <LegendControls />}
        
        <div className="h-full w-full relative">
          {/* Always show map with base layer */}
          <MapContainer 
            center={centerPosition} 
            zoom={defaultZoom} 
            className="h-full w-full"
          >
            {/* Base Layer from MapBody */}
            <TileLayer
              url={BASEMAPS[currentBasemap].url}
              attribution={BASEMAPS[currentBasemap].attribution}
            />
            
            {/* District Layer only if we have district data */}
            {districts.length > 0 && (
              <GeoJSON 
                data={createGeoJSON()}
                style={getStyle}
                onEachFeature={onEachFeature}
              />
            )}
            
            {/* MapUpdater component to handle auto zooming to data areas */}
            <MapUpdater districts={districts} hasData={hasDataToDisplay} />
          </MapContainer>
          
          {/* Legend only if we have district data */}
          {districts.length > 0 && <Legend />}
          
          {/* Show a subtle notification if data is processed but no districts are found */}
          {dataProcessed && districts.length === 0 && (
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              padding: '8px 12px',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '4px',
              boxShadow: '0 1px 5px rgba(0,0,0,0.2)',
              zIndex: 1000
            }}>
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapBody;