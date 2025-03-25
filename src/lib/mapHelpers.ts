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
  