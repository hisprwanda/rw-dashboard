import React from "react";
import {
  IconMore24,
  IconStarFilled24,
  IconVisualizationColumnStacked24,
} from "@dhis2/ui";
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
  previewImg: string;
  dashboardDescription: string;
  selectedVisuals: SelectedVisual[];
}

interface DashboardData {
  key: string;
  value: DashboardValue;
}
interface BoxViewProps {
  dashboards: DashboardData[];
}

const BoxView: React.FC<BoxViewProps> = ({ dashboards }) => {
  
  const navigate = useNavigate()
   const handleViewMore = (dashboardId:string)=>{
     navigate(`/dashboard/${dashboardId}`)
   
   }

  // main return 
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      {dashboards.map((dashboard) => ( 
        <div
          key={dashboard.key}
          className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 relative"
        >
          <div className="bg-gray-100 h-48 w-full flex justify-center items-center rounded-t-lg">
            {/* <IconVisualizationColumnStacked24 />
            <div>soon</div> */}
            <img src={dashboard.value.previewImg} alt={dashboard.value.dashboardName} />
          </div>

          <div className="flex justify-between items-center mt-4">
            <p className="font-semibold text-gray-700">
              {dashboard.value.dashboardName} 
            </p>
            <div className="flex items-center space-x-2">
            <div className=" cursor-pointer "   >
              <IconStarFilled24 />
              </div>
               {/*view more  */}
               <div className=" cursor-pointer "  onClick={()=>handleViewMore(dashboard.key)}  >
               <IconMore24  />
               </div>
           
            </div>
          </div>

          <p className="text-sm text-gray-400 mt-2">
            Modified: {new Date(dashboard.value.updatedAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default BoxView;