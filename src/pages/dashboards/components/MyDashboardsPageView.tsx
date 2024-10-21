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
    name: "Malaria Cases",
    createdAt: "2023-01-10T08:45:30",
    isFavorite: true,
  },
  {
    name: "COVID-19 Vaccinations",
    createdAt: "2023-02-18T09:30:00",
    isFavorite: false,
  },
  {
    name: "Tuberculosis Treatment Progress",
    createdAt: "2023-03-20T10:45:15",
    isFavorite: true,
  },
  {
    name: "HIV Prevalence",
    createdAt: "2023-04-25T14:15:30",
    isFavorite: false,
  },
  {
    name: "Child Mortality Rates",
    createdAt: "2023-05-30T17:05:00",
    isFavorite: true,
  },
  {
    name: "Maternal Health Metrics",
    createdAt: "2023-06-18T11:20:45",
    isFavorite: false,
  },
  {
    name: "Immunization Coverage",
    createdAt: "2023-07-22T08:35:10",
    isFavorite: true,
  },
  {
    name: "Waterborne Diseases Trends",
    createdAt: "2023-08-13T13:50:25",
    isFavorite: false,
  },
  {
    name: "Mental Health Statistics",
    createdAt: "2023-09-05T16:40:10",
    isFavorite: true,
  },
  {
    name: "Non-Communicable Diseases",
    createdAt: "2023-10-10T12:10:00",
    isFavorite: true,
  },
  {
    name: "Chronic Respiratory Diseases",
    createdAt: "2023-11-03T09:50:45",
    isFavorite: false,
  },
  {
    name: "Global Nutrition Report",
    createdAt: "2023-12-15T15:00:30",
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
