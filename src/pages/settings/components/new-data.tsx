import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useState } from "react";
import { RiCloseLargeFill, RiEdit2Fill, RiStickyNoteAddFill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import AddDataSourceForm from "./add-form";
import { IoIosAddCircle } from "react-icons/io";
import { DataSourceResponse } from "@/types/DataSource";

export interface DataSourceNewProps {
  refetch: () => void;
  dataSource: DataSourceResponse[];
}

export default function NewData({ refetch,dataSource }: DataSourceNewProps) {
  const [open, setOpen] = useState(false);
  const handleClose = () => setOpen(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>
        <button className="bg-transparent p-1  flex gap-1 focus:outline-none focus:shadow-outline text-primary hover:text-plight hover:bg-transparent">
          <RiStickyNoteAddFill className="text-2xl" /> Add New Data Source
        </button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="bg-blackA6 data-[state=open]:animate-overlayShow fixed inset-0" />
        <AlertDialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[95vh] w-[90vw] max-w-[550px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
          <AlertDialog.Title className="text-mauve12 -mt-4 font-medium">
            <div className="flex items-start justify-between  py-2">
            <div className="bg-transparent p-1  flex gap-1 focus:outline-none focus:shadow-outline text-primary hover:text-plight hover:bg-transparent">
          <RiStickyNoteAddFill className="text-2xl" /> Add New Data Source
        </div>

              <AlertDialog.Cancel asChild>
                <button
                  type="button"
                  className="cursor-pointer text-gray-400 bg-transparent hover:bg-transparent hover:bg-gray-200"
                  data-modal-toggle="default-modal"
                >
                  <RiCloseLargeFill />
                </button>
              </AlertDialog.Cancel>
            </div>
          </AlertDialog.Title>

          <div className="bg-gradient-to-r from-white to-gray-50 shadow-lg rounded-xl p-6 max-w-lg mx-auto border border-gray-300 hover:shadow-2xl transition-shadow duration-300">
           <AddDataSourceForm dataSource={dataSource} refetch={refetch} handleClose={handleClose}/>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
