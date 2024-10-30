import React from "react";
import Button from "../../components/Button";
import { IoIosAddCircle } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useDashboardsData } from "../../services/fetchDashboard";
import { useAuthorities } from "../../context/AuthContext";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import MyDashboardsPageView from "./components/MyDashboardsPageView";
import OtherDashboardsPageView from "./components/OtherDashboardsPageView";
import Loading from "../../components/Loading";

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

const DashboardsPage: React.FC = () => {
  const { data, loading, } = useDashboardsData();
  const { userDatails } = useAuthorities();
  const navigate = useNavigate();

  // Handle "Add Dashboard" button click
  const handleGoToCreateDashboardPage = (): void => {
    navigate("/dashboard");
  };

  // Filter data based on creator ID
  const myDashboards = filterSavedChartsByCreatorId(
    data?.dataStore?.entries,
    userDatails?.me?.id
  );


  const otherDashboards = filterOtherCharts(
    data?.dataStore?.entries,
    userDatails?.me?.id
  );

  return (
    <section className="px-14 py-5">
      <div>
        {loading ? (
          <Loading />
        ) : (
          <Tabs defaultValue="mydashboards">
            <div className="flex items-center justify-between mb-24">
              <TabsList className="flex justify-start gap-9 text-primary font-semibold w-[400px] text-xl">
                <TabsTrigger value="mydashboards">My Dashboards</TabsTrigger>
                <TabsTrigger value="otherdashboards">Other Dashboards</TabsTrigger>
              </TabsList>
              <Button
                text="Add Dashboard"
                icon={<IoIosAddCircle />}
                onClick={handleGoToCreateDashboardPage}
              />
            </div>

            {/* My Dashboards Tab Content */}
            <TabsContent value="mydashboards">
            
              <MyDashboardsPageView dashboards={myDashboards} />
            </TabsContent>

            {/* Other Dashboards Tab Content */}
            <TabsContent value="otherdashboards">
              <OtherDashboardsPageView savedDashboardData={otherDashboards} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </section>
  );
};

export default DashboardsPage;