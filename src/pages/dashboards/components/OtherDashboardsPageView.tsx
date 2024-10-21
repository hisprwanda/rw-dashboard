import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import BoxView from "./BoxView";
import TableView from "./TableView";
import { IconApps24, IconList24 } from "@dhis2/ui";

type Dashboard = {
  name: string;
  createdAt: string;
  isFavorite: boolean;
};

const data: Dashboard[] = [
  {
    name: "Cardiovascular Disease Incidents",
    createdAt: "2023-02-12T08:20:10",
    isFavorite: false,
  },
  {
    name: "Diabetes Monitoring",
    createdAt: "2023-03-18T10:30:50",
    isFavorite: true,
  },
  {
    name: "Cancer Registry",
    createdAt: "2023-05-22T14:45:05",
    isFavorite: true,
  },
  {
    name: "Air Pollution Impact Analysis",
    createdAt: "2023-06-10T16:25:30",
    isFavorite: false,
  },
  {
    name: "Smoking Trends and Risks",
    createdAt: "2023-07-08T09:50:00",
    isFavorite: true,
  },
  {
    name: "Alcohol Consumption Data",
    createdAt: "2023-09-14T11:05:45",
    isFavorite: false,
  },
  {
    name: "Asthma Prevalence Report",
    createdAt: "2023-10-11T18:30:15",
    isFavorite: true,
  },
  {
    name: "Health Expenditure Metrics",
    createdAt: "2023-11-02T20:45:35",
    isFavorite: false,
  },
  {
    name: "Sanitation and Hygiene Initiatives",
    createdAt: "2023-12-09T15:20:50",
    isFavorite: true,
  },
  {
    name: "Road Accident Statistics",
    createdAt: "2024-01-05T07:10:30",
    isFavorite: false,
  },
  {
    name: "Emergency Room Visits Overview",
    createdAt: "2024-01-18T13:55:20",
    isFavorite: true,
  },
  {
    name: "Seasonal Flu Vaccination Uptake",
    createdAt: "2024-02-22T08:40:00",
    isFavorite: true,
  },
  {
    name: "Child Nutrition Survey",
    createdAt: "2024-03-10T10:15:35",
    isFavorite: false,
  },
  {
    name: "Hospital Readmission Rates",
    createdAt: "2024-04-05T12:30:45",
    isFavorite: true,
  },
  {
    name: "Prescription Drug Usage",
    createdAt: "2024-04-20T09:50:25",
    isFavorite: false,
  },
  {
    name: "Health Infrastructure Projects",
    createdAt: "2024-05-10T11:35:55",
    isFavorite: true,
  },
  {
    name: "Mental Health Services Access",
    createdAt: "2024-06-15T14:50:10",
    isFavorite: true,
  },
  {
    name: "Vaccination Coverage Rates",
    createdAt: "2024-07-01T08:05:00",
    isFavorite: false,
  },
  {
    name: "Hepatitis Surveillance",
    createdAt: "2024-08-18T19:20:35",
    isFavorite: true,
  },
  {
    name: "Birth and Mortality Rates",
    createdAt: "2024-09-02T16:30:20",
    isFavorite: false,
  },
  {
    name: "Public Health Campaigns",
    createdAt: "2024-10-10T09:45:50",
    isFavorite: true,
  },
  {
    name: "Communicable Disease Outbreaks",
    createdAt: "2024-11-01T17:55:25",
    isFavorite: true,
  },
];

export default function MyDashboardsPageView() {
  return (
    <div className="mt-14">
      <Tabs defaultValue="boxView">
        <TabsList className=" flex justify-start gap-1 text-primary font-semibold w-[400px] mb-8">
          <TabsTrigger
            value="boxView"
            className="bg-[#212934] size-9 rounded-[3px]"
          >
            <IconApps24 color="white" />
          </TabsTrigger>
          <TabsTrigger
            value="tableView"
            className="bg-[#212934] size-9 rounded-[3px]"
          >
            <IconList24 color="white" />
          </TabsTrigger>
        </TabsList>
        <TabsContent value="boxView">
          <BoxView data={data} />
        </TabsContent>
        <TabsContent value="tableView">
          <TableView data={data} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
