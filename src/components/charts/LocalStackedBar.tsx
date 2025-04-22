import React, { useMemo } from "react";
import { useAuthorities } from '../../context/AuthContext';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, Tooltip, LabelList, ResponsiveContainer } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "../ui/chart";
import { transformDataForGenericChart, generateChartConfig, isValidInputData } from "../../lib/localGenericchartFormat";
import { genericChartsProps } from "../../types/visualSettingsTypes"
import { VisualHeading } from "./VisualHeading";


export const LocalStackedBar: React.FC<genericChartsProps> = ({ data, visualTitleAndSubTitle, visualSettings, metaDataLabels,analyticsPayloadDeterminer }) => {

    // below is error handling checking if the data exists before passing it to the formmater function or to the graph
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

    // Calculate if we need to rotate labels based on the number of data points
    const shouldRotateLabels = useMemo(() => {
        return chartData.length > 5; // Start rotating when we have more than 5 items
    }, [chartData]);

    if (error || chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                <p className="text-gray-500 text-lg">{error || "No data available"}</p>
            </div>
        );
    }

    return (
        <ChartContainer config={chartConfig} style={{ backgroundColor: visualSettings.backgroundColor, width: '100%', height: '100%' }}>
            {visualTitleAndSubTitle.visualTitle && <h3 className="text-center text-lg font-bold text-gray-800">{visualTitleAndSubTitle.visualTitle}</h3>}
            {visualTitleAndSubTitle?.customSubTitle ? <h4 className="text-center text-md font-medium text-gray-600 mt-1">{visualTitleAndSubTitle?.customSubTitle}</h4> :
                  <VisualHeading analyticsPayloadDeterminer={analyticsPayloadDeterminer}  visualTitleAndSubTitle={visualTitleAndSubTitle} />}
                                

            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: shouldRotateLabels ? 50 : 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="period"
                        tickLine={false}
                        tickMargin={shouldRotateLabels ? 15 : 10}
                        axisLine={true}
                        tickFormatter={(value) => value}
                        tick={{
                            fill: visualSettings.XAxisSettings.color,
                            fontSize: visualSettings.XAxisSettings.fontSize,
                            fontWeight: 'bold'
                        }}
                        // Always rotate when there are many labels
                        angle={shouldRotateLabels ? -45 : 0}
                        textAnchor={shouldRotateLabels ? "end" : "middle"}
                        height={shouldRotateLabels ? 100 : 60}
                    />
                    <YAxis
                        tick={{
                            fill: visualSettings.YAxisSettings.color,
                            fontSize: visualSettings.YAxisSettings.fontSize,
                            fontWeight: 'bold'
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
    );
};