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
import { Loading } from "../../components";
import { FaEye, FaRegPlayCircle } from "react-icons/fa";
import { filterOtherCharts } from "../../lib/filterOtherDashboards";
import i18n from '../../locales/index.js'
import { useLocalAnalyticsData, useTestOnlineAnalyticsData } from "../../services/test";




interface User {
  id: string;
  name: string;
}

interface SharingAccess {
  accessLevel: string;
  id: string;
  name: string;
  type: string;
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
  generalDashboardAccess: "No access" | "View only" | "View and edit";
  sharing: SharingAccess[];
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


const filterSavedChartsByCreatorId = (
  data: DashboardData[] | undefined,
  creatorId: string | undefined
): DashboardData[] => {
  if (!data || !creatorId) return [];
  return data.filter((item) => item.value.createdBy.id === creatorId);
};




const filterPinnedDashboard = (
  data: DashboardData[] | undefined,
  creatorId: string | undefined,
  userGroupIds: {id:string}[] | undefined
): DashboardData[] => {
  if (!data || !creatorId) return [];

  return data.filter((item) => {
    // First check if it's an official dashboard
    if (!item.value.isOfficialDashboard) {
      return false;
    }

    // If user is the creator of an official dashboard, they can always see it
    if (item.value.createdBy.id === creatorId) {
      return true;
    }

    // For official dashboards created by others, check access conditions:
    
    // Check if generalDashboardAccess is "View only" or "View and edit"
    const hasGeneralAccess = ["View only", "View and edit"].includes(
      item.value.generalDashboardAccess
    );

    // Check if user is directly in sharing array or through a group
    const isUserInSharingList = item.value.sharing.some((share) => {
      if (share?.type === "User") {
        return share.id === creatorId;
      } else if (share?.type === "Group" && userGroupIds) {
        return userGroupIds.some(group => group.id === share.id);
      }
      return false;
    });

    // Allow access if either condition is true
    return hasGeneralAccess || isUserInSharingList;
  });
};

 
export default function HomePage() {
  const { data:TestOnlineAnalyticsData } = useTestOnlineAnalyticsData()
  const { data:LocalOnlineAnalyticsData } = useLocalAnalyticsData()
  console.log({
    TestOnlineAnalyticsData,
    LocalOnlineAnalyticsData
  })
  const navigate = useNavigate();
  const { data, loading, isError } = useDashboardsData();
  const { userDatails } = useAuthorities();

     
  const myDashboards = filterSavedChartsByCreatorId(
    data?.dataStore?.entries,
    userDatails?.me?.id
  );

  const otherDashboards = filterOtherCharts(
    data?.dataStore?.entries,
    userDatails?.me?.id,
    userDatails?.me?.userGroups
  );
  
  const pinnedDashboards = filterPinnedDashboard(data?.dataStore?.entries ,userDatails?.me?.id,  userDatails?.me?.userGroups )

  const handleViewMore = (dashboardId:string)=>{
    navigate(`/dashboard/${dashboardId}`)
  }
  const handlePresentDashboard = (dashboardId:string)=>{
    navigate(`/dashboard/${dashboardId}/present`)
  }

  if(loading)
  {
    return <Loading/>
  }

  return (
    <section className="px-14 py-9">
      <h1 className="text-primary font-semibold">{i18n.t('Pinned Dashboards')}</h1>

      <div className="mt-7 flex gap-8 overflow-auto  ">
        {pinnedDashboards.map((dashboard, index) => (
       <article
       key={index}
       className="relative bg-dhisGrey500 rounded-[5px] border border-primary min-w-[300px] w-[300px] cursor-pointer group"
     >
       {/* Dashboard Name */}
       <div className="p-2 font-semibold">{dashboard.value.dashboardName}</div>
     
       {/* Image Section */}
       <div className="relative flex h-48 items-center justify-center bg-white rounded-b-[5px] overflow-hidden">
         {/* Image */}
         <img
           className="w-full h-full object-cover"
           src={dashboard.value.previewImg}
           alt={dashboard.value.dashboardName}
         />
     
         {/* Overlay on Hover */}
         <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
           {/* Icons */}
           <FaEye
             className="text-white text-3xl mx-2 hover:text-primary cursor-pointer"
             onClick={(e) => {
               e.stopPropagation(); // Prevent triggering article click
               handleViewMore(dashboard.key);
             }}
           />
           <FaRegPlayCircle
             className="text-white text-3xl mx-2 hover:text-green-500 cursor-pointer"
             onClick={(e) => {
               e.stopPropagation(); // Prevent triggering article click
               handlePresentDashboard(dashboard.key);
             }}
           />
         </div>
       </div>
     </article>
     
        ))}
      </div>
      <div className="mt-14">
        <Tabs defaultValue="mydashboards">
          <TabsList className=" flex justify-start gap-9 text-primary font-semibold w-[400px] mb-8">
            <TabsTrigger value="mydashboards">{i18n.t('My Dashboards')}</TabsTrigger>
            <TabsTrigger value="otherdasboards">{i18n.t('Other Dashboards')}</TabsTrigger>
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
