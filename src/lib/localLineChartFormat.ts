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

function combineDataByMonth(data:any) {
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
export function transformDataForLineChart(inputData: InputData) {
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
    const finalTransformedData = combineDataByMonth(transformedData)
    console.log("finalTransformedData line",finalTransformedData)

    return finalTransformedData;
}

export function generateChartConfig(inputData: InputData): ChartConfig {
    if (!isValidInputData(inputData)) {
        throw new Error("Invalid input data structure");
    }

    const config: ChartConfig = {};
    const dataItems = inputData.metaData.dimensions.dx;

    // Define an array of colors
    const colors = [
        "#007C4A",
        "#AB3A29",
        "#C72E1A",
        "#A4D0B3",
        "#1D9A55"
    ];

    dataItems.forEach((item: string, index: number) => {
        const name = inputData.metaData.items[item].name;
        // Use modulus to cycle through colors
        config[name] = {
            label: name,
            color: colors[index % colors.length],
        };
    });

    return config;
}
