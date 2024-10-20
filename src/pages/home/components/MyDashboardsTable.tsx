import { useMemo } from "react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { IconStar24, IconStarFilled24 } from "@dhis2/ui";

type Person = {
  name: string;
  createdAt: string;
  isFavorite: boolean;
};

const data: Person[] = [
  {
    name: "Zachary Davis",
    createdAt: "2023-01-10T08:45:30",
    isFavorite: true,
  },
  {
    name: "Robert Smith",
    createdAt: "2023-04-15T11:15:00",
    isFavorite: false,
  },
  {
    name: "Kevin Yan",
    createdAt: "2023-06-21T09:00:00",
    isFavorite: true,
  },
  {
    name: "John Upton",
    createdAt: "2023-07-30T14:25:45",
    isFavorite: false,
  },
  {
    name: "Nathan Harris",
    createdAt: "2023-09-05T19:10:00",
    isFavorite: true,
  },
];

const MyDashboardsTable = () => {
  const columns = useMemo<MRT_ColumnDef<Person>[]>(
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
    data,
  });

  return <MantineReactTable table={table} />;
};

export default MyDashboardsTable;
