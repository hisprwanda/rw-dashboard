import { IconVisualizationColumnStacked24 } from "@dhis2/ui";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import MyDashboardsTable from "./components/MyDashboardsTable";
import OtherDashboardsTable from "./components/OtherDashboardsTable";
import { useDashboardsData } from "../../services/fetchDashboard";
import { useAuthorities } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";




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
  isOfficialDashboard:boolean;
  previewImg:string,
  favorites: any[];
}

interface DashboardData {
  key: string;
  value: DashboardValue;
}

interface DataStoreResponse {
  dataStore?: {
    entries: DashboardData[];
  };
}

interface UserDetails {
  me?: {
    id: string;
    // ....
  };
}

const filterSavedChartsByCreatorId = (
  data: DashboardData[] | undefined,
  creatorId: string | undefined
): DashboardData[] => {
  if (!data || !creatorId) return [];
  return data.filter((item) => item.value.createdBy.id === creatorId);
};

const filterOtherCharts = (
  data: DashboardData[] | undefined,
  creatorId: string | undefined
): DashboardData[] => {
  if (!data || !creatorId) return [];
  return data.filter((item) => item.value.createdBy.id !== creatorId);
};


const filterPinnedDashboard = (
  data: DashboardData[] | undefined
): DashboardData[] => {
  if (!data ) return [];
  return data.filter((item) => item.value.isOfficialDashboard === true);
};
 


export default function HomePage() {
  const navigate = useNavigate();
  const { data, loading, isError } = useDashboardsData();
  const { userDatails } = useAuthorities();

  const myDashboards = filterSavedChartsByCreatorId(
    data?.dataStore?.entries,
    userDatails?.me?.id
  );

  const otherDashboards = filterOtherCharts(
    data?.dataStore?.entries,
    userDatails?.me?.id
  );
  
  const pinnedDashboards = filterPinnedDashboard(data?.dataStore?.entries)

  const handleViewMore = (dashboardId:string)=>{
    navigate(`/dashboard/${dashboardId}`)
  
  }

  return (
    <section className="px-14 py-9">
      <h1 className="text-primary font-semibold">Pinned Dashboards</h1>
      <div className="mt-7 flex gap-8">
        {pinnedDashboards.map((dashboard, index) => (
          <div
            key={index}
            className="bg-dhisGrey500 rounded-[5px] border border-primary w-[300px] cursor-pointer"
            onClick={()=>handleViewMore(dashboard.key)}
          >
            <div className="p-2 font-semibold">{dashboard.value.dashboardName}</div>
            <div className="flex h-48 items-center justify-center bg-white rounded-b-[5px]">
            <img  className="w-full h-full" src={dashboard.value.previewImg} alt={dashboard.value.dashboardName} />
  
            </div>
          </div>
        ))}
      </div>
      <div className="mt-14">
        <Tabs defaultValue="mydashboards">
          <TabsList className=" flex justify-start gap-9 text-primary font-semibold w-[400px] mb-8">
            <TabsTrigger value="mydashboards">My Dashboards</TabsTrigger>
            <TabsTrigger value="otherdasboards">Other Dasboards</TabsTrigger>
          </TabsList>
          <TabsContent value="mydashboards">
            <MyDashboardsTable dashboards={myDashboards} />
          </TabsContent>
          <TabsContent value="otherdasboards">
            <OtherDashboardsTable dashboards={otherDashboards} />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
