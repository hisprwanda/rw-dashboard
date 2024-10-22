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
import DeleteVisualTypeCard from './DeleteVisualTypeCard';
import { useFetchVisualsData } from '../../../services/fetchVisuals';
import { useNavigate } from 'react-router-dom';



const VisualizerTable = ({ savedVisualData }: { savedVisualData: any[] }) => {
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
        accessorKey: 'value.visualName', 
        header: 'Visual Name',
      },
      {
        accessorKey: 'value.visualType',
        header: 'Type',
      },
      // {
      //   accessorKey: 'value.createdBy.name',
      //   header: 'Created By',
      // },
      {
        accessorKey: 'value.createdAt',
        header: 'Created At',
        Cell: ({ cell }) => {
          const timestamp = cell.getValue<number>(); 
          const formattedDate = new Date(timestamp).toLocaleString(); 
          return formattedDate; 
        },
      },
      {
        accessorKey: 'value.updatedAt',
        header: 'Updated At',
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
  navigate(`/visualizers/${data?.key}`)
  console.log("hello view",data)

  };

  const handleDelete = (data:any) => {
    console.log("hello delete",data)
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
        header: 'Actions ',
        size: 55, 
        
      },
      
    },
    renderRowActions: ({ row }) => (
      <div className="flex gap-2  "> 
      <IoIosMore className='text-xl hover:cursor-pointer  hover:text-primary '   onClick={() => handleView(row?.original)} />
      <RiDeleteBin5Line className='text-xl  hover:cursor-pointer  hover:text-red-600 '    onClick={() => handleDelete(row?.original)} />
       </div>
    ),
   
  });
  
  // Table component
  return (
    <div>
 

      <MantineReactTable table={table}  />


      <GenericModal
       isOpen={isShowDeleteVisual}
       setIsOpen={setIsShowDeleteVisual}
       >
       <DeleteVisualTypeCard id={selectedVisual?.key} setIsShowDeleteVisualType={setIsShowDeleteVisual}  refetch={refetch} />
       </GenericModal>

    </div>

  );
};

export default VisualizerTable;
