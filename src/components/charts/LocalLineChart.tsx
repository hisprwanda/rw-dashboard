import React, { useMemo, useRef, useState, useEffect } from "react";
import { useAuthorities } from '../../context/AuthContext';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend, Tooltip, LabelList, ResponsiveContainer } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "../../components/ui/chart";
import { transformDataForGenericChart, generateChartConfig, isValidInputData } from "../../lib/localGenericchartFormat";
import { genericChartsProps } from "../../types/visualSettingsTypes"
import { VisualHeading } from "./VisualHeading";

export const LocalLineChart: React.FC<genericChartsProps> = ({ data, visualSettings, visualTitleAndSubTitle, metaDataLabels ,analyticsPayloadDeterminer}) => {
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
 
    // below is error handling checking if the data exists before passing it to the formmater function or to the graph
    const { chartData, chartConfig, error } = useMemo(() => {
        if (!isValidInputData(data)) {
            return { chartData: [], chartConfig: {}, error: "no data found" };
        }

        try {
            const transformedData = transformDataForGenericChart(data,_,_,metaDataLabels);
            const config = generateChartConfig(data,visualSettings.visualColorPalette);
            return { chartData: transformedData, chartConfig: config, error: null };
        } catch (err) {
            return { chartData: [], chartConfig: {}, error: (err as Error).message };
        }
    }, [data,visualSettings]);

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
        <div ref={chartRef} className="w-full h-full">
            <ChartContainer config={chartConfig} style={{ backgroundColor: visualSettings.backgroundColor, width: '100%', height: '100%' }}>
                {visualTitleAndSubTitle.visualTitle && <h3 className="text-center text-lg font-bold text-gray-800">{visualTitleAndSubTitle.visualTitle}</h3>}  
                {visualTitleAndSubTitle?.customSubTitle ? 
                    <h4 className="text-center text-md font-medium text-gray-600 mt-1">{visualTitleAndSubTitle?.customSubTitle}</h4> : 
                   <VisualHeading analyticsPayloadDeterminer={analyticsPayloadDeterminer}  visualTitleAndSubTitle={visualTitleAndSubTitle} />
                        
                }
                
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                        data={chartData} 
                        margin={{ 
                            top: 20, 
                            right: 30, 
                            left: 20, 
                            // Increase bottom margin when labels are rotated
                            bottom: shouldRotateLabels ? 80 : 20 
                        }}
                    >
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
                        <Legend wrapperStyle={{paddingTop: 10}} />
                        {Object.keys(chartConfig).map((key) => (
                            <Line
                                key={key}
                                dataKey={key}
                                stroke={chartConfig[key].color}
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                name={chartConfig[key].label}
                                label={<CustomLabel visualSettings={visualSettings} />}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            </ChartContainer>
        </div>
    );
};

function CustomLabel(props: any) {
    const { x, y, value, visualSettings } = props;
    return (
        <text 
            x={x} 
            y={y} 
            dy={-10} 
            fill={visualSettings.fillColor} 
            fontSize={12} 
            fontWeight="bold" 
            textAnchor="middle"
        >
            {value}
        </text>
    );
}