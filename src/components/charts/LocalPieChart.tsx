import React, { useMemo } from "react";
import { useAuthorities } from "../../context/AuthContext";
import { Pie, PieChart, Tooltip, Cell, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
} from "../../components/ui/chart";
import { transformDataForGenericChart, generateChartConfig, isValidInputData } from "../../lib/localGenericchartFormat";
import { genericChartsProps } from "../../types/visualSettingsTypes";

export const LocalPieChart: React.FC<genericChartsProps> = ({
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

  // Calculate total for percentage calculation
  const total = chartData.reduce((sum, entry) => sum + entry.total, 0);

  // Custom label formatter to show name, number and percentage in two lines
  const renderCustomLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, value, index, name } = props;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const percentage = ((value / total) * 100).toFixed(1);
    const textAnchor = x > cx ? 'start' : 'end';
    const lineHeight = 20; // Adjust this value to control spacing between lines

    return (
      <g>
        <text
          x={x}
          y={y - lineHeight/2}
          textAnchor={textAnchor}
          style={{ 
            fontSize: visualSettings.XAxisSettings.fontSize, 
            fontWeight: 'bold' 
          }}
        >
          {name}
        </text>
        <text
          x={x}
          y={y + lineHeight/2}
          textAnchor={textAnchor}
          style={{ 
            fontSize: visualSettings.XAxisSettings.fontSize, 
            fontWeight: 'bold' 
          }}
        >
          {`${value} (${percentage}%)`}
        </text>
      </g>
    );
  };

  console.log("mockup pie data", chartData);
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
      
      <PieChart width={400} height={400}>
        <Tooltip content={<ChartTooltipContent className="bg-white" />} />
        <Legend />
        <Pie
          data={chartData}
          dataKey="total"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={130}
          label={renderCustomLabel}
          labelLine={true}
          fill={visualSettings.fillColor}
          style={{ fontSize: visualSettings.XAxisSettings.fontSize, fontWeight: 'bold' }}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={chartConfig[entry.name]?.color} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
};