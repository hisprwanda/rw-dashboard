import React, { useState } from "react";
import {
  IconMore24,
  IconStarFilled24
} from "@dhis2/ui";
import { useNavigate } from "react-router-dom";
import { useDataEngine } from "@dhis2/app-runtime";
import { useAuthorities } from "../../../context/AuthContext";
import { useDashboardsData } from "../../../services/fetchDashboard";

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
  favorites: any[];
}

interface DashboardData {
  key: string;
  value: DashboardValue;
}

interface BoxViewProps {
  dashboards: DashboardData[];
}

const BoxView: React.FC<BoxViewProps> = ({ dashboards }) => {
  const engine = useDataEngine();
  const navigate = useNavigate();
  const { refetch,loading} = useDashboardsData();
  const { userDatails } = useAuthorities();
  const userId = userDatails?.me?.id; 
  const [isUpdatingDashboard,setIsUpdatingDashboard] =useState(false)

  // Toggle favorite status for the current user
  const toggleFavorite = async (dashboardId: string, dashboard: DashboardValue) => {
    const isFavorited = dashboard.favorites?.includes(userId);
    const updatedFavorites = isFavorited
      ? dashboard.favorites.filter((id) => id !== userId)
      : [...(dashboard.favorites || []), userId]; // Default to empty array if undefined

    try {
      // Update the backend with the new favorites array
      setIsUpdatingDashboard(true)
      await engine.mutate({
        resource: `dataStore/rw-dashboard/${dashboardId}`,
        type: "update",
        data: { ...dashboard, favorites: updatedFavorites },
      });
      // refech data
      refetch()
      console.log("Dashboard favorite status updated successfully");
    } catch (error) {
      console.error("Error updating dashboard favorite status:", error);
    }finally{
      setIsUpdatingDashboard(false)
    }
  };

  const handleViewMore = (dashboardId: string) => {
    navigate(`/dashboard/${dashboardId}`);
  };

   if(isUpdatingDashboard || loading)
   {
    return <div>Loading...</div>
   }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      {dashboards.map((dashboard) => {
        const isFavorited = dashboard.value.favorites?.includes(userId);

        return (
          <div
            key={dashboard.key}
            className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 relative"
          >
            <div className="bg-gray-100 h-48 w-full flex justify-center items-center rounded-t-lg">
              <img src={dashboard.value.previewImg} alt={dashboard.value.dashboardName} />
            </div>

            <div className="flex justify-between items-center mt-4">
              <p className="font-semibold text-gray-700">
                {dashboard.value.dashboardName}
              </p>
              <div className="flex items-center space-x-2">
                {/* Favorite Icon */}
                <div
                  className="cursor-pointer"
                  onClick={() => toggleFavorite(dashboard.key, dashboard.value)}
                >
                  {isFavorited ? (
                    <IconStarFilled24 color="gold" /> //  favorite
                  ) : (
                    <IconStarFilled24 color="gray" /> //unfavorited
                  )}
                </div>

                {/* View More Icon */}
                <div className="cursor-pointer" onClick={() => handleViewMore(dashboard.key)}>
                  <IconMore24 />
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-400 mt-2">
              Modified: {new Date(dashboard.value.updatedAt).toLocaleDateString()}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default BoxView;

