
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useState } from "react";
import { RiCloseLargeFill, RiDeleteBack2Fill } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { DataSourceRowProps } from "./show-data";


export default function DeleteData({ row, refetch }: DataSourceRowProps) {
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>
        <button className="w-[40px] bg-transparent p-1 focus:outline-none focus:shadow-outline text-secondary hover:text-slight hover:bg-transparent">
        <RiDeleteBack2Fill className="text-xl" />
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
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {row.value.instanceName}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Data Source Type:
                <span className="font-medium">{row.value.type}</span>
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-justify text-gray-700 underline decoration-sky-500 decoration-2 underline-offset-4">
                Description
              </h3>
              <p className="text-gray-600 text-justify  mt-2 leading-relaxed">
                {row.value.description}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 underline decoration-sky-500 decoration-2 underline-offset-4">
                Authentication Details
              </h3>
              <a
                href={row.value.authentication.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-sky-600 font-medium text-sm hover:text-sky-800 transition-colors duration-200"
              >
                {row.value.authentication.url}
              </a>
            </div>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
