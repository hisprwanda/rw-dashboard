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
export const parseCoordinates = (coordinatesString: string): number[][][] => {
  try {
    const cleanString = coordinatesString
      .replace(/\]\]\]\]$/, ']]]')
      .replace(/\[\[\[/, '[[[');
    
    return JSON.parse(cleanString);
  } catch (e) {
    console.error('Error parsing coordinates:', e, coordinatesString);
    return [[[0, 0]]];
  }
};

// Get color for a value based on legend classes
export const getColorForValue = (
  value: number | null, 
  legendClasses: LegendClass[]
): string => {
  if (value === null) return "#FFFFFF";
  
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

// Popup content for district features
export const onEachFeature = (
  feature: any, 
  layer: any, 
  analyticsMapData: any, 
  valueMap: Map<string, string>
) => {
  if (!analyticsMapData?.rows) return;
  
  const props = feature.properties;
  
  let displayValue;
  
  if (analyticsMapData.rows.length === 1) {
    displayValue = analyticsMapData.rows[0]?.[2] || 'No data';
  } else {
    displayValue = valueMap.get(props.id) || 'No data';
  }
  
  layer.bindPopup(`
    <strong>${props.name}</strong><br/>
    Value: ${displayValue}
  `);
};