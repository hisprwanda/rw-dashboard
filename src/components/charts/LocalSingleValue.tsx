import React, { useMemo } from "react";
import { useAuthorities } from "../../context/AuthContext";
import { Pie, PieChart, Tooltip, Cell, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
} from "../../components/ui/chart";
import { transformDataForGenericChart, generateChartConfig, isValidInputData } from "../../lib/localGenericchartFormat";
import { genericChartsProps } from "../../types/visualSettingsTypes";

export const LocalSingleValue: React.FC<genericChartsProps> = ({
  data,
  visualTitleAndSubTitle,
  visualSettings,
}) => {
  // Error handling to check if data exists before passing it to the formatter function or graph
  const { chartData, chartConfig, error } = useMemo(() => {
    if (!isValidInputData(data)) {
      return { chartData: [], chartConfig: {}, error: "No data found" };
    }

    try {
      const transformedData = transformDataForGenericChart(data, "pie",visualSettings.visualColorPalette);
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

  console.log("mockup single data", chartData);
  console.log("mockup config", chartConfig);

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
        visualTitleAndSubTitle?.DefaultSubTitle?.length !== 0 && (
          <div className="flex justify-center gap-1">
            {visualTitleAndSubTitle?.DefaultSubTitle?.map((subTitle, index) => (
              <h4
                key={index}
                className="text-center text-md font-medium text-gray-600 mt-1"
              >
                {subTitle}
                {index < visualTitleAndSubTitle?.DefaultSubTitle?.length - 1 &&
                  ","}
              </h4>
            ))}
          </div>
        )
      )}
      
      <div
  className="flex flex-wrap justify-center items-center gap-6 p-4 h-full w-full"
  style={{ minHeight: "100%", height: "100%" }}
>
  {chartData?.map((item: { name: string; total: number; fill: string }, index: number) => (
    <article
      key={index}
      style={{ backgroundColor: item.fill, color: visualSettings.fillColor }}
      className="rounded-lg shadow-md p-6 min-w-4 text-center"
    >
      <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
      <p className="text-3xl font-bold">{item.total}</p>
    </article>
  ))}
</div>




    </ChartContainer>
  );
};
