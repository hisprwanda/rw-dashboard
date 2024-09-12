import { useMemo } from 'react';
import {
  MantineReactTable,
  type MRT_ColumnDef,
} from 'mantine-react-table';
import { Button } from '@mantine/core';

const DataSourceTable = ({ savedDataSourceData }: { savedDataSourceData: any[] }) => {
  // Ensure savedDataSourceData is an array
  const data = Array.isArray(savedDataSourceData) ? savedDataSourceData : [];

  // Columns definition
  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'value.instanceName', // Path to instance name in savedDataSourceData
        header: 'Instance Name',
      },
      {
        accessorKey: 'value.description', // Path to description
        header: 'Description',
      },
      {
        id: 'actions', // Action column
        header: 'Actions',
        Cell: ({ row }: { row: any }) => {
          const { key } = row.original; // Extract the key from the row data

          return (
            <div className="flex space-x-2"> {/* Adjust spacing here */}
              <Button variant="outline" color="blue" size="xs" onClick={() => handleView(key)}>
                View
              </Button>
              <Button variant="outline" color="green" size="xs" onClick={() => handleEdit(key)}>
                Edit
              </Button>
              <Button variant="outline" color="red" size="xs" onClick={() => handleDelete(key)}>
                Delete
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  // Handlers that log the key
  const handleView = (key: string) => {
    console.log('View key:', key);
  };

  const handleEdit = (key: string) => {
    console.log('Edit key:', key);
  };

  const handleDelete = (key: string) => {
    console.log('Delete key:', key);
  };

  // Table component
  return (
    <MantineReactTable
      columns={columns}
      data={data} // Pass dynamic data
    />
  );
};

export default DataSourceTable;
