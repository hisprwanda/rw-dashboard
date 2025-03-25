import React, { useEffect, useCallback } from "react";
import { useMap } from 'react-leaflet';
import L from 'leaflet';

type MapUpdaterProps = {
  districts: Array<{
    id: string;
    name: string;
    value: number | null;
    coordinates: any // Make this more flexible
  }>;
  hasData: boolean;
};

export const MapUpdater: React.FC<MapUpdaterProps> = ({ districts, hasData }) => {
  const map = useMap();

  const fitMapToBounds = useCallback(() => {
    // Debugging: Log the entire districts array
    console.log('Districts data:', districts);

    // Ensure map is fully initialized
    if (!map || !hasData || districts.length === 0) return;

    // Filter districts with data
    const districtsWithData = districts.filter(d => d.value !== null);
    
    if (districtsWithData.length === 0) return;

    // Initialize bounds tracking
    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;

    // Helper function to process different coordinate formats
    const processCoordinates = (coords: any) => {
      // Debugging: Log the coordinate structure
      console.log('Coordinate structure:', coords);

      // Handle different possible coordinate formats
      if (typeof coords === 'string') {
        try {
          coords = JSON.parse(coords);
        } catch (error) {
          console.error('Error parsing coordinate string:', error);
          return;
        }
      }

      // If it's a single coordinate point
      if (coords.length === 2 && typeof coords[0] === 'number' && typeof coords[1] === 'number') {
        minLat = Math.min(minLat, coords[1]);
        maxLat = Math.max(maxLat, coords[1]);
        minLng = Math.min(minLng, coords[0]);
        maxLng = Math.max(maxLng, coords[0]);
        return;
      }

      // Recursive processing for nested arrays
      coords.forEach((item: any) => {
        if (Array.isArray(item)) {
          processCoordinates(item);
        }
      });
    };

    // Process coordinates for each district
    districtsWithData.forEach(district => {
      try {
        processCoordinates(district.coordinates);
      } catch (error) {
        console.error('Error processing district coordinates:', district, error);
      }
    });

    // Check if we have valid bounds
    if (
      minLat !== Infinity && 
      maxLat !== -Infinity && 
      minLng !== Infinity && 
      maxLng !== -Infinity
    ) {
      try {
        // Create bounds manually
        const bounds = L.latLngBounds(
          L.latLng(minLat, minLng),
          L.latLng(maxLat, maxLng)
        );

        // Use setTimeout to ensure map is fully ready
        setTimeout(() => {
          // Ensure map is still valid
          if (map && map.getCenter) {
            map.fitBounds(bounds, {
              padding: [50, 50],
              maxZoom: 10,
              animate: true
            });
          }
        }, 0);
      } catch (error) {
        console.error("Error fitting bounds:", error);
      }
    } else {
      console.warn('Could not calculate bounds from districts');
    }
  }, [map, districts, hasData]);

  // Use two effects to ensure robust initialization
  useEffect(() => {
    // Defer the initial fitting
    const timeoutId = setTimeout(fitMapToBounds, 100);
    return () => clearTimeout(timeoutId);
  }, [fitMapToBounds]);

  return null;
};

export default MapUpdater;