import React, { useEffect, useMemo, useState, useRef } from "react";
import { useAuthorities } from '../../context/AuthContext';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, Tooltip, LabelList, ResponsiveContainer } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "../../components/ui/chart";
import { transformDataForGenericChart, generateChartConfig, isValidInputData } from "../../lib/localGenericchartFormat";
import { genericChartsProps } from "../../types/visualSettingsTypes"
import {getDimensionItems, PeriodItem, TransformedMetadata, transformMetadataLabels} from "../../lib/formatMetaDataLabels";
export const LocalBarChart: React.FC<genericChartsProps> = ({ data, visualTitleAndSubTitle, visualSettings, metaDataLabels }) => {
    // Get dimensions for responsive adjustments
    useEffect(()=>{
        const transformedMetaDataLabels = transformMetadataLabels(metaDataLabels);
        console.log("transformedMetaDataLabels",transformedMetaDataLabels)
        console.log("metaDataLabels changed",metaDataLabels)
        console.log("visualTitleAndSubTitle has changed",visualTitleAndSubTitle)
    },[metaDataLabels,visualTitleAndSubTitle])

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

    const { chartData, chartConfig, error,transformedMetaDataLabels } = useMemo(() => {
        if (!isValidInputData(data)) {
            return { chartData: [], chartConfig: {}, error: "no data found" };
        }

        try {
            const transformedMetaDataLabels:TransformedMetadata = transformMetadataLabels(metaDataLabels);
            const transformedData = transformDataForGenericChart(data, undefined, undefined, metaDataLabels);
            const config = generateChartConfig(data, visualSettings.visualColorPalette);
            return { chartData: transformedData, chartConfig: config, error: null,transformedMetaDataLabels };
        } catch (err) {
            return { chartData: [], chartConfig: {}, error: (err as Error).message };
        }
    }, [data, visualSettings,metaDataLabels,visualTitleAndSubTitle]);

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

    console.log("chartData bar", chartData);
    console.log("transformedMetaDataLabels 1",transformedMetaDataLabels)
    const allPeriods = transformedMetaDataLabels ?  getDimensionItems<PeriodItem>(transformedMetaDataLabels, 'periods') :  [];
    const allOrganizationUnit = transformedMetaDataLabels ?  getDimensionItems<PeriodItem>(transformedMetaDataLabels, 'orgUnits') :  [];
    const allDataElements = transformedMetaDataLabels ?  getDimensionItems<PeriodItem>(transformedMetaDataLabels, 'dataElements') :  [];
    console.log("All periods 1",allPeriods)
    console.log("All allOrganizationUnit 1",allOrganizationUnit)
    console.log("All allDataElements 1",allDataElements)

    return (
        <div ref={chartRef} className="w-full h-full">
            <ChartContainer config={chartConfig} style={{ backgroundColor: visualSettings.backgroundColor, width: '100%', height: '100%' }}>
                {visualTitleAndSubTitle.visualTitle && 
                    <h3 className="text-center text-lg font-bold text-gray-800">{visualTitleAndSubTitle.visualTitle}</h3>
                }
                
                {visualTitleAndSubTitle?.customSubTitle ? 
                    <h4 className="text-center text-md font-medium text-gray-600 mt-1">{visualTitleAndSubTitle?.customSubTitle}</h4> 
                    : 
                    visualTitleAndSubTitle?.DefaultSubTitle?.orgUnits?.length !== 0 && (
                        <div className="flex justify-center gap-1">
                            {visualTitleAndSubTitle?.DefaultSubTitle?.orgUnits?.map((orgUnit, index) => (
                                <h4 key={index} className="text-center text-md font-medium text-gray-600 mt-1">
                                    {orgUnit?.name}
                                    {index < visualTitleAndSubTitle?.DefaultSubTitle?.orgUnits?.length - 1 && ","}
                                </h4>
                            ))}
                        </div>
                    )
                }
                
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                        data={chartData} 
                      
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="month"
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
                        <Legend 
                        wrapperStyle={{paddingTop:10}}
                         />
                        {Object.keys(chartConfig).map((key) => (
                            <Bar
                                key={key}
                                dataKey={key}
                                fill={chartConfig[key].color}
                                name={chartConfig[key].label}
                            >
                                <LabelList
                                    dataKey={key}
                                    position="top"
                                    fill={visualSettings.fillColor }
                                    style={{ 
                                        fontSize: '12px', 
                                        fontWeight: 'bold' 
                                    }}
                                    // Show values on top of bars
                                />
                            </Bar>
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </ChartContainer>
        </div>
    );
};