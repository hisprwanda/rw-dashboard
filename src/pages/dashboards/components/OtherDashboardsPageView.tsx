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

// Using the same interfaces as defined earlier
interface User {
  id: string;
  name: string;
}

interface VisualQuery {
  myData: {
    params: {
      filter: string;
      dimension: string[];
      includeNumDen: boolean;
      displayProperty: string;
    };
    resource: string;
  };
}

interface SelectedVisual {
  h: number;
  i: string;
  w: number;
  x: number;
  y: number;
  visualName: string;
  visualType: string;
  visualQuery: VisualQuery;
}

interface DashboardValue {
  sharing: any[];
  createdAt: number;
  createdBy: User;
  updatedAt: number;
  updatedBy: User;
  dashboardName: string;
  dashboardDescription: string;
  selectedVisuals: SelectedVisual[];
}

interface DashboardData {
  key: string;
  value: DashboardValue;
}

interface OtherDashboardsPageViewProps {
  savedDashboardData: DashboardData[];
}

export default function OtherDashboardsPageView({
  savedDashboardData
}: OtherDashboardsPageViewProps) {
  return (
    <div className="mt-14">
      <Tabs defaultValue="boxView">
        <TabsList className="flex justify-start gap-1 text-primary font-semibold w-[400px] mb-8">
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
          <BoxView dashboards={savedDashboardData} />
        </TabsContent>
        <TabsContent value="tableView">
          <TableView dashboards={savedDashboardData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}