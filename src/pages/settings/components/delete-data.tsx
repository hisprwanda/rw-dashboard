import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { useState } from "react";
import {
  RiCloseLargeFill,
  RiDeleteBack2Fill,
  RiDeleteBin2Fill,
} from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import { DataSourceRowProps } from "./show-data";
import { useDataEngine } from "@dhis2/app-runtime";
import { toast } from "../../../hooks/use-toast";

export default function DeleteData({ row, refetch }: DataSourceRowProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const engine = useDataEngine();
  const deleteDataSource = async () => {
    try {
      setIsSubmitting(true);
      const resp = await engine.mutate({
        resource: `dataStore/r-data-source/${row.key}`,
        type: "delete",
      });
      setIsSubmitting(false);
      toast({
        title: "success",
        description: `Data source deleted successfully`,
      });
      setOpen(false);
      refetch();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Oh! action failed",
        description: "deleting failed" + error,
      });
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger asChild>
        <button className="w-[40px] bg-transparent p-1 focus:outline-none focus:shadow-outline text-secondary hover:text-slight hover:bg-transparent">
          <RiDeleteBin2Fill className="text-xl" />
        </button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="bg-blackA6 data-[state=open]:animate-overlayShow fixed inset-0" />
        <AlertDialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
          <AlertDialog.Title className="text-mauve12 -mt-4 font-medium">
            <div className="flex items-start justify-between  py-2">
              <div className="bg-transparent p-1  flex gap-1 focus:outline-none focus:shadow-outline text-secondary  hover:bg-transparent">
                <RiDeleteBin2Fill className="text-xl" /> Are you certain you
                want to proceed with deleting this?
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
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {row.value.instanceName}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Data Source Type:
                <span className="font-medium">{row.value.type}</span>
              </p>
            </div>

            <div className="flex justify-between space-x-4">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm font-medium text-ptext bg-secondary rounded"
              >
                Cancel
              </button>
              <button
                onClick={deleteDataSource}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-ptext bg-primary rounded"
              >
                {isSubmitting ? "Confirming..." : "Confirm"}
              </button>
            </div>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
