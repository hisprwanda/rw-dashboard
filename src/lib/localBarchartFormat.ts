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

export function transformDataForBarChart(inputData: InputData): TransformedDataPoint[] {
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
     console.log("transformed data bar",transformedData)
    return transformedData;
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