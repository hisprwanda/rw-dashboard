import { useMemo } from 'react';
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from 'mantine-react-table';

type DataSourceTableProps = {
  savedDataSourceData: any[]; // Accept dynamic data as any[]
};

const DataSourceTable = ({ savedDataSourceData }: DataSourceTableProps) => {

    console.log("backge", savedDataSourceData)
  // Memoize columns (adjust based on your dynamic data structure)
  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'name.firstName', // adjust these keys based on your dynamic data
        header: 'First Name',
      },
      {
        accessorKey: 'name.lastName',
        header: 'Last Name',
      },
      {
        accessorKey: 'address',
        header: 'Address',
      },
      {
        accessorKey: 'city',
        header: 'City',
      },
      {
        accessorKey: 'state',
        header: 'State',
      },
    ],
    [],
  );

  // Initialize Mantine React Table with the dynamic data
  const table = useMantineReactTable({
    columns,
    data: savedDataSourceData, // use the passed data here
  });

  return <MantineReactTable table={table} />;
};

export default DataSourceTable;
