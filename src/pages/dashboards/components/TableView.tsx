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
interface TableViewProps {
  dashboards: DashboardData[];
}

const TableView: React.FC<TableViewProps> = ({ dashboards }) => {
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
        accessorFn: (row) => row.value.createdBy.name,
        header: "Created By",
      },
      {
        accessorFn: (row) => new Date(row.value.updatedAt).toLocaleDateString(),
        header: "Last Modified",
      },
      {
        accessorFn: (row) => row.value.updatedBy.name,
        header: "Modified By",
      },
      {
        accessorFn: (row) => row.value.selectedVisuals.length,
        header: "Visualizations",
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

export default TableView;