import { useMemo } from "react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { IconStar24, IconStarFilled24 } from "@dhis2/ui";
import { useNavigate } from "react-router-dom";
import { FaEye, FaRegPlayCircle } from "react-icons/fa";
import i18n from '../../../locales/index.js'
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
interface OtherDashboardsTableProps {
  dashboards: DashboardData[];
}

const OtherDashboardsTable: React.FC<OtherDashboardsTableProps> = ({ dashboards }) => {
    const navigate = useNavigate();
    const handleViewMore = (dashboardId: string) => {
      navigate(`/dashboard/${dashboardId}`);
    };
    const handlePresentDashboard = (dashboardId: string) => {
      navigate(`/dashboard/${dashboardId}/present`);
    };
  const columns = useMemo<MRT_ColumnDef<DashboardData>[]>(
    () => [
      {
        accessorFn: (row) => row.value.dashboardName,
        header:`${i18n.t('Name')}`,
      },
      {
        accessorFn: (row) => new Date(row.value.createdAt).toLocaleDateString(),
        header:`${i18n.t('Created At')}`,
      },
      {
        accessorFn: (row) => new Date(row.value.updatedAt).toLocaleDateString(),
        header: `${i18n.t('Updated At')}`,
      },
      {
        accessorFn: (row) => row.value.createdBy.name,
        header:`${i18n.t('Created By')}`, 
      },
       {

           header: `${i18n.t('Actions')}`, 
           Cell: ({ row }) => {
     
             return (
               <div className="flex items-center gap-3">
                   {/* View More Icon */}
               <FaEye
                 className="text-gray-500 text-2xl hover:text-blue-500 cursor-pointer transition-colors"
                 onClick={() => handleViewMore(row.original.key)}
                 title="View More"
               />
               <FaRegPlayCircle
                 className="text-gray-500 text-2xl hover:text-blue-500 cursor-pointer transition-colors"
                 onClick={() => handlePresentDashboard(row.original.key)}
                 title="View More"
               />
           
             
             
             </div>
             
           
             );
           },
         },
    ],
    []
  );

  const table = useMantineReactTable({
    columns,
    data: dashboards,
  });

  return <MantineReactTable table={table} />;
};

export default OtherDashboardsTable;