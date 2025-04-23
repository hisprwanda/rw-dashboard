import React, { useMemo } from "react";
import { useAuthorities } from "../../context/AuthContext";
import { ChartContainer } from "../../components/ui/chart";
import { transformDataForGenericChart, generateChartConfig, isValidInputData } from "../../lib/localGenericchartFormat";
import { genericChartsProps } from "../../types/visualSettingsTypes";

export const LocalSingleValue: React.FC<genericChartsProps> = ({ 
  data, 
  visualTitleAndSubTitle, 
  visualSettings, 
  metaDataLabels, 
  analyticsPayloadDeterminer 
}) => {
  // Error handling to check if data exists before passing it to the formatter function or graph
  const { chartData, chartConfig, error } = useMemo(() => {
    if (!isValidInputData(data)) {
      return { chartData: [], chartConfig: {}, error: "No data found" };
    }
    try {
      const transformedData = transformDataForGenericChart(data, "pie", visualSettings.visualColorPalette, metaDataLabels);
      const config = generateChartConfig(data, visualSettings.visualColorPalette);
      return { chartData: transformedData, chartConfig: config, error: null };
    } catch (err) {
      return { chartData: [], chartConfig: {}, error: (err as Error).message };
    }
  }, [data, visualSettings, metaDataLabels]);

  if (error || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <p className="text-gray-500 text-lg">{error || "No data available"}</p>
      </div>
    );
  }

  // Extract only the first item from chartData
  const firstItem = chartData[0];

  return (
    <ChartContainer config={chartConfig} style={{ backgroundColor: visualSettings.backgroundColor }}>
      <div className="flex justify-center items-center h-full w-full">
        {firstItem && (
          <article 
            style={{ 
              backgroundColor: visualSettings.backgroundColor, 
            }}
            className="rounded-lg shadow-md p-6 flex flex-col justify-center items-center h-full w-full"
          >
            <p 
              style={{ 
                color: visualSettings.fillColor, 
                fontSize: visualSettings.XAxisSettings.fontSize, 
                fontWeight: 'bold' 
              }}
            >
              {firstItem.total.toLocaleString()}
            </p>
          </article>
        )}
      </div>
    </ChartContainer>
  );
};