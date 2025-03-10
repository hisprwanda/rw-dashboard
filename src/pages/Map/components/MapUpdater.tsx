import { useEffect } from "react";
import L from 'leaflet';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
// MapUpdater component to handle zooming to data areas
export const MapUpdater = ({ districts, hasData }) => {
  const map = useMap();
  
  useEffect(() => {
    if (hasData && districts.length > 0) {
      // Filter to only districts that have data values
      const districtsWithData = districts.filter(d => d.value !== null);
      
      if (districtsWithData.length > 0) {
        // Create a GeoJSON layer with all districts that have data
        const geoJsonLayer = L.geoJSON({
          type: 'FeatureCollection',
          features: districtsWithData.map(district => ({
            type: 'Feature',
            properties: {
              id: district.id,
              name: district.name,
              value: district.value
            },
            geometry: {
              type: 'Polygon',
              coordinates: district.coordinates
            }
          }))
        });
        
        // Get the bounds of all districts with data
        const bounds = geoJsonLayer.getBounds();
        
        // First zoom to fit the data (initial focus)
        map.fitBounds(bounds, {
          padding: [20, 20],
          maxZoom: 10, // Lower initial zoom for context
          animate: true,
          duration: 1.0
        });
        
        // Then zoom in closer after a delay
        setTimeout(() => {
          // Calculate a slightly tighter bound (75% of original size)
          const center = bounds.getCenter();
          const northWest = bounds.getNorthWest();
          const southEast = bounds.getSouthEast();
          
          // Calculate new bounds that are 75% of the size, centered on data
          const shrinkFactor = 0.75;
          const newNW = L.latLng(
            center.lat + (northWest.lat - center.lat) * shrinkFactor,
            center.lng + (northWest.lng - center.lng) * shrinkFactor
          );
          const newSE = L.latLng(
            center.lat + (southEast.lat - center.lat) * shrinkFactor,
            center.lng + (southEast.lng - center.lng) * shrinkFactor
          );
          
          // Create the new tighter bounds
          const tighterBounds = L.latLngBounds(newNW, newSE);
          
          // Apply second zoom with tighter bounds
          map.fitBounds(tighterBounds, {
            padding: [30, 30],
            maxZoom: 14, // Moderate zoom level
            animate: true,
            duration: 1.0
          });
        }, 1000);
        
        // Clean up the temporary layer
        geoJsonLayer.remove();
      }
    }
  }, [map, districts, hasData]);
  
  return null;
};