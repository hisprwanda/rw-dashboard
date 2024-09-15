import { useMemo, useState } from 'react';
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import { IoIosMore } from "react-icons/io";
import {
  MantineReactTable,
  type MRT_ColumnDef,
} from 'mantine-react-table';
import { Button } from '@mantine/core';
import { GenericModal } from '../../../components';
import { DataSourceForm, DeleteDataSourceCard, SavedDataSourceCard } from './Components';
import { useDataSourceData } from '../../../hooks/DataSourceHooks';

const DataSourceTable = ({ savedDataSourceData }: { savedDataSourceData: any[] }) => {
  const  { refetch }= useDataSourceData()
  // Ensure savedDataSourceData is an array
  const data = Array.isArray(savedDataSourceData) ? savedDataSourceData : [];

  const [isShowViewDataSource,setIsShowViewDataSource] = useState(false)
  const [isShowDataSourceFormEdit,setIsShowDataSourceFormEdit] = useState(false)
  const [isShowDeleteDataSource,setIsShowDeleteDataSource] = useState(false)
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
            <div className="flex gap-5"> {/* Adjust spacing here */}
            {/* view more */}
    
              <IoIosMore className='text-2xl'   onClick={() => handleView(row?.original)} />
              {/* edit */}
              <FaRegEdit className='text-2xl'   onClick={() => handleEdit(row?.original)} />
                {/* Delete */}
              <RiDeleteBin5Line className='text-2xl'    onClick={() => handleDelete(row?.original)} />
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
    setIsShowDataSourceFormEdit(true); 
    setSelectedDataSource(data) 
    console.log('Y-Edit key x:', data);
  };

  const handleDelete = (data:any) => {
    setSelectedDataSource(data)
    setIsShowDeleteDataSource(true);  // Show modal to confirm delete
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
       isOpen={isShowDataSourceFormEdit}
       setIsOpen={setIsShowDataSourceFormEdit}

       >
         <DataSourceForm title="Edit Data Source" action="update" data={selectedDataSource} refetch={refetch} setIsShowDataSourceFormEdit={setIsShowDataSourceFormEdit}   />
       </GenericModal>
       {/* delete data source */}
       <GenericModal
       isOpen={isShowDeleteDataSource}
       setIsOpen={setIsShowDeleteDataSource}
       >
       <DeleteDataSourceCard id={selectedDataSource?.key} setIsShowDeleteDataSource={setIsShowDeleteDataSource}  refetch={refetch} />
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
