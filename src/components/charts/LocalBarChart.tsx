import React, { useMemo } from "react";
import { useAuthorities } from '../../context/AuthContext';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, Tooltip,LabelList } from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "../../components/ui/chart";
import { transformDataForGenericChart, generateChartConfig, isValidInputData } from "../../lib/localGenericchartFormat";
import {genericChartsProps} from "../../types/visualSettingsTypes"


export const LocalBarChart: React.FC<genericChartsProps> = ({ data ,visualTitleAndSubTitle,visualSettings }) => {
 
    // below is error handling checking if the data exists before passing it to the formmater function or to the graph

    const { chartData, chartConfig, error } = useMemo(() => {
        if (!isValidInputData(data)) {
            return { chartData: [], chartConfig: {}, error: "no data found" };
        }

        try {
            const transformedData = transformDataForGenericChart(data);
            const config = generateChartConfig(data);
            return { chartData: transformedData, chartConfig: config, error: null };
        } catch (err) {
            return { chartData: [], chartConfig: {}, error: (err as Error).message };
        }
    }, [data]);

    if (error || chartData.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                <p className="text-gray-500 text-lg">{error || "No data available"}</p>
            </div>
        );
    }

  console.log("chartData bar",chartData)

    return (
        <ChartContainer config={chartConfig}  style={{ backgroundColor: visualSettings.visualColorPalette.chartContainerBackground }} >
             {visualTitleAndSubTitle.visualTitle && <h3 className="text-center text-lg font-bold text-gray-800 ">{visualTitleAndSubTitle.visualTitle}</h3> }  
             {visualTitleAndSubTitle?.customSubTitle ?  <h4 className="text-center text-md font-medium text-gray-600 mt-1">{visualTitleAndSubTitle?.customSubTitle}</h4>  :   visualTitleAndSubTitle?.DefaultSubTitle?.length !== 0 && (
  <div className="flex justify-center gap-1">
    {visualTitleAndSubTitle?.DefaultSubTitle?.map((subTitle, index) => (
      <h4 key={index} className="text-center text-md font-medium text-gray-600 mt-1">
        {subTitle}
        {index < visualTitleAndSubTitle?.DefaultSubTitle?.length - 1 && ","}
      </h4>
    ))}
  </div>
)}
    
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value}
                />
                <YAxis  />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                {Object.keys(chartConfig).map((key) => (
                    <Bar
                        key={key}
                        dataKey={key}
                        fill={chartConfig[key].color}
                        name={chartConfig[key].label}
                    >
                          <LabelList
                 dataKey={key}
                position="center"
                fill="white"
                style={{ fontSize: '12px', fontWeight: 'bold' }}
              />
                    </Bar>
                ))}
            </BarChart>
        </ChartContainer>
    );
};