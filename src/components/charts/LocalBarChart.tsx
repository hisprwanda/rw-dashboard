import React, { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend, Tooltip } from "recharts";
import {
    ChartContainer,
    ChartTooltipContent,
} from "../../components/ui/chart";
import { InputData, transformDataForBarChart, generateChartConfig } from "../../lib/localBarchartFormat";

interface LocalBarChartProps {
    data: InputData;
}

export const LocalBarChart: React.FC<LocalBarChartProps> = ({ data }) => {
    const chartData = useMemo(() => transformDataForBarChart(data), [data]);
    const chartConfig = useMemo(() => generateChartConfig(data), [data]);

    return (
        <ChartContainer config={chartConfig}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                {Object.keys(chartConfig).map((key) => (
                    <Bar
                        key={key}
                        dataKey={key}
                        fill={chartConfig[key].color}
                    // name={chartConfig[key].label}
                    />
                ))}
            </BarChart>
        </ChartContainer>
    );
};