import {ProcessedDistrict,LegendClass} from "../types/maps"
  // Generate automatic legend based on data values
export const generateAutoLegend = (districts: ProcessedDistrict []) => {
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
        color: "#FEE5D9" // Light red/pink
      },
      {
        name: "Low",
        startValue: min + step,
        endValue: min + 2 * step,
        color: "#FC9272" // Soft red
      },
      {
        name: "Medium",
        startValue: min + 2 * step,
        endValue: min + 3 * step,
        color: "#FB6A4A" // Medium red
      },
      {
        name: "High",
        startValue: min + 3 * step,
        endValue: min + 4 * step,
        color: "#DE2D26" // Deep red
      },
      {
        name: "Very High",
        startValue: min + 4 * step,
        endValue: max,
        color: "#A50F15" // Dark red
      }
    ];
    
    
    return autoLegend
   // setAutoLegend(autoLegend);
  };
  
// Calculate map center from district coordinates
export const calculateMapCenter = (districts: ProcessedDistrict[]): [number, number] => {
  if (!districts || districts.length === 0) {
    return [-1.9403, 30.0578]; // Default center for Rwanda
  }
  
  const validDistricts = districts.filter(d => 
    d.coordinates && 
    Array.isArray(d.coordinates) && 
    d.coordinates.length > 0
  );
  
  if (validDistricts.length === 0) {
    return [-1.9403, 30.0578];
  }
  
  let latSum = 0;
  let lonSum = 0;
  let pointCount = 0;
  
  validDistricts.forEach(district => {
    if (district.coordinates) {
      district.coordinates.forEach(polygon => {
        if (polygon && polygon.length > 0) {
          // Handle the first point of each polygon
          if (Array.isArray(polygon[0])) {
            lonSum += polygon[0][0];
            latSum += polygon[0][1];
            pointCount++;
          }
        }
      });
    }
  });
  
  return pointCount > 0 
    ? [latSum / pointCount, lonSum / pointCount] 
    : [-1.9403, 30.0578];
};


// Parse coordinates string to GeoJSON format with consistent polygon output
export const parseCoordinates = (coordinatesString: string): any => {
  try {
    // Parse the original string without modifying it
    const parsed = JSON.parse(coordinatesString);
    
    // Handle simple point coordinates [lon, lat]
    if (Array.isArray(parsed) && parsed.length === 2 && 
        typeof parsed[0] === 'number' && typeof parsed[1] === 'number') {
      // Convert point to small polygon
      const lon = parsed[0];
      const lat = parsed[1];
      const offset = 0.005; // ~500m at equator
      
      // Create a small square polygon around the point
      return [
        [
          [lon - offset, lat - offset],
          [lon + offset, lat - offset], 
          [lon + offset, lat + offset],
          [lon - offset, lat + offset],
          [lon - offset, lat - offset] // Close the polygon
        ]
      ];
    }
    
    // Determine the nesting level
    const checkDepth = (arr: any[]): number => {
      if (!Array.isArray(arr)) return 0;
      if (arr.length === 0) return 1;
      return 1 + checkDepth(arr[0]);
    };
    
    const depth = checkDepth(parsed);
    
    // Handle different coordinate structures based on nesting depth
    if (depth === 4) {
      // MultiPolygon format: [[[[x,y],[x,y]...]]]
      return parsed;
    } else if (depth === 3) {
      // Polygon format: [[[x,y],[x,y]...]]
      return parsed;
    } else if (depth === 2) {
      // LineString format: [[x,y],[x,y]...]
      // Convert to Polygon format
      return [parsed];
    } else {
      console.warn('Unexpected coordinate format:', coordinatesString);
      return [[[0, 0]]];
    }
  } catch (e) {
    console.error('Error parsing coordinates:', e, coordinatesString);
    return [[[0, 0]]];
  }
};

// Get color for a value based on legend classes
export const getColorForValue = (
  value: number | null, 
  legendClasses: LegendClass[] | undefined
): string => {
  // If value is null or legendClasses is undefined, return default white
  if (value === null || !legendClasses) return "#FFFFFF";
  
  // Ensure legendClasses is an array with at least one element
  if (!Array.isArray(legendClasses) || legendClasses.length === 0) {
    console.warn('Invalid legend classes provided', legendClasses);
    return "#FFFFFF";
  }
  
  for (const legendClass of legendClasses) {
    if (value >= legendClass.startValue && value <= legendClass.endValue) {
      return legendClass.color;
    }
  }
  
  return "#FFFFFF";
};
// Convert processed districts to GeoJSON - ensure all are displayed as polygons
export const createGeoJSON = (districts: ProcessedDistrict[]) => {
  return {
    type: 'FeatureCollection',
    features: districts.map(district => {
      if (!district.coordinates) {
        console.warn(`District ${district.name} has no coordinates`);
        return null;
      }
      
      let coordinates = district.coordinates;
      let geometryType = 'Polygon';
      
      // Handle point coordinates [lon, lat] - convert to small polygon
      if (Array.isArray(coordinates) && 
          coordinates.length === 2 && 
          typeof coordinates[0] === 'number' && 
          typeof coordinates[1] === 'number') {
        
        // Convert point to small polygon (0.01 degree square around the point)
        const lon = coordinates[0];
        const lat = coordinates[1];
        const offset = 0.005; // approximately 500m at equator
        
        // Create a small square polygon around the point
        coordinates = [
          [
            [lon - offset, lat - offset],
            [lon + offset, lat - offset],
            [lon + offset, lat + offset],
            [lon - offset, lat + offset],
            [lon - offset, lat - offset] // Close the polygon
          ]
        ];
        
        geometryType = 'Polygon';
      } 
      // Check for MultiPolygon structure
      else if (Array.isArray(coordinates) && 
               Array.isArray(coordinates[0]) && 
               Array.isArray(coordinates[0][0]) && 
               Array.isArray(coordinates[0][0][0])) {
        geometryType = 'MultiPolygon';
      }
      
      return {
        type: 'Feature',
        properties: {
          id: district.id,
          name: district.name,
          value: district.value,
          code: district.code,
          region: district.region
        },
        geometry: {
          type: geometryType,
          coordinates: coordinates
        }
      };
    }).filter(Boolean) // Remove any null features
  };
};


