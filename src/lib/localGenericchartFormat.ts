import { useAuthorities } from '../context/AuthContext';
import { ChartConfig } from "../components/ui/chart";
import { visualColorPaletteTypes } from "../types/visualSettingsTypes";

export interface InputData {
    headers: any[];
    metaData: any;
    rows: any[][];
}

export interface TransformedDataPoint {
    period: string;
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

// Combines entries with the same period, merging their data
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

    const metadata = inputData.metaData;
    const headers = inputData.headers;
    const rows = inputData.rows;

    const dxIndex = headers.findIndex(h => h.name === 'dx');
    const peIndex = headers.findIndex(h => h.name === 'pe');
    const valueIndex = headers.findIndex(h => h.name === 'value');

    if (dxIndex < 0 || peIndex < 0 || valueIndex < 0) {
        throw new Error('Required headers (dx, pe, value) are missing');
    }

    const allPeriods = metadata.dimensions.pe.map((periodId: string) => ({
        id: periodId,
        name: metadata.items[periodId].name
    }));

    const allDataElements = metadata.dimensions.dx.map((dxId: string) => ({
        id: dxId,
        name: metadata.items[dxId].name
    }));

    const dataMap = new Map<string, TransformedDataPoint>();
    allPeriods.forEach(period => {
        const entry: TransformedDataPoint = { period: period.name };
        allDataElements.forEach(de => {
            entry[de.name] = null;
        });
        dataMap.set(period.name, entry);
    });

    rows.forEach(row => {
        const dxId = row[dxIndex];
        const peId = row[peIndex];
        const rawValue = row[valueIndex];
        const numericValue = rawValue !== '' ? Number(rawValue) : null;

        const dataElementName = metadata.items[dxId]?.name;
        const periodName = metadata.items[peId]?.name;
        if (!dataElementName || !periodName) return;

        const periodEntry = dataMap.get(periodName);
        if (periodEntry) {
            periodEntry[dataElementName] = numericValue;
        }
    });

    const transformedData = allPeriods.map(p => dataMap.get(p.name)!);
    const finalData = combineDataByPeriod(transformedData);

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
    const dataItems = inputData.metaData.dimensions.dx;
    dataItems.forEach((item: string, index: number) => {
        const name = inputData.metaData.items[item].name;
        const color =
            selectedColorPalette?.itemsBackgroundColors.every(c => c.startsWith("hsl"))
                ? selectedColorPalette.itemsBackgroundColors[index] || `hsl(var(--chart-${index + 1}))`
                : selectedColorPalette?.itemsBackgroundColors[index] || selectedColorPalette?.itemsBackgroundColors[0];
        config[name] = { label: name, color };
    });

    return config;
}

function transformDataNoneAxisData(
    data: TransformedDataPoint[],
    selectedColorPalette?: visualColorPaletteTypes
) {
    const totals: Record<string, number> = {};
    const colorCount = selectedColorPalette?.itemsBackgroundColors.length || 0;

    data.forEach(entry => {
        for (const key in entry) {
            if (key !== "period") {
                const val = Number(entry[key]);
                totals[key] = (totals[key] || 0) + (isNaN(val) ? 0 : val);
            }
        }
    });

    return Object.entries(totals).map(([name, total], index) => ({
        name,
        total,
        fill: selectedColorPalette?.itemsBackgroundColors[index % colorCount]
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
    
    const validData = data.filter(
        item => item && typeof item.period === 'string'
    );
    if (validData.length === 0) return [];

    const categories = Object.keys(validData[0]).filter(key => key !== 'period');
    return categories.map(category => ({
        name: category,
        children: validData
            .map(item => {
                const size = Number(item[category]);
                return { name: item.period, size: isNaN(size) ? 0 : size };
            })
            .filter(child => child.size > 0)
    })).filter(cat => cat.children.length > 0);
};
