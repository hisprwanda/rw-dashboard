import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import icon fix
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Imported components
import MapSidebar from './MapSideBar';
import MapLegend from './MapLegend';
import { MapLabels } from './MapLabels';


import { BasemapType, ProcessedDistrict, Legend, LegendClass } from '../../../types/maps';
import { BASEMAPS, sampleLegends } from '../constants';
import { 
  generateAutoLegend,
  calculateMapCenter,
  parseCoordinates,
  getColorForValue,
  createGeoJSON,
  onEachFeature
} from '../../../lib/mapHelpers';
import { useAuthorities } from '../../../context/AuthContext';

// Fix for default marker icon
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Map View Updater Component
const MapViewUpdater: React.FC<{
  center: [number, number],
  zoom: number,
  geoJsonData: any
}> = ({ center, zoom, geoJsonData }) => {
  const map = useMap();
  
  useEffect(() => {
    if (geoJsonData && Object.keys(geoJsonData).length > 0) {
      try {
        // Create a GeoJSON layer to calculate bounds
        const geoLayer = L.geoJSON(geoJsonData);
        const bounds = geoLayer.getBounds();
        
        // Only fit bounds if the bounds are valid
        if (bounds.isValid()) {
          map.fitBounds(bounds);
          return; // Exit early since we've set the bounds
        }
      } catch (error) {
        console.error("Error fitting bounds:", error);
      }
    }
    
    // Fallback to center and zoom if bounds fitting fails or no GeoJSON
    map.setView(center, zoom);
  }, [map, center, zoom, geoJsonData]);

  return null;
};

type MapBodyProps = {
  geoFeaturesData: any;
  analyticsMapData: any;
  metaMapData: any;
  singleSavedMapData?: any;
  mapId?: string;
  isHideSideBar?: boolean;
  mapName?: string;
}

const MapBody: React.FC<MapBodyProps> = ({
  analyticsMapData,
  geoFeaturesData,
  metaMapData,
  singleSavedMapData,
  mapId,
  isHideSideBar,
  mapName
}) => {
  // State management
  const [currentBasemap, setCurrentBasemap] = useState<BasemapType>('osm-light');
  const [districts, setDistricts] = useState<ProcessedDistrict[]>([]);
  const [valueMap, setValueMap] = useState<Map<string, string>>(new Map());
  const [legendType, setLegendType] = useState<string>("auto");
  const [selectedLegendSet, setSelectedLegendSet] = useState<Legend>(sampleLegends[0]);
  const [autoLegend, setAutoLegend] = useState<LegendClass[]>([]);
  const [centerPosition, setCenterPosition] = useState<[number, number]>([0, 28]);
  const [zoomLevel, setZoomLevel] = useState<number>(2);
  const [dataProcessed, setDataProcessed] = useState<boolean>(false);
  const [hasDataToDisplay, setHasDataToDisplay] = useState<boolean>(false);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const { mapAnalyticsQueryTwo } = useAuthorities();
  const [appliedLabels, setAppliedLabels] = useState<string[]>([]);
  
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
      // Data processing logic
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
      
      // Generate GeoJSON data
      const generatedGeoJson = createGeoJSON(processedDistricts);
      setGeoJsonData(generatedGeoJson);
      
      // Calculate center and set zoom
      if (processedDistricts.length > 0) {
        const center = calculateMapCenter(processedDistricts);
        setCenterPosition(center);
        
        // Set a higher zoom level when we have specific coordinates
        setZoomLevel(19);
        
        const legend = generateAutoLegend(processedDistricts);
        setAutoLegend(legend);
      } else {
        // Default values when no districts are available
        setCenterPosition([0, 28]);
        setZoomLevel(2);
      }
      
      const districtsWithData = processedDistricts.filter(d => d.value !== null);
      setHasDataToDisplay(districtsWithData.length > 0);
    } catch (error) {
      console.error("Error processing map data:", error);
    }
  }, [geoFeaturesData, analyticsMapData, metaMapData]);

  // Style function for GeoJSON
  const getStyleOne = (feature: any) => {
    const value = feature.properties.value;
    
    // Add explicit type checking and fallback
    const legendClasses = legendType === "auto" 
      ? (autoLegend || []) 
      : (selectedLegendSet?.legends || []);
    
    const color = getColorForValue(value, legendClasses);
    
    return {
      fillColor: color,
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7
    };
  };

  return (
    <div className="flex flex-1 h-full w-full">
      {/* Sidebar */}
      {!isHideSideBar && (
        <MapSidebar 
          basemaps={BASEMAPS}
          currentBasemap={currentBasemap}
          onBasemapChange={setCurrentBasemap}
          singleSavedMapData={singleSavedMapData}
          mapId={mapId}
          appliedLabels={appliedLabels}
          setAppliedLabels={setAppliedLabels}
        >
        </MapSidebar>
      )}

      {/* Map Container */}
      <div className="flex-grow h-full">
        {/* Legend Controls */}
        {!isHideSideBar && (
          <>
            {districts.length > 0 && (
              <p></p>
            )}
          </>
        )}
      
        <div className="h-full w-full relative">
          {/* Map Title */}
          {mapName && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] text-center font-bold text-xl text-gray-800 bg-white bg-opacity-80 px-4 py-1 rounded shadow-md">
              {mapName}
            </div>
          )}

          <MapContainer 
            center={centerPosition} 
            zoom={zoomLevel} 
            zoomAnimation={false}
            className="h-full w-full"
          >
            {/* Base Layer */}
            <TileLayer
              url={BASEMAPS[currentBasemap].url}
              attribution={BASEMAPS[currentBasemap].attribution}
            />
            
            {/* Map View Updater */}
            <MapViewUpdater 
              center={centerPosition}
              zoom={zoomLevel}
              geoJsonData={geoJsonData}
            />
            
            {/* District Layer */}
            {districts.length > 0 && geoJsonData && (
              <GeoJSON 
                data={geoJsonData}
                style={getStyleOne}
                onEachFeature={(feature, layer) => 
                  onEachFeature(feature, layer, analyticsMapData, valueMap, metaMapData, mapAnalyticsQueryTwo)
                }
              />
            )}
            
             {/* Permanent Labels */}
             {districts.length > 0 && geoJsonData && appliedLabels.length > 0 && (
              <MapLabels
                geoJsonData={geoJsonData}
                appliedLabels={appliedLabels}
                analyticsMapData={analyticsMapData}
                valueMap={valueMap}
                metaMapData={metaMapData}
                mapAnalyticsQueryTwo={mapAnalyticsQueryTwo}
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