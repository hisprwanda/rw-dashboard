import { useAuthorities } from '../context/AuthContext';
import { ChartConfig } from "../components/ui/chart";
import { visualColorPaletteTypes } from "../types/visualSettingsTypes";

export interface InputData {
    headers: any[];
    metaData: any;
    rows: any[][];
}

export interface TransformedDataPoint {
    period: string;              // always holds the category label (e.g., period, org unit)
    [key: string]: number | string | null;
}

export function isValidInputData(data: any): data is InputData {
    return (
        data &&
        Array.isArray(data.headers) &&
        data.metaData &&
        Array.isArray(data.rows)
    );
}

// Combines entries with the same period (category), merging their data
function combineDataByPeriod(data: TransformedDataPoint[]): TransformedDataPoint[] {
    return Object.values(
        data.reduce((acc: Record<string, TransformedDataPoint>, current: TransformedDataPoint) => {
            const { period, ...rest } = current;
            if (!acc[period]) {
                acc[period] = { period, ...rest };
            } else {
                acc[period] = { ...acc[period], ...rest };
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

    const { headers, metaData: metadata, rows } = inputData;

    // Determine data-element (dx) and category dimension (first other meta header)
    const dxIndex = headers.findIndex(h => h.name === 'dx');
    const categoryHeader = headers.find(h => h.meta && h.name !== 'dx');
    if (!categoryHeader) {
        throw new Error('No category dimension (pe, ou, co, etc.) found');
    }
    const categoryDimName = categoryHeader.name;                // e.g. 'pe' or 'ou'
    const categoryIndex = headers.findIndex(h => h.name === categoryDimName);
    const valueIndex = headers.findIndex(h => h.name === 'value');

    if (dxIndex < 0 || categoryIndex < 0 || valueIndex < 0) {
        throw new Error('Required headers (dx, value, and a category) are missing');
    }

    // Build all category entries in order
    const allCategories = metadata.dimensions[categoryDimName].map((id: string) => ({
        id,
        name: metadata.items[id].name
    }));

    // Build all data-element entries
    const allDataElements = metadata.dimensions.dx.map((dxId: string) => ({
        id: dxId,
        name: metadata.items[dxId].name
    }));

    // Initialize map: categoryName -> { period: categoryName, [dataElementName]: null }
    const dataMap = new Map<string, TransformedDataPoint>();
    allCategories.forEach(cat => {
        const entry: TransformedDataPoint = { period: cat.name };
        allDataElements.forEach(de => {
            entry[de.name] = null;
        });
        dataMap.set(cat.name, entry);
    });

    // Populate actual values from rows
    rows.forEach(row => {
        const dxId = row[dxIndex];
        const catId = row[categoryIndex];
        const rawValue = row[valueIndex];
        const numericValue = rawValue !== '' ? Number(rawValue) : null;

        const dataElementName = metadata.items[dxId]?.name;
        const categoryName = metadata.items[catId]?.name;
        if (!dataElementName || !categoryName) return;

        const entry = dataMap.get(categoryName);
        if (entry) {
            entry[dataElementName] = numericValue;
        }
    });

    // Convert map -> array preserving order, then combine duplicates
    const initialData = allCategories.map(c => dataMap.get(c.name)!);
    const finalData = combineDataByPeriod(initialData);

    if (chartType === "pie" || chartType === "radial") {
        return transformDataNoneAxisData(finalData, selectedColorPalette);
    } else if (chartType === "tree") {
        return convertDataForTreeMap(finalData);
    }

    return finalData;
}

export function generateChartConfig(
    inputData: InputData,
    selectedColorPalette?: visualColorPaletteTypes
): ChartConfig {
    if (!isValidInputData(inputData)) {
        throw new Error("Invalid input data structure");
    }

    const config: ChartConfig = {};
    inputData.metaData.dimensions.dx.forEach((dxId: string, index: number) => {
        const name = inputData.metaData.items[dxId].name;
        const palette = selectedColorPalette?.itemsBackgroundColors || [];
        const color = palette.every(c => c.startsWith("hsl"))
            ? palette[index] || `hsl(var(--chart-${index + 1}))`
            : palette[index] || palette[0];
        config[name] = { label: name, color };
    });

    return config;
}

function transformDataNoneAxisData(
    data: TransformedDataPoint[],
    selectedColorPalette?: visualColorPaletteTypes
) {
    const totals: Record<string, number> = {};
    const palette = selectedColorPalette?.itemsBackgroundColors || [];

    data.forEach(entry => {
        for (const key in entry) {
            if (key !== "period") {
                const val = Number(entry[key]);
                totals[key] = (totals[key] || 0) + (isNaN(val) ? 0 : val);
            }
        }
    });

    return Object.entries(totals).map(([name, total], idx) => ({
        name,
        total,
        fill: palette[idx % palette.length]
    }));
}

type PeriodDataInput = {
    period: string;
    [key: string]: string | number | undefined | null;
};

type TreemapDataType = {
    name: string;
    children: { name: string; size: number }[];
};

const convertDataForTreeMap = (data: PeriodDataInput[]): TreemapDataType[] => {
    if (!Array.isArray(data) || data.length === 0) return [];

    const validData = data.filter(item => typeof item.period === 'string');
    if (validData.length === 0) return [];

    const categories = Object.keys(validData[0]).filter(key => key !== 'period');
    return categories
        .map(cat => ({
            name: cat,
            children: validData
                .map(item => {
                    const size = Number(item[cat]);
                    return { name: item.period, size: isNaN(size) ? 0 : size };
                })
                .filter(child => child.size > 0)
        }))
        .filter(c => c.children.length > 0);
};
