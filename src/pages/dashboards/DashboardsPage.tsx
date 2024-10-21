import Button from "./../../components/Button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { IconAdd16 } from "@dhis2/ui";
import OtherDashboardsPageView from "./components/OtherDashboardsPageView";
import MyDashboardsPageView from "./components/MyDashboardsPageView";

export default function dashboardsPage() {
  return (
    <section className="px-14 py-5">
      <div>
        <Tabs defaultValue="mydashboards">
          <div className="flex items-center justify-between mb-24">
            <TabsList className=" flex justify-start gap-9 text-primary font-semibold w-[400px] text-xl">
              <TabsTrigger value="mydashboards">My Dashboards</TabsTrigger>
              <TabsTrigger value="otherdasboards">Other Dasboards</TabsTrigger>
            </TabsList>
            <Button text={"Add Dashboard"} icon={<IconAdd16 />} />
          </div>
          <TabsContent value="mydashboards">
            <MyDashboardsPageView />
          </TabsContent>
          <TabsContent value="otherdasboards">
            <OtherDashboardsPageView />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
