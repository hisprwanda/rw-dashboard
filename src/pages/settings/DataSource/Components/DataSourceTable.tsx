import { useMemo, useState } from 'react';

import { FaEye, FaRegEdit } from "react-icons/fa";
import { RiDeleteBin5Line } from "react-icons/ri";
import { IoIosMore } from "react-icons/io";
import { CiEdit } from "react-icons/ci";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from 'mantine-react-table';
import { Button } from '@mantine/core';
import { GenericModal } from '../../../../components';
import { DataSourceForm, DeleteDataSourceCard, SavedDataSourceCard } from '.';
import { useDataSourceData } from '../../../../services/DataSourceHooks';
import i18n from '../../../../locales/index.js'
const DataSourceTable = ({ savedDataSourceData }: { savedDataSourceData: any[] }) => {

  const  { refetch }= useDataSourceData()
  // Ensure savedDataSourceData is an array
  const data = Array.isArray(savedDataSourceData) ? savedDataSourceData : [];
  const [isShowViewDataSource,setIsShowViewDataSource] = useState(false)
  const [isShowDataSourceFormEdit,setIsShowDataSourceFormEdit] = useState(false)
  const [isShowDeleteDataSource,setIsShowDeleteDataSource] = useState(false)
  const [selectedDataSource, setSelectedDataSource] = useState<any[] | undefined>([]);


  /// Columns definition
  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'value.instanceName', 
        header:`${i18n.t('Instance Name')}`
      },

      {
        accessorKey: 'value.type',
        header: `${i18n.t('Type')}`
      },
      {
        accessorKey: 'value.url',
        header: 'Url',
      },
      {
        accessorKey: 'value.description',
        header: 'Description',
      },
     
    ],
    []
  );

  // Handlers that log the key
  const handleView = (data:any) => {
    setIsShowViewDataSource(true); 
    setSelectedDataSource(data)

  };

  const handleEdit = (data:any) => {
    setIsShowDataSourceFormEdit(true); 
    setSelectedDataSource(data) 

  };

  const handleDelete = (data:any) => {
    setSelectedDataSource(data)
    setIsShowDeleteDataSource(true); 

  };

  const table = useMantineReactTable({
    columns,
    data,
    enableRowActions: true,
    positionActionsColumn: 'last',
    displayColumnDefOptions: {
      'mrt-row-actions': {
        header:`${i18n.t('Actions')}`,
        size: 55, 
        
      },
      
    },
    renderRowActions: ({ row }) => (
      <div className="flex gap-2  "> 
      <FaEye className='text-xl hover:cursor-pointer  hover:text-primary '   onClick={() => handleView(row?.original)} />
      <CiEdit className='text-xl hover:cursor-pointer  hover:text-primary '   onClick={() => handleEdit(row?.original)} />
      <RiDeleteBin5Line className='text-xl  hover:cursor-pointer text-red-600 hover:text-red-900 '    onClick={() => handleDelete(row?.original)} />
       </div>
    ),
   
  });
  
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

      <MantineReactTable table={table} />

    </div>

  );
};

export default DataSourceTable;
