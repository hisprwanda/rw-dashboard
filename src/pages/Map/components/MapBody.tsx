import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
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

// New Label Controls Component
const LabelControls: React.FC<{
  labelOptions: Array<{id: string, label: string}>,
  selectedLabels: string[],
  onChange: (labels: string[]) => void,
  onApply: () => void
}> = ({ labelOptions, selectedLabels, onChange, onApply }) => {
  
  const handleCheckboxChange = (labelId: string) => {
    const updatedLabels = selectedLabels.includes(labelId)
      ? selectedLabels.filter(id => id !== labelId)
      : [...selectedLabels, labelId];
    
    onChange(updatedLabels);
  };

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white p-3 rounded-md shadow-lg">
      <h3 className="font-bold mb-2">Show Labels</h3>
      
      {labelOptions.map(option => (
        <div key={option.id} className="flex items-center mb-1">
          <input
            type="checkbox"
            id={option.id}
            checked={selectedLabels.includes(option.id)}
            onChange={() => handleCheckboxChange(option.id)}
            className="mr-2"
          />
          <label htmlFor={option.id}>{option.label}</label>
        </div>
      ))}
      
      <button 
        onClick={onApply}
        className="mt-2 bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 w-full"
      >
        Apply
      </button>
    </div>
  );
};

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

// New component to manage permanent labels
const MapLabels: React.FC<{
  geoJsonData: any,
  appliedLabels: string[],
  analyticsMapData: any,
  valueMap: Map<string, string>,
  metaMapData: any,
  mapAnalyticsQueryTwo: any
}> = ({ 
  geoJsonData, 
  appliedLabels, 
  analyticsMapData, 
  valueMap, 
  metaMapData, 
  mapAnalyticsQueryTwo 
}) => {
  const map = useMap();
  const labelsRef = useRef<L.Layer[]>([]);

  // Clean up any existing labels
  useEffect(() => {
    return () => {
      labelsRef.current.forEach(label => {
        if (map && label) {
          map.removeLayer(label);
        }
      });
      labelsRef.current = [];
    };
  }, [map]);

  // Create or update labels when applied labels change
  useEffect(() => {
    if (!map || !geoJsonData || appliedLabels.length === 0) return;

    // Clear existing labels
    labelsRef.current.forEach(label => {
      if (map && label) {
        map.removeLayer(label);
      }
    });
    labelsRef.current = [];

    // Skip if no labels to show
    if (appliedLabels.length === 0) return;

    // Process each feature in the GeoJSON
    geoJsonData.features.forEach((feature: any) => {
      // Get feature geometry
      if (!feature?.geometry?.coordinates) return;
      
      // Get feature properties
      const props = feature.properties;
      
      // Skip if no props
      if (!props) return;
      
      // Calculate center point for the feature
      let center;
      
      try {
        // Calculate center depending on geometry type
        if (feature.geometry.type === 'Polygon') {
          const polygon = L.polygon(feature.geometry.coordinates[0].map((c: number[]) => [c[1], c[0]]));
          center = polygon.getBounds().getCenter();
        } else if (feature.geometry.type === 'MultiPolygon') {
          const polygons = feature.geometry.coordinates.map((poly: number[][][]) => 
            poly[0].map((c: number[]) => [c[1], c[0]])
          );
          const multiPolygon = L.polygon(polygons);
          center = multiPolygon.getBounds().getCenter();
        } else {
          // Skip non-polygon features
          return;
        }
      } catch (error) {
        console.error("Error calculating center:", error);
        return;
      }
      
      // Get label data
      const selectedDataId = mapAnalyticsQueryTwo?.myData?.params?.dimension?.find((d: string) => d.startsWith("dx:"))?.split(":")[1];
      const selectedDataName = metaMapData?.metaData?.items?.[selectedDataId]?.name;
      const filter = mapAnalyticsQueryTwo?.myData?.params?.filter;
      const selectedPeriod = filter?.startsWith("pe:") ? filter.split("pe:")[1].replace(/_/g, " ") : null;
      const selectedAreaName = props.name;
      
      let displayValue;
      if (analyticsMapData.rows.length === 1) {
        displayValue = analyticsMapData.rows[0]?.[2] || 'No data';
      } else {
        displayValue = valueMap.get(props.id) || 'No data';
      }

      // Create label content based on selected options
      let labelContent = '';
      if (appliedLabels.includes('area')) labelContent += `${selectedAreaName}${appliedLabels.length > 1 ? '<br>' : ''}`;
      if (appliedLabels.includes('data') && selectedDataName) {
        labelContent += `${selectedDataName}${(appliedLabels.includes('period') || appliedLabels.includes('value')) ? '<br>' : ''}`;
      }
      if (appliedLabels.includes('period') && selectedPeriod) {
        labelContent += `${selectedPeriod}${appliedLabels.includes('value') ? '<br>' : ''}`;
      }
      if (appliedLabels.includes('value')) labelContent += `${displayValue}`;

      // Create a div icon with the label
      if (labelContent && center) {
        const icon = L.divIcon({
          html: `<div class="map-permanent-label">${labelContent}</div>`,
          className: 'map-label-icon',
          iconSize: [100, 40],
          iconAnchor: [50, 20]
        });

        // Add the marker with the label
        const marker = L.marker(center, { icon }).addTo(map);
        labelsRef.current.push(marker);
      }
    });

    // Add CSS for the labels
    if (!document.getElementById('map-label-styles')) {
      const style = document.createElement('style');
      style.id = 'map-label-styles';
      style.innerHTML = `
        .map-permanent-label {
          background-color: white;
          padding: 2px 5px;
          border-radius: 3px;
          font-size: 10px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.3);
          pointer-events: none;
          text-align: center;
          white-space: nowrap;
        }
        .map-label-icon {
          background: none;
          border: none;
        }
      `;
      document.head.appendChild(style);
    }
  }, [map, geoJsonData, appliedLabels, analyticsMapData, valueMap, metaMapData, mapAnalyticsQueryTwo]);

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
  
  // Label controls state
  const [showLabelControls, setShowLabelControls] = useState<boolean>(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [appliedLabels, setAppliedLabels] = useState<string[]>([]);
  const [labelOptions] = useState([
    { id: 'area', label: 'Area Name' },
    { id: 'data', label: 'Data Name' },
    { id: 'period', label: 'Period' },
    { id: 'value', label: 'Value' }
  ]);

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

  // Apply selected labels
  const handleApplyLabels = () => {
    setAppliedLabels([...selectedLabels]);
    setShowLabelControls(false);
  };

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
        />
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

          {/* Show Labels Button */}
          {districts.length > 0 && (
            <div className="absolute top-4 right-4 z-[999]">
              <button 
                onClick={() => setShowLabelControls(!showLabelControls)}
                className="bg-white px-3 py-1 rounded-md shadow-md hover:bg-gray-100"
              >
                {showLabelControls ? 'Hide Label Options' : 'Show Labels'}
              </button>
            </div>
          )}

          {/* Label Control Panel */}
          {showLabelControls && (
            <LabelControls 
              labelOptions={labelOptions}
              selectedLabels={selectedLabels}
              onChange={setSelectedLabels}
              onApply={handleApplyLabels}
            />
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