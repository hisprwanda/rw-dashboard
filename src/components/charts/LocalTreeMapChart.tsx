import React, { useMemo } from "react";
import { Treemap, ResponsiveContainer } from "recharts";
import { useAuthorities } from "../../context/AuthContext";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../components/ui/chart";
import { transformDataForGenericChart, generateChartConfig, isValidInputData } from "../../lib/localGenericchartFormat";
import { genericChartsProps } from "../../types/visualSettingsTypes";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export const LocalTreeMapChart: React.FC<genericChartsProps> = ({
  data,
  visualTitleAndSubTitle,
  visualSettings,
}) => {
  const { chartData, chartConfig, error } = useMemo(() => {
    if (!isValidInputData(data)) {
      return { chartData: [], chartConfig: {}, error: "no data found" };
    }

    try {
      const transformedData = transformDataForGenericChart(data, "tree");
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

  return (
    <ChartContainer config={chartConfig} style={{ backgroundColor: visualSettings.backgroundColor }}>
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
              <h4 key={index} className="text-center text-md font-medium text-gray-600 mt-1">
                {subTitle}
                {index < visualTitleAndSubTitle?.DefaultSubTitle?.length - 1 && ","}
              </h4>
            ))}
          </div>
        )
      )}

      <ResponsiveContainer width="100%" height={400}>
        <Treemap
          data={chartData}
          dataKey="size"
          ratio={4 / 3}
          stroke="#fff"
          content={<CustomizedContent colors={COLORS} />}
        />
      </ResponsiveContainer>
    </ChartContainer>
  );
};

// Customized content component for Treemap
const CustomizedContent = (props: any) => {
  const { x, y, width, height, index, depth, name, payload, colors } = props;

  // Determine color based on depth and index
  const fillColor =
    depth < 2 ? colors[Math.floor((index / props.root.children.length) * colors.length)] : "#ffffff00";

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fillColor}
        stroke="#fff"
        strokeWidth={2 / (depth + 1e-10)}
        strokeOpacity={1 / (depth + 1e-10)}
      />
      {depth === 1 && (
        <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#fff" fontSize={12}>
          {name}
        </text>
      )}
      {depth === 1 && (
        <text x={x + 4} y={y + 18} fill="#fff" fontSize={16} fillOpacity={0.9}>
          {index + 1}
        </text>
      )}
    </g>
  );
};
