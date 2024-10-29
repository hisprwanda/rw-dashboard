import { useMemo } from "react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { IconStar24, IconStarFilled24 } from "@dhis2/ui";
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
interface MyDashboardsTableProps {
  dashboards: DashboardData[];
}

const MyDashboardsTable: React.FC<MyDashboardsTableProps> = ({ dashboards }) => {
  const columns = useMemo<MRT_ColumnDef<DashboardData>[]>(
    () => [
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
        header: "Favorite",
        Cell: ({ cell }) =>
          cell.getValue<boolean>() ? (
            <IconStarFilled24 color="gold" />
          ) : (
            <IconStar24 color="gray" />
          ),
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

export default MyDashboardsTable;