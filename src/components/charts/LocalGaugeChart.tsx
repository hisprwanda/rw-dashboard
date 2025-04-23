import React, { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Text } from "recharts";
import { ChartContainer, ChartTooltipContent } from "../../components/ui/chart";
import { transformDataForGenericChart, generateChartConfig, isValidInputData } from "../../lib/localGenericchartFormat";
import { genericChartsProps } from "../../types/visualSettingsTypes";
import { VisualHeading } from "./VisualHeading";

// Custom component to render the percentage text in the center of the gauge
const CustomLabel = ({ viewBox, value, fillColor, fontSize }) => {
  const { cx, cy } = viewBox;
  return (
    <text 
      x={cx} 
      y={cy - 20} 
      textAnchor="middle" 
      dominantBaseline="middle"
      className="font-bold"
      style={{ 
        fill: fillColor || "#1f2937",
        fontSize: fontSize || "24px"
      }}
    >
      {value.toFixed(1)}
    </text>
  );
};

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
    visualSettings.backgroundColor || "#8bc34a", // Use backgroundColor for the filled part
    "#e5e7eb" // Light gray for the empty section
  ];
  
  // Size calculations based on fontSize
  const baseFontSize = parseInt(visualSettings.XAxisSettings?.fontSize || "16px", 10);
  const chartSize = Math.max(300, baseFontSize * 15); // Scale chart size with font size
  const innerRadius = chartSize * 0.35;
  const outerRadius = chartSize * 0.45;

  return (
    <ChartContainer config={chartConfig}>
      <div className="flex flex-col items-center justify-center w-full h-full">
        <PieChart width={chartSize} height={chartSize/1.5}>
          <Pie
            data={gaugeData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="100%"
            startAngle={180}
            endAngle={0}
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={0}
            cornerRadius={0}
            label={false}
          >
            {gaugeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={gaugeColors[index]} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltipContent hideLabel nameKey="name" className="bg-white" />} />
          
          {/* Custom label component to position the percentage value inside the gauge */}
          <text
            x="50%"
            y="85%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="font-bold"
            style={{
              fill: visualSettings.fillColor || "#1f2937",
              fontSize: visualSettings.XAxisSettings?.fontSize || "24px"
            }}
          >
            {percentage.toFixed(1)}
          </text>
        </PieChart>
      </div>
    </ChartContainer>
  );
};

export default LocalGaugeChart;