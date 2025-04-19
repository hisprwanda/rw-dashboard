import React, { useMemo } from "react";
import { Tooltip, RadialBar, RadialBarChart, LabelList, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
} from "../ui/chart";
import { transformDataForGenericChart, generateChartConfig, isValidInputData } from "../../lib/localGenericchartFormat";
import { genericChartsProps } from "../../types/visualSettingsTypes";

export const LocalRadialChat: React.FC<genericChartsProps> = ({
  data,
  visualTitleAndSubTitle,
  visualSettings,
  metaDataLabels
}) => {
  const { chartData, chartConfig, error } = useMemo(() => {
    if (!isValidInputData(data)) {
      return { chartData: [], chartConfig: {}, error: "No data found" };
    }

    try {
      const transformedData = transformDataForGenericChart(data, "radial",visualSettings.visualColorPalette,metaDataLabels);
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
    <ChartContainer
      config={chartConfig}
      style={{ backgroundColor: visualSettings.backgroundColor }}
    >
      {visualTitleAndSubTitle.visualTitle && (
        <h3 className="text-center text-lg font-bold text-gray-800 ">
          {visualTitleAndSubTitle.visualTitle}
        </h3>
      )}
      {visualTitleAndSubTitle?.customSubTitle ? (
        <h4 className="text-center text-md font-medium text-gray-600 mt-1">
          {visualTitleAndSubTitle?.customSubTitle}
        </h4>
      ) : (
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
      )}

      <RadialBarChart
        data={chartData}
        startAngle={-130}
        endAngle={380}
        innerRadius={30}
        outerRadius={110}
      >
        <Tooltip content={<ChartTooltipContent hideLabel nameKey="name" className="bg-white" />} />
        <Legend />
        <RadialBar dataKey="total" background>
          <LabelList
           position="insideStart"
            dataKey="name"
          className="capitalize"
            fontSize={visualSettings.XAxisSettings.fontSize}
            fill={visualSettings.fillColor}           
          />
        </RadialBar>
      </RadialBarChart>
    </ChartContainer>
  );
};
