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
    chartType?: "pie" | "radial" | "single" | "tree" | "line" | "bar" | "column",
    selectedColorPalette?: visualColorPaletteTypes,
    metaDataLabels?: any
): TransformedDataPoint[] | any {
    if (!isValidInputData(inputData)) {
        throw new Error("Invalid input data structure");
    }

    const { headers, metaData: metadata, rows } = inputData;

    // Check if data has a 'dx' column or if it follows the alternative format (like ANC 3 Coverage)
    const dxIndex = headers.findIndex(h => h.name === 'dx');
    const hasDxColumn = dxIndex >= 0;
    
    // Get all meta headers (those marked with meta=true)
    const metaHeaders = headers.filter(h => h.meta);

    // Determine the category dimension and index
    let categoryDimName: string;
    let categoryIndex: number;
    
    // For data without dx column, we'll use 'pe' (period) as the category if it exists
    if (!hasDxColumn) {
        // Find 'pe' if it exists
        const peHeader = headers.find(h => h.name === 'pe');
        if (peHeader) {
            categoryDimName = 'pe';
            categoryIndex = headers.findIndex(h => h.name === 'pe');
        } else {
            // Otherwise, use the first meta header as category
            const firstMetaHeader = metaHeaders[0];
            if (!firstMetaHeader) {
                throw new Error('No category dimension found');
            }
            categoryDimName = firstMetaHeader.name;
            categoryIndex = headers.findIndex(h => h.name === categoryDimName);
        }
    } else {
        // For traditional data with 'dx', use the first non-dx meta header as category
        const categoryHeader = metaHeaders.find(h => h.name !== 'dx');
        if (!categoryHeader) {
            throw new Error('No category dimension (pe, ou, co, etc.) found');
        }
        categoryDimName = categoryHeader.name;
        categoryIndex = headers.findIndex(h => h.name === categoryDimName);
    }
    
    // Find the value index
    const valueIndex = headers.findIndex(h => h.name === 'value');
    
    if (categoryIndex < 0 || valueIndex < 0) {
        throw new Error('Required headers (value and a category) are missing');
    }

    // Handle data without 'dx' column (like ANC 3 Coverage)
    if (!hasDxColumn) {
        const result = transformSimpleData(inputData, categoryDimName, categoryIndex, valueIndex);
        
        if (chartType === "pie" || chartType === "radial") {
            return transformDataNoneAxisData(result, selectedColorPalette);
        } else if (chartType === "tree") {
            return convertDataForTreeMap(result);
        }
        
        return result;
    }
    
    // Traditional data handling with 'dx' column
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

// Function to transform simple data (like ANC 3 Coverage) without dx dimension
function transformSimpleData(
    inputData: InputData,
    categoryDimName: string,
    categoryIndex: number,
    valueIndex: number
): TransformedDataPoint[] {
    const { metaData: metadata, rows } = inputData;
    
    // Get all categories from metadata or derive from rows
    let allCategories: { id: string, name: string }[] = [];
    
    if (metadata.dimensions[categoryDimName]) {
        // Get from metadata if available
        allCategories = metadata.dimensions[categoryDimName].map((id: string) => ({
            id,
            name: metadata.items[id]?.name || id
        }));
    } else {
        // Otherwise extract unique categories from rows
        const uniqueCatIds = new Set<string>();
        rows.forEach(row => uniqueCatIds.add(row[categoryIndex]));
        
        allCategories = Array.from(uniqueCatIds).map(id => ({
            id,
            name: metadata.items[id]?.name || id
        }));
    }
    
    // Find organization units data
    const ouDimension = 'ou';
    const orgUnits: { id: string, name: string }[] = [];
    
    if (metadata.dimensions[ouDimension]) {
        metadata.dimensions[ouDimension].forEach((ouId: string) => {
            if (metadata.items[ouId]?.name) {
                orgUnits.push({
                    id: ouId,
                    name: metadata.items[ouId].name
                });
            }
        });
    }
    
    // If no org units found in metadata, try to extract from rows
    if (orgUnits.length === 0) {
        const ouIndex = inputData.headers.findIndex(h => h.name === ouDimension);
        if (ouIndex >= 0) {
            const uniqueOuIds = new Set<string>();
            rows.forEach(row => uniqueOuIds.add(row[ouIndex]));
            
            Array.from(uniqueOuIds).forEach(ouId => {
                if (metadata.items[ouId]?.name) {
                    orgUnits.push({
                        id: ouId,
                        name: metadata.items[ouId].name
                    });
                }
            });
        }
    }
    
    // Create data points
    const dataPoints: TransformedDataPoint[] = [];
    
    allCategories.forEach(cat => {
        const matchingRow = rows.find(row => row[categoryIndex] === cat.id);
        
        if (matchingRow) {
            const rawValue = matchingRow[valueIndex];
            const value = rawValue !== '' ? Number(rawValue) : null;
            
            // Use org unit names as measure names
            if (orgUnits.length > 0) {
                // For each org unit, create a data point with the org unit name as the measure
                const entry: TransformedDataPoint = { period: cat.name };
                
                // Find the org unit for this row
                const ouIndex = inputData.headers.findIndex(h => h.name === ouDimension);
                if (ouIndex >= 0) {
                    const rowOuId = matchingRow[ouIndex];
                    const ou = orgUnits.find(ou => ou.id === rowOuId);
                    if (ou) {
                        entry[ou.name] = value;
                    }
                } else {
                    // If we can't find the ou index, use all org units with the same value
                    orgUnits.forEach(ou => {
                        entry[ou.name] = value;
                    });
                }
                
                dataPoints.push(entry);
            } else {
                // Fallback to using "Value" as the measure name if no org units found
                dataPoints.push({
                    period: cat.name,
                    "Value": value
                });
            }
        } else {
            // No matching row found for this category
            const entry: TransformedDataPoint = { period: cat.name };
            
            // Add null values for all org units
            orgUnits.forEach(ou => {
                entry[ou.name] = null;
            });
            
            // If no org units, add a generic "Value" column
            if (orgUnits.length === 0) {
                entry["Value"] = null;
            }
            
            dataPoints.push(entry);
        }
    });
    
    return dataPoints;
}

export function generateChartConfig(
    inputData: InputData,
    selectedColorPalette?: visualColorPaletteTypes
): ChartConfig {
    if (!isValidInputData(inputData)) {
        throw new Error("Invalid input data structure");
    }

    const config: ChartConfig = {};
    const palette = selectedColorPalette?.itemsBackgroundColors || [];
    
    // Handle case where data doesn't have dx dimension but has organization units
    if (!inputData.metaData.dimensions.dx || inputData.metaData.dimensions.dx.length === 0) {
        // Try to use organization units as metrics
        if (inputData.metaData.dimensions.ou && inputData.metaData.dimensions.ou.length > 0) {
            inputData.metaData.dimensions.ou.forEach((ouId: string, index: number) => {
                const name = inputData.metaData.items[ouId]?.name || ouId;
                const color = palette.every(c => c.startsWith("hsl"))
                    ? palette[index % palette.length] || `hsl(var(--chart-${index + 1}))`
                    : palette[index % palette.length] || `hsl(var(--chart-${index + 1}))`;
                
                config[name] = { label: name, color };
            });
        } else {
            // Fallback to a generic "Value" metric
            const color = palette.every(c => c.startsWith("hsl"))
                ? palette[0] || `hsl(var(--chart-1))`
                : palette[0] || `hsl(var(--chart-1))`;
                
            config["Value"] = { label: "Value", color };
        }
        
        return config;
    }
    
    // Original functionality for dx dimensions
    inputData.metaData.dimensions.dx.forEach((dxId: string, index: number) => {
        const name = inputData.metaData.items[dxId].name;
        const color = palette.every(c => c.startsWith("hsl"))
            ? palette[index % palette.length] || `hsl(var(--chart-${index + 1}))`
            : palette[index % palette.length] || palette[0] || `hsl(var(--chart-${index + 1}))`;
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
        fill: palette[idx % palette.length] || `hsl(var(--chart-${idx + 1}))`
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