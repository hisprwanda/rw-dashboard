import { IconVisualizationColumnStacked24 } from "@dhis2/ui";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import MyDashboardsTable from "./components/MyDashboardsTable";
import OtherDashboardsTable from "./components/OtherDashboardsTable";

const dashboardNames = [
  "Monkeypox Surveillance and Outbreak Response",
  "HIV Treatment and Care Services",
  "Tuberculosis Monitoring Dashboard",
  "COVID-19 Vaccination Statistics",
  "Malaria Prevention and Control",
  "Maternal and Child Health Programs",
];

export default function HomePage() {
  return (
    <section className="px-14 py-9">
      <h1 className="text-primary font-semibold">Pinned Dashboards</h1>
      <div className="mt-7 flex gap-8">
        {dashboardNames.map((name, index) => (
          <div
            key={index}
            className="bg-dhisGrey500 rounded-[5px] border border-primary"
          >
            <div className="p-2 font-semibold">{name}</div>
            <div className="flex h-[25vh] items-center justify-center bg-white rounded-b-[5px]">
              <IconVisualizationColumnStacked24 />
              {/* <img src="" alt="dashboard preview image" /> */}
            </div>
          </div>
        ))}
      </div>
      ;
      <div className="mt-14">
        <Tabs defaultValue="mydashboards">
          <TabsList className=" flex justify-start gap-9 text-primary font-semibold w-[400px] mb-8">
            <TabsTrigger value="mydashboards">My Dashboards</TabsTrigger>
            <TabsTrigger value="otherdasboards">Other Dasboards</TabsTrigger>
          </TabsList>
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
