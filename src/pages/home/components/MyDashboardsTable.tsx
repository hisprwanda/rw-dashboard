import { useMemo } from "react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { IconStar24, IconStarFilled24 } from "@dhis2/ui";
import { useNavigate } from "react-router-dom";
import { useAuthorities } from "../../../context/AuthContext";
import { useUpdateDashboardFavorite } from "../../../hooks/useUpdateDashFavorite";
import { useDashboardsData } from "../../../services/fetchDashboard";
import { FaEye, FaRegPlayCircle } from "react-icons/fa";

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
  favorites: string[];
}

interface DashboardData {
  key: string;
  value: DashboardValue;
}

interface MyDashboardsTableProps {
  dashboards: DashboardData[];
}

const MyDashboardsTable: React.FC<MyDashboardsTableProps> = ({ dashboards }) => {
  const navigate = useNavigate();
  const { userDatails } = useAuthorities();
  const userId = userDatails?.me?.id;
  const { refetch, loading } = useDashboardsData();
  const { isUpdatingDashboard, toggleFavorite } = useUpdateDashboardFavorite({
    userId,
    refetch,
  });

  const handleViewMore = (dashboardId: string) => {
    navigate(`/dashboard/${dashboardId}`);
  };

  const handlePresentDashboard = (dashboardId: string) => {
    navigate(`/dashboard/${dashboardId}/present`);
  };

  // Sort dashboards by favorite status
  const sortedDashboards = useMemo(() => {
    if (!dashboards || !userId) return [];

    return [...dashboards].sort((a, b) => {
      const aIsFavorite = (a.value.favorites || []).includes(userId);
      const bIsFavorite = (b.value.favorites || []).includes(userId);

      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;

      // If both have same favorite status, sort by name
      return a.value.dashboardName.localeCompare(b.value.dashboardName);
    });
  }, [dashboards, userId]);

  const columns = useMemo<MRT_ColumnDef<DashboardData>[]>(() => [
    {
      accessorFn: (row) => row.value.dashboardName,
      header: "Name",
    },
    {
      accessorFn: (row) => new Date(row.value.createdAt).toLocaleDateString(),
      header: "Created At",
    },
    {
      accessorKey: "isFavorite",
      header: "Actions",
      Cell: ({ row }) => {
        const isFavorited = (row.original.value.favorites || []).includes(userId);

        return (
          <div className="flex items-center gap-3">
            <FaEye
              className="text-gray-500 text-2xl hover:text-blue-500 cursor-pointer transition-colors"
              onClick={() => handleViewMore(row.original.key)}
            />
            <FaRegPlayCircle
              className="text-gray-500 text-2xl hover:text-blue-500 cursor-pointer transition-colors"
              onClick={() => handlePresentDashboard(row.original.key)}
            />
            <span
              onClick={() => toggleFavorite(row.original.key, row.original.value)}
              className={`transition-transform ${
                isUpdatingDashboard
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer hover:scale-110"
              }`}
              title={isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorited ? (
                <IconStarFilled24 color="gold" className="text-2xl" />
              ) : (
                <IconStar24 color="gray" className="text-2xl" />
              )}
            </span>
          </div>
        );
      },
    },
  ], [userId, isUpdatingDashboard, toggleFavorite]);

  const table = useMantineReactTable({
    columns,
    data: sortedDashboards, // Use the sorted dashboards instead of the original
  });

  return <MantineReactTable table={table} />;
};

export default MyDashboardsTable;