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

type TableViewProps = {
  data: Dashboard[];
};

const TableView: React.FC<TableViewProps> = ({ data }) => {
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

export default TableView;
