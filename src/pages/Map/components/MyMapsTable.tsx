import { useMemo, useState } from 'react';
import { RiDeleteBin5Line } from "react-icons/ri";
import { IoIosMore } from "react-icons/io";
import { CiEdit } from "react-icons/ci";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from 'mantine-react-table';
import { Button } from '@mantine/core';
import { GenericModal } from '../../../components';
//import DeleteVisualTypeCard from './DeleteVisualTypeCard';
import { useFetchVisualsData } from '../../../services/fetchVisuals';
import { useNavigate } from 'react-router-dom';
import { useAuthorities } from '../../../context/AuthContext';
import { FaEye } from 'react-icons/fa';
import i18n from '../../../locales/index.js'



const MyMapsTable = ({ savedVisualData }: { savedVisualData: any[] }) => {
  const {setAnalyticsData} = useAuthorities();
    const navigate = useNavigate();
    const {refetch}  = useFetchVisualsData()
    const [isShowDeleteVisual,setIsShowDeleteVisual] = useState<boolean>(false)
    const [selectedVisual, setSelectedVisual] = useState<any |undefined>();


  // Ensure savedVisualData is an array
  const data = Array.isArray(savedVisualData) ? savedVisualData : [];

  /// Columns definition
  const columns = useMemo<MRT_ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'value.mapName', 
        header: `${i18n.t('Name')}`,   
      },
      {
        accessorKey: 'value.mapType',
        header: `${i18n.t('Type')}`, 
      },
      // {
      //   accessorKey: 'value.createdBy.name',
      //   header: 'Created By',
      // },
      {
        accessorKey: 'value.createdAt',
        header: `${i18n.t('Created At')}`,
        Cell: ({ cell }) => {
          const timestamp = cell.getValue<number>(); 
          const formattedDate = new Date(timestamp).toLocaleString(); 
          return formattedDate; 
        },
      },
      {
        accessorKey: 'value.updatedAt', 
        header: `${i18n.t('Updated At')}`,
        Cell: ({ cell }) => {
          const timestamp = cell.getValue<number>(); 
          const formattedDate = new Date(timestamp).toLocaleString(); 
          return formattedDate; 
        },
      },
     
    ],
    []
  );

  // Handlers that log the key
  const handleView = (data:any) => {
    // clear existing analytics data
    setAnalyticsData([])
  navigate(`/visualizers/${data?.key}`)
  };

  const handleDelete = (data:any) => {
    setSelectedVisual(data)
    setIsShowDeleteVisual(true);

  };

  const table = useMantineReactTable({
    columns,
    data,
    enableRowActions: true,
    positionActionsColumn: 'last',
    displayColumnDefOptions: {
      'mrt-row-actions': {
        header: `${i18n.t('Actions')}`, 
        size: 55, 
        
      },
      
    },
    renderRowActions: ({ row }) => (
      <div className="flex gap-2  "> 
      <FaEye className='text-xl hover:cursor-pointer  hover:text-primary '   onClick={() => handleView(row?.original)} />
      <RiDeleteBin5Line className='text-xl  hover:cursor-pointer text-red-600  hover:text-red-900 '    onClick={() => handleDelete(row?.original)} />
       </div>
    ),
   
  });
  
  // Table component
  return (
    <div>
 

      <MantineReactTable table={table}  />


      {/* <GenericModal
       isOpen={isShowDeleteVisual}
       setIsOpen={setIsShowDeleteVisual}
       >
       <DeleteVisualTypeCard id={selectedVisual?.key} setIsShowDeleteVisualType={setIsShowDeleteVisual}  refetch={refetch} />
       </GenericModal> */}

    </div>

  );
};

export default MyMapsTable;
