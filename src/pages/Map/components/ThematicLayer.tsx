import React, { useEffect, useState } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ThematicLayer component to display district data
const ThematicLayer = ({ geoFeaturesData, analyticsData, metaData }) => {
  const map = useMap();
  const [thematicData, setThematicData] = useState(null);

  useEffect(() => {
    if (geoFeaturesData && analyticsData) {
      processData();
    }
  }, [geoFeaturesData, analyticsData]);

  // Process and combine the data
  const processData = () => {
    // Create GeoJSON from the geoFeatures data
    const features = geoFeaturesData.map(feature => {
      // Fix the coordinate string format (remove extra brackets and parse)
      let coordinates;
      try {
        // The coordinates in the sample data have malformed JSON, this tries to fix it
        const coordStr = feature.co.replace(/\]\]\]\]/g, ']]').replace(/\]\]\]/g, ']]');
        coordinates = JSON.parse(coordStr);
      } catch (e) {
        console.error(`Error parsing coordinates for ${feature.na}:`, e);
        coordinates = [];
      }

      return {
        type: 'Feature',
        id: feature.id,
        properties: {
          id: feature.id,
          name: feature.na,
          code: feature.code,
          level: feature.le,
          parent: feature.pn,
          value: 0 // Default value, will be updated if analytics data exists
        },
        geometry: {
          type: 'Polygon',
          coordinates: coordinates
        }
      };
    });

    // If we have analytics data with rows, process each row
    if (analyticsData && analyticsData.rows && analyticsData.rows.length > 0) {
      // Map values from analytics to the features
      const dataIndex = 2; // Value is in the 3rd position (index 2) of each row in the sample
      
      analyticsData.rows.forEach(row => {
        // Find the matching feature and update its value
        const valueToAssign = parseFloat(row[dataIndex]);
        
        // We need to map the data to the appropriate feature
        // In this simplified example, we assume the first value applies to the first district
        // In a real implementation, you'd match by the district ID
        if (features.length > 0) {
          features[0].properties.value = valueToAssign;
        }
      });
    }

    // Create the GeoJSON object
    const geoJsonData = {
      type: 'FeatureCollection',
      features: features
    };

    setThematicData(geoJsonData);
  };

  // Style function for the GeoJSON layer
  const getStyle = (feature) => {
    const value = feature.properties.value;
    
    // Create a color scale based on values
    // For this example using a simple blue scale
    const getColor = (d) => {
      return d > 900 ? '#08306b' :
             d > 700 ? '#08519c' :
             d > 500 ? '#2171b5' :
             d > 300 ? '#4292c6' :
             d > 100 ? '#6baed6' :
                      '#c6dbef';
    };

    return {
      fillColor: getColor(value),
      weight: 1,
      opacity: 1,
      color: 'white',
      fillOpacity: 0.7
    };
  };

  // Event handlers for the GeoJSON layer
  const onEachFeature = (feature, layer) => {
    const popupContent = `
      <div>
        <h3>${feature.properties.name}</h3>
        <p>Value: ${feature.properties.value}</p>
      </div>
    `;
    layer.bindPopup(popupContent);

    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 2,
          color: '#666',
          fillOpacity: 0.9
        });
        layer.bringToFront();
      },
      mouseout: (e) => {
        const layer = e.target;
        layer.setStyle(getStyle(feature));
      },
      click: (e) => {
        map.fitBounds(e.target.getBounds());
      }
    });
  };

  return thematicData ? (
    <GeoJSON 
      data={thematicData} 
      style={getStyle}
      onEachFeature={onEachFeature}
    />
  ) : null;
};

export default ThematicLayer;