// Function to detect and fix issues with organization units
export const syncOrganizationUnits = (
  analyticsMapData: any, 
  geoFeaturesData: any[],
  metaMapData: any
) => {
  if (!analyticsMapData?.rows || !metaMapData?.metaData?.dimensions?.ou) {
    return;
  }
  
  // Get all organization unit IDs from analytics data
  const analyticsOrgUnits = new Set<string>();
  analyticsMapData.rows.forEach((row: any[]) => {
    if (row && row.length >= 2) {
      analyticsOrgUnits.add(row[1]);
    }
  });
  
  // Get all organization unit IDs from metaMapData dimensions
  const dimensionOrgUnits = new Set(metaMapData.metaData.dimensions.ou);
  
  // Make sure all analytics org units are included in dimensions
  analyticsOrgUnits.forEach(id => {
    if (!dimensionOrgUnits.has(id)) {
      metaMapData.metaData.dimensions.ou.push(id);
    }
  });
  
  // Return the updated metaMapData
  return metaMapData;
};

// Popup content for district features
export const onEachFeature = (
  feature: any, 
  layer: any, 
  analyticsMapData: any, 
  valueMap: Map<string, string>,
  metaMapData: any,
  mapAnalyticsQueryTwo: any
) => {
  console.log("hhelmmo", mapAnalyticsQueryTwo);

  if (!analyticsMapData?.rows) return;
  
  const selectedDataId = mapAnalyticsQueryTwo?.myData?.params?.dimension?.find(d => d.startsWith("dx:"))?.split(":")[1];
  const selectedDataName = metaMapData?.metaData?.items?.[selectedDataId]?.name;
  const filter = mapAnalyticsQueryTwo?.myData?.params?.filter;
  const selectedPeriod = filter?.startsWith("pe:") ? filter.split("pe:")[1].replace(/_/g, " ") : null;
  const props = feature.properties;
  const selectedAreaName = props.name;
  
  let displayValue;
  
  if (analyticsMapData.rows.length === 1) {
    displayValue = analyticsMapData.rows[0]?.[2] || 'No data';
  } else {
    displayValue = valueMap.get(props.id) || 'No data';
  }
  
  // Store these values in the feature properties for later use with permanent labels
  feature.properties.selectedDataName = selectedDataName;
  feature.properties.selectedPeriod = selectedPeriod;
  feature.properties.displayValue = displayValue;
  
  layer.bindPopup(`
       <strong>${selectedAreaName}</strong><br/>
        ${selectedDataName}<br/>
       ${selectedPeriod}</><br/>
      Value: ${displayValue} 
  `);
};

export const getMapBounds = (geoJsonData: any): L.LatLngBounds | null => {
  if (!geoJsonData || !geoJsonData.features || geoJsonData.features.length === 0) {
    return null;
  }

  try {
    // Create a GeoJSON layer to calculate bounds
    const geoLayer = L.geoJSON(geoJsonData);
    const bounds = geoLayer.getBounds();
    
    // Only return bounds if they are valid
    if (bounds.isValid()) {
      return bounds;
    }
    return null;
  } catch (error) {
    console.error("Error calculating bounds:", error);
    return null;
  }
};

export const calculateMapBounds = (districts: ProcessedDistrict[]): L.LatLngBounds | null => {
  if (!districts || districts.length === 0) {
    return null;
  }
  
  // Create bounds object
  let bounds = new L.LatLngBounds([0, 0], [0, 0]);
  let boundsInitialized = false;
  
  districts.forEach(district => {
    if (!district.coordinates) return;
    
    try {
      // Handle point format
      if (Array.isArray(district.coordinates) && district.coordinates.length === 2 && 
          typeof district.coordinates[0] === 'number' && typeof district.coordinates[1] === 'number') {
        const latLng = L.latLng(district.coordinates[1], district.coordinates[0]);
        if (!boundsInitialized) {
          bounds = new L.LatLngBounds(latLng, latLng);
          boundsInitialized = true;
        } else {
          bounds.extend(latLng);
        }
      } 
      // Handle polygon/multipolygon formats
      else {
        district.coordinates.forEach(polygon => {
          if (!polygon) return;
          
          // Handle first level arrays (polygons)
          if (Array.isArray(polygon)) {
            polygon.forEach(ring => {
              if (!Array.isArray(ring)) return;
              
              // For each point in the polygon
              ring.forEach(point => {
                if (Array.isArray(point) && point.length >= 2) {
                  const latLng = L.latLng(point[1], point[0]);
                  if (!boundsInitialized) {
                    bounds = new L.LatLngBounds(latLng, latLng);
                    boundsInitialized = true;
                  } else {
                    bounds.extend(latLng);
                  }
                }
              });
            });
          }
        });
      }
    } catch (error) {
      console.error("Error processing district for bounds:", district.name, error);
    }
  });
  
  return boundsInitialized ? bounds : null;
}