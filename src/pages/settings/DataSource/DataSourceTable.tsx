import { useMemo, useState } from 'react';
import {
  MantineReactTable,
  type MRT_ColumnDef,
} from 'mantine-react-table';
import { Button } from '@mantine/core';
import { GenericModal } from '../../../components';
import { DataSourceForm, SavedDataSourceCard } from './Components';

const DataSourceTable = ({ savedDataSourceData }: { savedDataSourceData: any[] }) => {
  // Ensure savedDataSourceData is an array
  const data = Array.isArray(savedDataSourceData) ? savedDataSourceData : [];

  const [isShowViewDataSource,setIsShowViewDataSource] = useState(false)
  const [isShowDataSourceForm,setIsShowDataSourceForm] = useState(false)
  const [selectedDataSource, setSelectedDataSource] = useState<any[] | undefined>([]);


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
              <Button variant="outline" color="blue" size="xs" onClick={() => handleView(row?.original)}>
                View
              </Button>
              <Button variant="outline" color="green" size="xs" onClick={() => handleEdit(row?.original)}>
                Edit
              </Button>
              <Button variant="outline" color="red" size="xs" onClick={() => handleDelete(row?.original)}>
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
  const handleView = (data:any) => {
    setIsShowViewDataSource(true); 
    setSelectedDataSource(data)
    console.log('P-View key:', data);
  };

  const handleEdit = (data:any) => {
    setIsShowDataSourceForm(true); 
    setSelectedDataSource(data) 
    console.log('Y-Edit key x:', data);
  };

  const handleDelete = (data:any) => {
    setSelectedDataSource(data)
    console.log('Delete key:', data);
  };

  // Table component
  return (
    <div>
       {/* view data source */}
       <GenericModal
       isOpen={isShowViewDataSource}
       setIsOpen={setIsShowViewDataSource}
       >
        <SavedDataSourceCard data={selectedDataSource?.value}/>
       </GenericModal>
       {/* edit data source */}
       <GenericModal
       isOpen={isShowDataSourceForm}
       setIsOpen={setIsShowDataSourceForm}
       >
         <DataSourceForm title="Edit Data Source" action="update" data={selectedDataSource}  />
       </GenericModal>
      {/* delete goog */}
    <MantineReactTable
      columns={columns}
      data={data} 
    />
    </div>

  );
};

export default DataSourceTable;
