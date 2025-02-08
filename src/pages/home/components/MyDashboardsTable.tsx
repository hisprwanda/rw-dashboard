import { useMemo, useState } from "react";
import { useDataEngine } from '@dhis2/app-runtime';
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
import { FaEye, FaRegPlayCircle, FaRegTrashAlt, FaShareAlt } from "react-icons/fa";
import { useToast } from "../../../components/ui/use-toast";
import { DeleteDashboardModal } from "./DeleteDashboardModal";
import { SharingDashboardModal } from "./SharingDashboardModal";




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
  const { toast } = useToast();
  const [deleteModalData, setDeleteModalData] = useState<{
    dashboardId: string;
    dashboardName: string;
  } | null>(null);
  const [sharingModalData, setSharingModalData] = useState<{
    dashboardId: string;
    dashboardName: string;
    savedDashboardData:any
  } | null>(null);

  const navigate = useNavigate();
  const { userDatails } = useAuthorities();
  const userId = userDatails?.me?.id;
  const { refetch } = useDashboardsData();
  const { isUpdatingDashboard, toggleFavorite } = useUpdateDashboardFavorite({
    userId,
    refetch,
  });

  const engine = useDataEngine();

  const handleDeleteDashboard = async (dashboardId: string) => {
    try {
      await engine.mutate({
        resource: `dataStore/${process.env.REACT_APP_DASHBOARD_STORE}/${dashboardId}`,
        type: "delete",
      });

      toast({
        title: "Success",
        description: "Dashboard deleted successfully",
        variant: "default",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      console.error("Failed to delete dashboard:", error);
    }
  };

  const sortedDashboards = useMemo(() => {
    if (!dashboards || !userId) return [];

    return [...dashboards].sort((a, b) => {
      const aIsFavorite = (a.value.favorites || []).includes(userId);
      const bIsFavorite = (b.value.favorites || []).includes(userId);

      if (aIsFavorite && !bIsFavorite) return -1;
      if (!aIsFavorite && bIsFavorite) return 1;

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
      accessorFn: (row) => new Date(row.value.updatedAt).toLocaleDateString(),
      header: "Updated At",
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
              onClick={() => navigate(`/dashboard/${row.original.key}`)}
            />
             
            <FaRegPlayCircle
              className="text-gray-500 text-2xl hover:text-blue-500 cursor-pointer transition-colors"
              onClick={() => navigate(`/dashboard/${row.original.key}/present`)}
            />
               <FaShareAlt
              className="text-gray-500 text-2xl hover:text-blue-500  cursor-pointer transition-colors"
              onClick={() =>
                setSharingModalData({
                  dashboardId: row.original.key,
                  dashboardName: row.original.value.dashboardName,
                  savedDashboardData:row.original.value
                })
              }
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

        
            <FaRegTrashAlt
              className="text-red-500 text-2xl hover:text-red-900 cursor-pointer transition-colors"
              onClick={() =>
                setDeleteModalData({
                  dashboardId: row.original.key,
                  dashboardName: row.original.value.dashboardName,
                })
              }
            />
          </div>
        );
      },
    },
  ], [userId, isUpdatingDashboard, toggleFavorite]);

  const table = useMantineReactTable({
    columns,
    data: sortedDashboards,
  });

  return (
    <div>
      {deleteModalData && (
        <DeleteDashboardModal
          dashboardId={deleteModalData.dashboardId}
          dashboardName={deleteModalData.dashboardName}
          onClose={() => setDeleteModalData(null)}
          onDelete={handleDeleteDashboard}
        />
      )}
      {sharingModalData && (
        <SharingDashboardModal
          dashboardId={sharingModalData.dashboardId}
          dashboardName={sharingModalData.dashboardName}
          savedDashboardData={sharingModalData.savedDashboardData}
          onClose={() => setSharingModalData(null)}
          onSharing={handleDeleteDashboard}
        />
      )}
      <MantineReactTable table={table} />;
    </div>
  );
};

export default MyDashboardsTable;
