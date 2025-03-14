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
        color: "#EDF8FB"
      },
      {
        name: "Low",
        startValue: min + step,
        endValue: min + 2 * step,
        color: "#B3CDE3"
      },
      {
        name: "Medium",
        startValue: min + 2 * step,
        endValue: min + 3 * step,
        color: "#8C96C6"
      },
      {
        name: "High",
        startValue: min + 3 * step,
        endValue: min + 4 * step,
        color: "#8856A7"
      },
      {
        name: "Very High",
        startValue: min + 4 * step,
        endValue: max,
        color: "#810F7C"
      }
    ];
    return autoLegend
   // setAutoLegend(autoLegend);
  };
  