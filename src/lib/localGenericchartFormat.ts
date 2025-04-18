import { useAuthorities } from '../context/AuthContext';
import { ChartConfig } from "../components/ui/chart";
import {visualColorPaletteTypes} from "../types/visualSettingsTypes"




export interface InputData {
    headers: any[];
    metaData: any;
    rows: any[][];
}

export interface TransformedDataPoint {
    month: string;
    [key: string]: number | string;
}

export function isValidInputData(data: any): data is InputData {
    return (
        data &&
        Array.isArray(data.headers) &&
        data.metaData &&
        Array.isArray(data.rows) &&
        data.rows.length > 0
    );
}



function combineDataByMonth(data:TransformedDataPoint[]):TransformedDataPoint[] {
    return Object.values(
      data.reduce((acc:any, current:any) => {
        const { month, ...rest } = current;
        
        // If the month already exists, combine the data
        if (!acc[month]) {
          acc[month] = { month, ...rest };
        } else {
          acc[month] = { ...acc[month], ...rest };
        }
        
        return acc;
      }, {})
    );
  }


  export function transformDataForGenericChart(
    inputData: InputData,
    chartType?: "pie" | "radial" | "single" | "tree",
    selectedColorPalette?: visualColorPaletteTypes,
    metaDataLabels?: any
  ): TransformedDataPoint[] | any {
    if (!isValidInputData(inputData)) {
      throw new Error("Invalid input data structure");
    }
    
    const rows = inputData.rows;
    console.log("data one", rows);
    console.log("metaDataLabels one", metaDataLabels);
  
    // Use metaDataLabels if provided, otherwise use inputData.metaData
    const metadata = metaDataLabels || inputData.metaData;
    
    // Step 1: Create an ordered map to store data by period and preserve order
    const dataMap = new Map();
    
    // Step 2: Get all periods from metadata in their original order
    const allPeriods = metadata.dimensions.pe.map(periodId => {
      return {
        id: periodId,
        name: metadata.items[periodId].name
      };
    });
    
    // Step 3: Get all data elements from metadata
    const allDataElements = metadata.dimensions.dx.map(dataElementId => {
      return {
        id: dataElementId,
        name: metadata.items[dataElementId].name
      };
    });
    
    // Step 4: Initialize the map with all periods in the correct order
    allPeriods.forEach(period => {
      dataMap.set(period.name, { month: period.name });
    });
    
    // Step 5: Process existing data from rows
    rows.forEach(row => {
      const dataElementId = row[0];
      const periodId = row[1];
      const value = parseInt(row[2]) ;
      
      const dataElementName = metadata.items[dataElementId].name;
      const periodName = metadata.items[periodId].name;
      
      // Get the existing entry for this period
      const periodData = dataMap.get(periodName);
      
      // Add the data element value to this period
      periodData[dataElementName] = value;
    });
    
    // Step 6: Ensure all periods have entries for all data elements
    dataMap.forEach((periodData, periodName) => {
      allDataElements.forEach(dataElement => {
        if (periodData[dataElement.name] === undefined) {
          periodData[dataElement.name] = null;
        }
      });
    });
    
    // Convert the map to array, maintaining the original order
    const transformedData = Array.from(dataMap.values());
    
    console.log("transformedData 1", transformedData);
    const finalTransformedData = combineDataByMonth(transformedData) as TransformedDataPoint[];
    console.log("finalTransformedData 2", finalTransformedData);
    
    if (chartType === "pie" || chartType === "radial") {
      const result = transformDataNoneAxisData(finalTransformedData, selectedColorPalette);
      return result;
    } else if (chartType === "tree") {
      const result = convertDataForTreeMap(finalTransformedData);
      return result;
    } else {
      return finalTransformedData;
    }
  }
 
export function generateChartConfig(inputData: InputData,selectedColorPalette?:visualColorPaletteTypes): ChartConfig {


  console.log("Selected color palette:", selectedColorPalette);

  if (!isValidInputData(inputData)) {
    throw new Error("Invalid input data structure");
  }

  const config: ChartConfig = {};
  const dataItems = inputData.metaData.dimensions.dx;
  dataItems.forEach((item: string, index: number) => {
    const name = inputData.metaData.items[item].name;

    // Determine color based on the format of selectedColorPalette
    const color =
      selectedColorPalette.itemsBackgroundColors.every(color => color.startsWith("hsl")) // Check if all are HSL
        ? selectedColorPalette.itemsBackgroundColors[index] || `hsl(var(--chart-${index + 1}))`
        : selectedColorPalette.itemsBackgroundColors[index] || selectedColorPalette.itemsBackgroundColors[0]; // Use first color as fallback for HEX or RGB

    config[name] = {
      label: name,
      color,
    };
  });

  return config;
}




////// other formats
function transformDataNoneAxisData(data:TransformedDataPoint[],selectedColorPalette?:visualColorPaletteTypes) {

    const totals = {};
    const colorCount = selectedColorPalette.itemsBackgroundColors.length; // Number of available colors

  
    // Calculate totals for each disease dynamically
    data.forEach((entry) => {
      for (const key in entry) {
        if (key !== "month") {
          totals[key] = (totals[key] || 0) + entry[key];
        }
      }
    });
  
    // Transform the totals into the desired array format with dynamic colors
    const transformedData = Object.entries(totals).map(([name, total], index) => ({
      name,
      total,
      fill: selectedColorPalette.itemsBackgroundColors[index % colorCount], // Assign colors cyclically
    }));
  
    return transformedData;
  }

  ///////// tree map
type InputDataType = {
  month: string;
  [key: string]: string | number | undefined | null;
};

type TreemapDataType = {
  name: string;
  children: { name: string; size: number }[];
};

const convertDataForTreeMap = (data: InputDataType[]): TreemapDataType[] => {
  if (!Array.isArray(data) || data.length === 0) {
    console.error('Input data is empty or not an array');
    return [];
  }

  const validData = data.filter(item => 
    typeof item === 'object' && item !== null && 'month' in item && typeof item.month === 'string'
  );

  if (validData.length === 0) {
    console.error('No valid data entries found');
    return [];
  }

  const categories = Object.keys(validData[0]).filter(key => key !== 'month');

  return categories.map(category => ({
    name: category,
    children: validData.map(item => {
      const size = Number(item[category]);
      return {
        name: item.month,
        size: isNaN(size) ? 0 : size
      };
    }).filter(child => child.size > 0)
  })).filter(category => category.children.length > 0);
};