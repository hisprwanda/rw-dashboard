import React, { useMemo } from "react";
import { useAuthorities } from '../../context/AuthContext';
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "../../components/ui/chart";
import { transformDataForGenericChart, generateChartConfig, isValidInputData } from "../../lib/localGenericchartFormat";
import {genericChartsProps} from "../../types/visualSettingsTypes"
import { VisualHeading } from "./VisualHeading";


export const LocalRadarChart: React.FC<genericChartsProps> = ({ data,visualSettings,visualTitleAndSubTitle,metaDataLabels,analyticsPayloadDeterminer }) => {

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

    if (error || chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                <p className="text-gray-500 text-lg">{error || "No data available"}</p>
            </div>
        );
    }

    return (
        <ChartContainer config={chartConfig} style={{ backgroundColor: visualSettings.backgroundColor }} >
             {visualTitleAndSubTitle.visualTitle && <h3 className="text-center text-lg font-bold text-gray-800 ">{visualTitleAndSubTitle.visualTitle}</h3> }  
               
             {visualTitleAndSubTitle?.customSubTitle ?  <h4 className="text-center text-md font-medium text-gray-600 mt-1">{visualTitleAndSubTitle?.customSubTitle}</h4>  : 
         <VisualHeading analyticsPayloadDeterminer={analyticsPayloadDeterminer}  visualTitleAndSubTitle={visualTitleAndSubTitle} />
                     }
    
            <RadarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" className="bg-white"  />}
            />
            <PolarAngleAxis dataKey="period"  
             tick={{ fill:visualSettings.fillColor, fontSize: visualSettings.XAxisSettings.fontSize, fontWeight: 'bold' }} 
            />
            <PolarGrid   />

                {Object.keys(chartConfig).map((key) => (
                   <Radar
                   dataKey={key}
                   fill={chartConfig[key].color}
                   fillOpacity={0.6}
                   
                 />
            ))}
            </RadarChart>

         
        </ChartContainer>
    );
};