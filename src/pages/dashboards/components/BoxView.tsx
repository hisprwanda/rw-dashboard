import React, { useMemo, useState } from "react";
import {
  IconMore24,
  IconStarFilled24
} from "@dhis2/ui";
import { useNavigate } from "react-router-dom";
import { useDataEngine } from "@dhis2/app-runtime";
import { useAuthorities } from "../../../context/AuthContext";
import { useDashboardsData } from "../../../services/fetchDashboard";
import { useUpdateDashboardFavorite } from "../../../hooks/useUpdateDashFavorite";
import { Loading } from "../../../components";
import { FaEye } from "react-icons/fa";
import { FaRegPlayCircle } from "react-icons/fa";

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
  const { refetch, loading } = useDashboardsData();
  const { userDatails } = useAuthorities();
  const userId = userDatails?.me?.id;
  const { isUpdatingDashboard, toggleFavorite } = useUpdateDashboardFavorite({
    userId,
    refetch,
  });

  // Sort dashboards with favorites first
  const sortedDashboards = useMemo(() => {
    if (!dashboards || !userId) return [];

    return [...dashboards].sort((a, b) => {
      const aIsFavorite = a.value.favorites?.includes(userId) ?? false;
      const bIsFavorite = b.value.favorites?.includes(userId) ?? false;

      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;

      // If both have same favorite status, sort by name
      return a.value.dashboardName.localeCompare(b.value.dashboardName);
    });
  }, [dashboards, userId]);

  const handleToggleFavorite = (dashboardId: string, dashboard: DashboardValue) => {
    toggleFavorite(dashboardId, dashboard);
  };

  const handleViewMore = (dashboardId: string) => {
    navigate(`/dashboard/${dashboardId}`);
  };

  const handlePresentDashboard = (dashboardId: string) => {
    navigate(`/dashboard/${dashboardId}/present`);
  };

  if (isUpdatingDashboard || loading) {
    return <Loading />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
      {sortedDashboards.map((dashboard) => {
        const isFavorited = dashboard.value.favorites?.includes(userId);

        return (
          <div
            key={dashboard.key}
            className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 relative cursor-pointer"
            onClick={() => handleViewMore(dashboard.key)}
          >
            <div className="bg-gray-100 h-48 w-full flex justify-center items-center rounded-t-lg overflow-hidden">
              <img
                src={dashboard.value.previewImg}
                alt={dashboard.value.dashboardName}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex justify-between items-center mt-4">
              <p className="font-semibold text-gray-700">
                {dashboard.value.dashboardName}
              </p>
              <div className="flex items-center space-x-2">
                <div
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewMore(dashboard.key);
                  }}
                >
                  <FaEye className="text-gray-500 text-2xl hover:text-blue-500 cursor-pointer transition-colors" />
                </div>
                <div
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePresentDashboard(dashboard.key);
                  }}
                >
                  <FaRegPlayCircle className="text-gray-500 text-2xl hover:text-blue-500 cursor-pointer transition-colors" />
                </div>
                <button
                  disabled={isUpdatingDashboard}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(dashboard.key, dashboard.value);
                  }}
                >
                  {isFavorited ? (
                    <IconStarFilled24 color="gold" />
                  ) : (
                    <IconStarFilled24 color="gray" />
                  )}
                </button>
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