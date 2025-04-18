import React, { useMemo } from "react";
import { Treemap, ResponsiveContainer, Tooltip } from "recharts";
import { ChartContainer } from "../../components/ui/chart";
import { transformDataForGenericChart, generateChartConfig, isValidInputData } from "../../lib/localGenericchartFormat";
import { genericChartsProps } from "../../types/visualSettingsTypes";
import { useAuthorities } from "../../context/AuthContext";




const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length > 0 && payload[0].payload) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2 rounded-md shadow-md border border-gray-300">
        <p className="font-semibold">{`${data.root?.name || "Category"} - ${data.name || "Item"}`}</p>
        <p>{`size: ${data.size || 0}`}</p>
      </div>
    );
  }
  return null;
};

export const LocalTreeMapChart: React.FC<genericChartsProps> = ({
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
      const transformedData = transformDataForGenericChart(data, "tree",_,metaDataLabels);
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
    <ChartContainer config={chartConfig} style={{ backgroundColor: visualSettings.backgroundColor }}>
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
          stroke={visualSettings.fillColor}
          content={<CustomizedContent fontSize={visualSettings.XAxisSettings.fontSize} colors={visualSettings.visualColorPalette.itemsBackgroundColors} />}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

const CustomizedContent = (props: any) => {
  const { x, y, width, height, index, depth, name, colors, root,fontSize } = props;

  const centerX = x + width / 2;
  const centerY = y + height / 2;

  const fillColor =
    depth < 2 ? colors[Math.floor((index / root?.children.length) * colors.length)] : "#ffffff00";

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
        <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#6c0505" fontSize={12}>
          {name}
        </text>
      )}
      {depth === 1 && (
        <text x={x + 4} y={y + 18} fill="#fff" fontSize={16} fillOpacity={0.9}>
          {index + 1}
        </text>
      )}
    
    {depth === 2 && (
         <text
         x={centerX}
         y={centerY + 10} // Adjust the vertical offset for spacing
         textAnchor="middle"
         dominantBaseline="middle"
         fill="#fff"
         fontSize={fontSize}
       >
        {name} 
        {/* {props.size}  */}
       </text>
      // width and height should depend on dynamic like should take size of it content
        // <foreignObject x={x} y={y} width={"40px"} height={"40px"}   >
        //   <div className="bg-white p-2 rounded-md shadow-md border border-gray-300 w-full h-full">
        //     <p className="font-semibold">{`${name || "Item"}`}</p>
        //     <p>{`size: ${props.size || 0}`}</p>
        //   </div>
        // </foreignObject>
      )}
    </g>
  );
};


