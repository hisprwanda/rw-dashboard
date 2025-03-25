import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import icon fix
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Imported components
import MapSidebar from './MapSideBar';
import MapLegend from './MapLegend';
import LegendControls from './LegendControls';

import { BasemapType, ProcessedDistrict, Legend, LegendClass } from '../../../types/maps';
import { BASEMAPS,sampleLegends } from '../constants';
import { generateAutoLegend,  calculateMapCenter, 
  parseCoordinates, 
  getColorForValue, 
  createGeoJSON, 
  onEachFeature  } from '../../../lib/mapHelpers';

// Fix for default marker icon
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

type MapBodyProps = {
  geoFeaturesData: any;
  analyticsMapData: any;
  metaMapData: any;
  singleSavedMapData?: any;
  mapId?: string;
}

const MapBody: React.FC<MapBodyProps> = ({
  analyticsMapData,
  geoFeaturesData,
  metaMapData,
  singleSavedMapData,
  mapId
}) => {
  // State management
  const [currentBasemap, setCurrentBasemap] = useState<BasemapType>('osm-light');
  const [districts, setDistricts] = useState<ProcessedDistrict[]>([]);
  const [valueMap, setValueMap] = useState<Map<string, string>>(new Map());
  const [legendType, setLegendType] = useState<string>("auto");
  const [selectedLegendSet, setSelectedLegendSet] = useState<Legend>(sampleLegends[0]);
  const [autoLegend, setAutoLegend] = useState<LegendClass[]>([]);
  const [centerPosition, setCenterPosition] = useState<[number, number]>([-1.9403, 30.0578]);
  const [dataProcessed, setDataProcessed] = useState<boolean>(false);
  const [hasDataToDisplay, setHasDataToDisplay] = useState<boolean>(false);

  // Default view settings
  const defaultZoom = 8;

  // Main data processing effect
  useEffect(() => {
    console.log({ geoFeaturesData, analyticsMapData, metaMapData });
    
    setDataProcessed(true);
    
    // Data validation checks
    if (!geoFeaturesData?.length || !analyticsMapData?.rows || !metaMapData) {
      console.log("Insufficient map data");
      return;
    }
    
    try {
      // Data processing logic (similar to original)
      const dataValues = new Map<string, string>();
      
      analyticsMapData.rows.forEach(row => {
        if (row && row.length >= 3) {
          const identifier = row[1];
          const value = row[2];
          dataValues.set(identifier, value);
        }
      });
      
      setValueMap(dataValues);
      
      const processedDistricts = geoFeaturesData
        .map(district => {
          if (!district?.co || !district?.id || !district?.na) return null;
          
          const coordinates = parseCoordinates(district.co);
          const value = dataValues.get(district.id) 
            ? parseFloat(dataValues.get(district.id)!)
            : null;
          
          return {
            id: district.id,
            name: district.na,
            value: value,
            coordinates: coordinates,
            code: district.code || "",
            region: district.pn || ""
          };
        })
        .filter(Boolean) as ProcessedDistrict[];
      
      setDistricts(processedDistricts);
      
      // Calculate center and set other states
      const center = calculateMapCenter(processedDistricts);
      setCenterPosition(center);
      
      const districtsWithData = processedDistricts.filter(d => d.value !== null);
      setHasDataToDisplay(districtsWithData.length > 0);
      
      if (processedDistricts.length > 0) {
        const legend = generateAutoLegend(processedDistricts);
        setAutoLegend(legend);
      }
    } catch (error) {
      console.error("Error processing map data:", error);
    }
  }, [geoFeaturesData, analyticsMapData, metaMapData]);

  // Style function for GeoJSON
  const getStyle = (feature: any) => {
    const value = feature.properties.value;
    const color = getColorForValue(
      value, 
      legendType === "auto" ? autoLegend : selectedLegendSet.legends
    );
    
    return {
      fillColor: color,
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7
    };
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <MapSidebar 
        basemaps={BASEMAPS}
        currentBasemap={currentBasemap}
        onBasemapChange={setCurrentBasemap}
        singleSavedMapData={singleSavedMapData}
        mapId={mapId}
      />

      {/* Map Container */}
      <div className="flex-grow h-full">
        {/* Legend Controls */}
        {districts.length > 0 && (
          <LegendControls
            legendType={legendType}
            setLegendType={setLegendType}
            selectedLegendSet={selectedLegendSet}
            setSelectedLegendSet={setSelectedLegendSet}
            sampleLegends={sampleLegends}
          />
        )}
        
        <div className="h-full w-full relative">
          <MapContainer 
            center={centerPosition} 
            zoom={defaultZoom} 
            className="h-full w-full"
          >
            {/* Base Layer */}
            <TileLayer
              url={BASEMAPS[currentBasemap].url}
              attribution={BASEMAPS[currentBasemap].attribution}
            />
            
            {/* District Layer */}
            {districts.length > 0 && (
              <GeoJSON 
                data={createGeoJSON(districts)}
                style={getStyle}
                onEachFeature={(feature, layer) => 
                  onEachFeature(feature, layer, analyticsMapData, valueMap)
                }
              />
            )}
          </MapContainer>
          
          {/* Legend */}
          {districts.length > 0 && (
            <MapLegend
              legendType={legendType}
              autoLegend={autoLegend}
              selectedLegendSet={selectedLegendSet}
            />
          )}
          
          {/* No Data Notification */}
          {dataProcessed && districts.length === 0 && (
            <div className="absolute bottom-10 left-10 p-2 bg-white/80 rounded-md shadow-md z-50">
              No data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapBody;