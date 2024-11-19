import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useState } from "react";
import { RiCloseLargeFill, RiEdit2Fill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";

export interface DataSourceNewProps {
  refetch: () => void;
}

export default function NewData({ refetch }: DataSourceNewProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>
        <button className="w-[40px] bg-transparent p-1 focus:outline-none focus:shadow-outline text-primary hover:text-plight hover:bg-transparent">
          <RiEdit2Fill className="text-xl" />
        </button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="bg-blackA6 data-[state=open]:animate-overlayShow fixed inset-0" />
        <AlertDialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[460px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
          <AlertDialog.Title className="text-mauve12 -mt-4 font-medium">
            <div className="flex items-start justify-between  py-2">
              <h3 className="text-sm font-semibold text-green-600"> &nbsp; </h3>
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
            NewData
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
