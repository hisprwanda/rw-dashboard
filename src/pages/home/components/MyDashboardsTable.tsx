import { useMemo } from "react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { IconStar24, IconStarFilled24 } from "@dhis2/ui";

type Dashboard = {
  name: string;
  createdAt: string;
  isFavorite: boolean;
};

const data: Dashboard[] = [
  {
    name: "Malaria Incidence Tracking",
    createdAt: "2023-02-10T10:30:45",
    isFavorite: true,
  },
  {
    name: "COVID-19 Testing Data",
    createdAt: "2023-03-12T14:50:00",
    isFavorite: false,
  },
  {
    name: "HIV/AIDS Program Progress",
    createdAt: "2023-05-08T09:20:00",
    isFavorite: true,
  },
  {
    name: "Maternal Health Monitoring",
    createdAt: "2023-06-14T16:35:00",
    isFavorite: false,
  },
  {
    name: "Child Immunization Coverage",
    createdAt: "2023-08-21T11:45:20",
    isFavorite: true,
  },
  {
    name: "Diabetes Management Statistics",
    createdAt: "2023-07-09T18:10:30",
    isFavorite: false,
  },
  {
    name: "Tuberculosis Control Dashboard",
    createdAt: "2023-09-01T13:05:15",
    isFavorite: true,
  },
  {
    name: "Cardiovascular Disease Reports",
    createdAt: "2023-10-10T08:55:40",
    isFavorite: true,
  },
  {
    name: "Cancer Screening Outcomes",
    createdAt: "2023-09-25T15:45:10",
    isFavorite: false,
  },
  {
    name: "Respiratory Illness Surveillance",
    createdAt: "2023-11-02T10:15:55",
    isFavorite: true,
  },
];

const MyDashboardsTable = () => {
  const columns = useMemo<MRT_ColumnDef<Dashboard>[]>(
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
