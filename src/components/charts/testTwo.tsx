"use client"

import { TrendingUp } from "lucide-react"
import { LabelList, Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../components/ui/chart"
const chartData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
]


const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "hsl(var(--chart-1))",
  },
  safari: {
    label: "Safari",
    color: "hsl(var(--chart-2))",
  },
  firefox: {
    label: "Firefox",
    color: "hsl(var(--chart-3))",
  },
  edge: {
    label: "Edge",
    color: "hsl(var(--chart-4))",
  },
  other: {
    label: "Other",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig


function transformDataToPieChartFormat(data:any, colors:any) {
  const totals = {};
  const colorCount = colors.length; // Number of available colors

  // Calculate totals for each disease dynamically
  data.forEach((entry) => {
    for (const key in entry) {
      if (key !== "month") {
        totals[key] = (totals[key] || 0) + entry[key];
      }
    }
  });

  // Transform the totals into the desired array format with dynamic colors
  const transformedData = Object.entries(totals).map(([name, total], index) => ({
    name,
    total,
    fill: colors[index % colorCount], // Assign colors cyclically
  }));

  return transformedData;
}

function transformDataToMonthsAndRange(data:any) {
  // Extract all unique months from the data
  const allMonths = data.map((entry) => entry.month);

  // Determine the range string
  const range = `${allMonths[0]}-${allMonths[allMonths.length - 1]}`;

  // Return the desired format
  return [{ allMonths, range }];
}

const colors = [
  "red",
  "var(--color-safari)",
  "var(--color-firefox)",
  "var(--color-edge)",
  "var(--color-other)",
];

const chartData2 = [
  {
      "month": "Nov 2023",
      "Measles": 155,
      "Acute Flaccid Paralysis": 25
  },
  {
      "month": "Dec 2023",
      "Measles": 137,
      "Acute Flaccid Paralysis": 12
  },
  {
      "month": "Jan 2024",
      "Measles": 80,
      "Acute Flaccid Paralysis": 24
  },
  {
      "month": "Feb 2024",
      "Measles": 128,
      "Acute Flaccid Paralysis": 29
  },
  {
      "month": "Mar 2024",
      "Measles": 147,
      "Acute Flaccid Paralysis": 43
  },
  {
      "month": "Apr 2024",
      "Measles": 130,
      "Acute Flaccid Paralysis": 35
  },
  {
      "month": "May 2024",
      "Measles": 201,
      "Acute Flaccid Paralysis": 49
  },
  {
      "month": "Jun 2024",
      "Measles": 172,
      "Acute Flaccid Paralysis": 24
  },
  {
      "month": "Jul 2024",
      "Measles": 113,
      "Acute Flaccid Paralysis": 11
  },
  {
      "month": "Aug 2024",
      "Measles": 41,
      "Acute Flaccid Paralysis": 7
  }
]


const result = transformDataToPieChartFormat(inputData, colors);
const result2 = transformDataToMonthsAndRange(inputData);
console.log("hello pie data",result);
console.log("hello pie data 2",result2);
export function TestChart() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Pie Chart - Label List</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] [&_.recharts-text]:fill-background"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="visitors" hideLabel />}
            />
            <Pie data={chartData} dataKey="visitors">
              <LabelList
                dataKey="browser"
                className="fill-background"
                stroke="none"
                fontSize={12}
                formatter={(value: keyof typeof chartConfig) =>
                  chartConfig[value]?.label
                }
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  )
}
