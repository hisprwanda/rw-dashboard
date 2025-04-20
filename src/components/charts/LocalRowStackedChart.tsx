import React, { useMemo, useRef, useState, useEffect } from "react";
import { useAuthorities } from '../../context/AuthContext';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, Tooltip, LabelList, ResponsiveContainer } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "../ui/chart";
import { transformDataForGenericChart, generateChartConfig, isValidInputData } from "../../lib/localGenericchartFormat";
import { genericChartsProps } from "../../types/visualSettingsTypes"

export const LocalRowStackedChart: React.FC<genericChartsProps> = ({ data, visualTitleAndSubTitle, visualSettings, metaDataLabels }) => {
    // Get dimensions for responsive adjustments
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleResize = () => {
            if (chartRef.current) {
                const { width, height } = chartRef.current.getBoundingClientRect();
                setDimensions({ width, height });
            }
        };

        // Initial measurement
        handleResize();
        
        // Listen for window resize
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const { chartData, chartConfig, error } = useMemo(() => {
        if (!isValidInputData(data)) {
            return { chartData: [], chartConfig: {}, error: "no data found" };
        }

        try {
            const transformedData = transformDataForGenericChart(data, undefined, undefined, metaDataLabels);
            const config = generateChartConfig(data, visualSettings.visualColorPalette);
            return { chartData: transformedData, chartConfig: config, error: null };
        } catch (err) {
            return { chartData: [], chartConfig: {}, error: (err as Error).message };
        }
    }, [data, visualSettings, metaDataLabels]);

    // Calculate if we need to adjust Y-axis width based on the number of data points
    const shouldRotateLabels = useMemo(() => {
        return chartData.length > 5; // Adjust Y-axis when we have more than 5 items
    }, [chartData]);

    // Calculate dynamic Y-axis width based on data
    const yAxisWidth = useMemo(() => {
        if (!chartData.length) return 120;
        
        // Calculate based on the longest label
        const maxLabelLength = Math.max(...chartData.map(item => 
            item.period ? item.period.toString().length : 0
        ));
        
        // Base width + additional width per character
        return Math.max(120, shouldRotateLabels ? 100 : maxLabelLength * 8);
    }, [chartData, shouldRotateLabels]);

    if (error || chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                <p className="text-gray-500 text-lg">{error || "No data available"}</p>
            </div>
        );
    }

    return (
        <div ref={chartRef} className="w-full h-full">
            <ChartContainer config={chartConfig} style={{ backgroundColor: visualSettings.backgroundColor, width: '100%', height: '100%' }}>
                {visualTitleAndSubTitle.visualTitle && <h3 className="text-center text-lg font-bold text-gray-800">{visualTitleAndSubTitle.visualTitle}</h3>}
                {visualTitleAndSubTitle?.customSubTitle ? (
                    <h4 className="text-center text-md font-medium text-gray-600 mt-1">{visualTitleAndSubTitle?.customSubTitle}</h4>
                ) : visualTitleAndSubTitle?.DefaultSubTitle?.orgUnits?.length !== 0 && (
                    <div className="flex justify-center gap-1">
                        {visualTitleAndSubTitle?.DefaultSubTitle?.orgUnits?.map((orgUnit, index) => (
                            <h4 key={index} className="text-center text-md font-medium text-gray-600 mt-1">
                                {orgUnit?.name}
                                {index < visualTitleAndSubTitle?.DefaultSubTitle?.orgUnits?.length - 1 && ","}
                            </h4>
                        ))}
                    </div>
                )}

                <ResponsiveContainer width="100%" height={chartData.length * 50 + 100}>
                    <BarChart
                        data={chartData}
                        layout="vertical"

                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis 
                            type="number"
                            tick={{ 
                                fill: visualSettings.XAxisSettings.color, 
                                fontSize: visualSettings.XAxisSettings.fontSize, 
                                fontWeight: 'bold' 
                            }} 
                        />
                        <YAxis
                            dataKey="period"
                            type="category"
                            tickLine={false}
                            axisLine={false}
                            width={yAxisWidth}
                            tick={{ 
                                fill: visualSettings.YAxisSettings.color, 
                                fontSize: visualSettings.YAxisSettings.fontSize, 
                                fontWeight: 'bold',
                                // Apply angle for oblique text
                                angle: shouldRotateLabels ? -35 : 0,
                                textAnchor: shouldRotateLabels ? "end" : "end",
                                // Adjust vertical position
                                dy: shouldRotateLabels ? 0 : 3
                            }}
                        />
                        <Tooltip content={<ChartTooltipContent className="bg-white" />} />
                        <Legend wrapperStyle={{ paddingTop: 10 }} />
                        {Object.keys(chartConfig).map((key) => (
                            <Bar
                                key={key}
                                dataKey={key}
                                fill={chartConfig[key].color}
                                name={chartConfig[key].label}
                                stackId="a"
                            >
                                <LabelList
                                    dataKey={key}
                                    position="center"
                                    fill={visualSettings.fillColor}
                                    style={{ fontSize: '12px', fontWeight: 'bold' }}
                                />
                            </Bar>
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
        </div>
    );
};