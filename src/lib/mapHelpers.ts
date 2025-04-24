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
  
  const districtsWithData = districts.filter(d => d.value !== null);
  
  if (districtsWithData.length === 0) {
    return [-1.9403, 30.0578];
  }
  
  let latSum = 0;
  let lonSum = 0;
  let pointCount = 0;
  
  districtsWithData.forEach(district => {
    if (district.coordinates && district.coordinates.length > 0) {
      district.coordinates.forEach(polygon => {
        if (polygon && polygon.length > 0) {
          lonSum += polygon[0][0];
          latSum += polygon[0][1];
          pointCount++;
        }
      });
    }
  });
  
  return pointCount > 0 
    ? [latSum / pointCount, lonSum / pointCount] 
    : [-1.9403, 30.0578];
};

// Parse coordinates string to GeoJSON format
export const parseCoordinates = (coordinatesString: string): any => {
  try {
    // Parse the original string without modifying it
    const parsed = JSON.parse(coordinatesString);
    
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
// Convert processed districts to GeoJSON
export const createGeoJSON = (districts: ProcessedDistrict[]) => {
  return {
    type: 'FeatureCollection',
    features: districts.map(district => {
      // Determine geometry type based on coordinate structure
      const coordinates = district.coordinates;
      
      // Check the depth of the coordinates to determine geometry type
      const isMultiPolygon = Array.isArray(coordinates[0][0][0]);
      
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
          type: isMultiPolygon ? 'MultiPolygon' : 'Polygon',
          coordinates: isMultiPolygon ? coordinates : coordinates
        }
      };
    })
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