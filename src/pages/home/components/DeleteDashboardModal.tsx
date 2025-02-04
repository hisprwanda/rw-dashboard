import { useState } from "react";

import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";


interface DeleteDashboardModalProps {
    dashboardId: string;
    dashboardName: string;
    onClose: () => void;
    onDelete: (dashboardId: string) => void;
  }


export function DeleteDashboardModal({
    dashboardId,
    dashboardName,
    onClose,
    onDelete,
  }: DeleteDashboardModalProps) {
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
  
    const handleConfirmDelete = async () => {
      setIsLoading(true);
      await onDelete(dashboardId); // Wait for the API call to complete
      setIsLoading(false);
      onClose(); // Close modal only after successful API completion
    };
  
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Delete Dashboard</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the dashboard? Please type the name
              of the dashboard <strong>{dashboardName}</strong> to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dashboardName" className="text-right">
                Dashboard Name
              </Label>
              <Input
                id="dashboardName"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={onClose}
              className="mr-2"
              disabled={isLoading} // Disable Cancel button while loading
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={inputValue !== dashboardName || isLoading} // Disable if name mismatch or loading
              onClick={handleConfirmDelete}
            >
              {isLoading ? "Loading..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }