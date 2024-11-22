import React, { useMemo } from "react";
import { ResponsiveContainer, Treemap, Tooltip } from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
} from "../../components/ui/chart";
import {
  transformDataForGenericChart,
  generateChartConfig,
  isValidInputData,
} from "../../lib/localGenericchartFormat";
import { genericChartsProps } from "../../types/visualSettingsTypes";

export const LocalTreeMapChart: React.FC<genericChartsProps> = ({
  data,
  visualTitleAndSubTitle,
  visualSettings,
}) => {
  const { chartData, error } = useMemo(() => {
    if (!isValidInputData(data)) {
      return { chartData: [], error: "No data found" };
    }

    try {
      const transformedData = transformDataForGenericChart(data, "tree");
      return { chartData: transformedData, error: null };
    } catch (err) {
      return { chartData: [], error: (err as Error).message };
    }
  }, [data]);

  if (error || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <p className="text-gray-500 text-lg">{error || "No data available"}</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 rounded-md shadow-md border">
          <p className="font-semibold">{`${data.root.name} - ${data.name}`}</p>
          <p>{`Value: ${data.value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer
      style={{ backgroundColor: visualSettings.backgroundColor }}
    >
      {visualTitleAndSubTitle.visualTitle && (
        <h3 className="text-center text-lg font-bold text-gray-800">
          {visualTitleAndSubTitle.visualTitle}
        </h3>
      )}
      {visualTitleAndSubTitle?.customSubTitle ? (
        <h4 className="text-center text-md font-medium text-gray-600 mt-1">
          {visualTitleAndSubTitle.customSubTitle}
        </h4>
      ) : (
        visualTitleAndSubTitle?.DefaultSubTitle?.length !== 0 && (
          <div className="flex justify-center gap-1">
            {visualTitleAndSubTitle.DefaultSubTitle.map((subTitle, index) => (
              <h4
                key={index}
                className="text-center text-md font-medium text-gray-600 mt-1"
              >
                {subTitle}
                {index <
                  visualTitleAndSubTitle.DefaultSubTitle.length - 1 &&
                  ","}
              </h4>
            ))}
          </div>
        )
      )}

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={chartData}
            dataKey="value"
            stroke="hsl(var(--background))"
            fill="hsl(var(--primary))"
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
};
