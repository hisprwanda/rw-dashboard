import Button from "./../../components/Button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import MyDashboardsTable from "../home/components/MyDashboardsTable";
import OtherDashboardsTable from "../home/components/OtherDashboardsTable";
import { IconAdd16 } from "@dhis2/ui";

export default function dashboardsPage() {
  return (
    <section className="px-14 py-5">
      <div>
        <Tabs defaultValue="mydashboards">
          <div className="flex items-center justify-between">
            <TabsList className=" flex justify-start gap-9 text-primary font-semibold w-[400px] text-xl">
              <TabsTrigger value="mydashboards">My Dashboards</TabsTrigger>
              <TabsTrigger value="otherdasboards">Other Dasboards</TabsTrigger>
            </TabsList>
            <Button text={"Add Dashboard"} icon={<IconAdd16 />} />
          </div>
          <TabsContent value="mydashboards">
            <MyDashboardsTable />
          </TabsContent>
          <TabsContent value="otherdasboards">
            <OtherDashboardsTable />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
