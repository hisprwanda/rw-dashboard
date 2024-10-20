import { useMemo } from "react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";

type Record = {
  name: string;
  createdAt: string;
  createdBy: string;
};

const data: Record[] = [
  {
    name: "Zachary Davis",
    createdAt: "2023-01-10T08:45:30",
    createdBy: "Admin User",
  },
  {
    name: "Robert Smith",
    createdAt: "2023-04-15T11:15:00",
    createdBy: "Health Officer",
  },
  {
    name: "Kevin Yan",
    createdAt: "2023-06-21T09:00:00",
    createdBy: "System Manager",
  },
  {
    name: "John Upton",
    createdAt: "2023-07-30T14:25:45",
    createdBy: "Admin User",
  },
  {
    name: "Nathan Harris",
    createdAt: "2023-09-05T19:10:00",
    createdBy: "Health Officer",
  },
];

const OtherDashboardsTable = () => {
  const columns = useMemo<MRT_ColumnDef<Record>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        Cell: ({ cell }) =>
          new Date(cell.getValue<string>()).toLocaleDateString(),
      },
      {
        accessorKey: "createdBy",
        header: "Created By",
      },
    ],
    []
  );

  const table = useMantineReactTable({
    columns,
    data,
  });

  return <MantineReactTable table={table} />;
};

export default OtherDashboardsTable;
