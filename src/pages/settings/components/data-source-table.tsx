import { DataSourceResponse } from "@/types/DataSource";
import { useDataSourceData } from "../../../hooks/dataSource";
import { ActionIcon, Tooltip } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import {
  MantineReactTable,
  MRT_ColumnDef,
  useMantineReactTable,
} from "mantine-react-table";
import { IconRefresh } from "@tabler/icons-react";
import TableActions from "./table-actions";
import NewData from "./new-data";
import { DataSourceType } from "./add-form";

export default function DataSourceTable() {
  const { data, loading, error, refetch } = useDataSourceData();
  const [transformedData, setTransformedData] = useState<DataSourceResponse[]>(
    []
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    if (data?.dataStore?.entries) {
      const transformed = data.dataStore.entries.map((entry: any) => ({
        key: entry.key,
        value: entry.value,
      }));
      setTransformedData(transformed);
    }
  }, [data]);

  const columns = useMemo<MRT_ColumnDef<DataSourceResponse>[]>(
    () => [
      // {
      //   accessorFn: (row) => {
      //     return row?.key;
      //   },
      //   header: 'ID',
      //   renderColumnActionsMenuItems: () => (
      //     <>
      //      hh
      //     </>
      //   ),
      // },
      {
        accessorFn: (row) => {
          return row?.value?.instanceName;
        },
        header: "Instance",
        size: 40,
      },

      {
        accessorFn: (row) => {
          return row?.value?.authentication.url;
        },
        header: "url",
        size: 40,
      },

      {
        accessorFn: (row) => {
          return row?.value?.type;
        },
        header: "type",
        size: 40,
      },
    ],
    []
  );

  const defaultData: DataSourceResponse[] = [
    {
      key: "default-key",
      value: {
        id: "",
        type: DataSourceType.Other,
        description: "",
        instanceName: "",
        authentication: {
          url: "",
          password: "",
          username: ""
        },
        isCurrentDHIS2: false
      },
    },
  ];

  const table = useMantineReactTable({
    columns,
    data: transformedData,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    // enableColumnVirtualization: true,
    // enableRowVirtualization: true,
    initialState: {
      sorting: [{ id: "Instance", desc: false }],
      //pagination: { pageSize: 5, pageIndex: 0 },
      density: "xs",
      columnPinning: {
        left: ["mrt-row-actions"],
        right: ["type"],
      },
    },
    mantineTableContainerProps: {
      sx: {
        minHeight: "300px",
      },
    },
    //positionActionsColumn: "first",
    enableRowActions: true,
    renderRowActions: ({ row }) => (
      <TableActions refetch={refetch} row={row.original} dataSource={transformedData} />
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <div className="content-start flex flex-row gap-10">
        <Tooltip label="Refresh Data">
          <ActionIcon onClick={() => refetch()}>
            <IconRefresh />
          </ActionIcon>
        </Tooltip>

        {transformedData && <NewData refetch={refetch} dataSource={transformedData.length>0?transformedData:defaultData} />}
      </div>
    ),
    state: {
      isLoading: loading,
      showAlertBanner: error,
    },
  });

  return (
    <>
      <MantineReactTable table={table} />
    </>
  );
}
