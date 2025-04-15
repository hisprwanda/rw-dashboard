// MapLabels.tsx
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';


// Label Controls Component
export const LabelControls: React.FC<{
  labelOptions: Array<{id: string, label: string}>,
  selectedLabels: string[],
  onChange: (labels: string[]) => void,
  onApply: () => void,
  onClose: () => void
}> = ({ labelOptions, selectedLabels, onChange, onApply, onClose }) => {
  
  const handleCheckboxChange = (labelId: string) => {
    const updatedLabels = selectedLabels.includes(labelId)
      ? selectedLabels.filter(id => id !== labelId)
      : [...selectedLabels, labelId];
    
    onChange(updatedLabels);
    // We'll let the parent component handle applying changes through useEffect
  };

  return (
    <div className="bg-white p-3 rounded-md shadow-lg">
      
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
    </div>
  );
};

// Permanent labels component
export const MapLabels: React.FC<{
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