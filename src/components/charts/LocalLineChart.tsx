import React, { useMemo } from "react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend, Tooltip,LabelList } from "recharts";
import { ChartContainer, ChartTooltipContent } from "../../components/ui/chart";
import { transformDataForLineChart, generateChartConfig, isValidInputData } from "../../lib/localLineChartFormat";

interface LocalLineChartProps {
    data: any;
}

export const LocalLineChart: React.FC<LocalLineChartProps> = ({ data }) => {
    const { chartData, chartConfig, error } = useMemo(() => {
        if (!isValidInputData(data)) {
            return { chartData: [], chartConfig: {}, error: "no data found" };
        }

        try {
            const transformedData = transformDataForLineChart(data);
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
        <ChartContainer config={chartConfig} style={{height:"100%",width:"100%"}} >
            <h3 className="text-center text-lg font-bold text-gray-800 ">Main Title</h3>
            <h4 className="text-center text-md font-medium text-gray-600 mt-1">Sub Title</h4>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} width={100} height={100}  >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value}
                />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                {Object.keys(chartConfig).map((key) => (
                    <Line
                        key={key}
                        dataKey={key}
                        stroke={chartConfig[key].color}
                        name={chartConfig[key].label}
                        dot={{ r: 4 }}
                     label={<CustomLabel />}
                   >
                      
                    </Line>
                ))}
            </LineChart>
        </ChartContainer>
    );
};

function CustomLabel(props: any) {
    const { x, y, value } = props;
    return (
      <text x={x} y={y} dy={-10} fill="var(--color-value)" fontSize={12} fontWeight={"bold"} textAnchor="middle">
        {value}
      </text>
    )}
