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
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Sort rows by period (assuming YYYYMM format)
    rows.sort((a, b) => a[1].localeCompare(b[1]));

    // Transform data
    const transformedData = rows.map(row => {
        const period = row[1];
        const monthIndex = parseInt(period.slice(4)) - 1;
        const dataPoint: TransformedDataPoint = {
            month: monthNames[monthIndex],
        };

        // Add the data value with the name from metaData
        const dataName = inputData.metaData.items[row[0]].name;
        dataPoint[dataName] = parseInt(row[2]);

        return dataPoint;
    });

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