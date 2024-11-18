import { ChartConfig } from "../components/ui/chart";

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

export function transformDataForGenericChart(inputData: InputData): TransformedDataPoint[] | any {
    if (!isValidInputData(inputData)) {
        throw new Error("Invalid input data structure");
    }
    const rows = inputData.rows;
    // Sort rows by period (assuming YYYYMM format)
    rows.sort((a, b) => a[1].localeCompare(b[1]));

    // Transform data
    const transformedData = rows.map(row => {
        // example of period data: 202311
        const period = row[1];

        const monthAndYear = inputData.metaData.items[period].name
        // shortening monthAndYear ex: January 2023 => Jan 2023
        // Split the string into month and year parts
         const [month, year] = monthAndYear.split(" ");
          // Abbreviate the month to the first three letters and capitalize the first letter
           const abbreviatedMonth = month.slice(0, 3);
        // Concatenate the abbreviated month and year
         const formattedDate = `${abbreviatedMonth} ${year}`;
        const dataPoint: TransformedDataPoint = {
            month: formattedDate,
        };
        // Add the data value with the name from metaData (below is the how to get the name of selected data element)
        const dataName = inputData.metaData.items[row[0]].name;
        // adding data element name to data point object and it's corresponding value
        dataPoint[dataName] = parseInt(row[2]);
        return dataPoint;
    });
     const finalTransformedData = combineDataByMonth(transformedData) as TransformedDataPoint[]

     if(chartType === "pie" || chartType === "radial"){
        const pieChartData = transformDataToPieChartFormat(finalTransformedData,colors)
        return pieChartData
     }
    return finalTransformedData;
}

export function generateChartConfig(inputData: InputData): ChartConfig {
    if (!isValidInputData(inputData)) {
        throw new Error("Invalid input data structure");
    }

    const config: ChartConfig = {};
    const dataItems = inputData.metaData.dimensions.dx;

    dataItems.forEach((item: string, index: number) => {
        const name = inputData.metaData.items[item].name;
        config[name] = {
            label: name,
            color: `hsl(var(--chart-${index + 1}))`,
        };
    });

    return config;
}



////// other formats
function transformDataToPieChartFormat(data:TransformedDataPoint[], colors:string[]) {
    const totals = {};
    const colorCount = colors.length; // Number of available colors
  
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
      fill: colors[index % colorCount], // Assign colors cyclically
    }));
  
    return transformedData;
  }