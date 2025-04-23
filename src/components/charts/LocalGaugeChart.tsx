import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { ChartContainer, ChartTooltipContent } from "../../components/ui/chart";
import { transformDataForGenericChart, generateChartConfig, isValidInputData } from "../../lib/localGenericchartFormat";
import { genericChartsProps } from "../../types/visualSettingsTypes";
import { VisualHeading } from "./VisualHeading";

export const LocalGaugeChart: React.FC<genericChartsProps> = ({
  data,
  visualTitleAndSubTitle,
  visualSettings,
  metaDataLabels,
  analyticsPayloadDeterminer
}) => {
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

  // Extract the value from the first item
  const firstItem = chartData[0];
  const value = firstItem ? firstItem.total : 0;
  
  // Calculate percentage for display (assuming value is a percentage or can be converted to one)
  const percentage = Math.min(100, Math.max(0, value));
  
  // Create data for the gauge - we need both the filled part and the empty part
  const gaugeData = [
    { name: "value", value: percentage },
    { name: "empty", value: 100 - percentage }
  ];

  // Colors for the gauge
  const gaugeColors = [
    visualSettings.visualColorPalette?.length > 0 ? visualSettings.visualColorPalette[0] : "#3b82f6", // Primary color from palette or default blue
    "#e5e7eb" // Light gray for the empty section
  ];
  
  return (
    <ChartContainer
      config={chartConfig}
      style={{ backgroundColor: visualSettings.backgroundColor }}
    >
      {visualTitleAndSubTitle.visualTitle && (
        <h3 className="text-center text-lg font-bold text-gray-800">
          {visualTitleAndSubTitle.visualTitle}
        </h3>
      )}
      {visualTitleAndSubTitle?.customSubTitle ? (
        <h4 className="text-center text-md font-medium text-gray-600 mt-1">
          {visualTitleAndSubTitle?.customSubTitle}
        </h4>
      ) : <VisualHeading analyticsPayloadDeterminer={analyticsPayloadDeterminer} visualTitleAndSubTitle={visualTitleAndSubTitle} />}

      <div className="flex flex-col items-center justify-center h-full relative">
        <PieChart width={200} height={200}>
          <Pie
            data={gaugeData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius={60}
            outerRadius={80}
            paddingAngle={0}
            cornerRadius={0}
          >
            {gaugeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={gaugeColors[index]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltipContent hideLabel nameKey="name" className="bg-white" />} />
        </PieChart>
        
        <div className="absolute flex flex-col items-center justify-center">
          <p
            className="text-3xl font-bold"
            style={{
              color: visualSettings.fillColor || "#1f2937",
              fontSize: visualSettings.XAxisSettings?.fontSize || "1.5rem"
            }}
          >
            {percentage.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500 mt-1">{firstItem?.name || "Value"}</p>
        </div>
      </div>
    </ChartContainer>
  );
};

export default LocalGaugeChart;