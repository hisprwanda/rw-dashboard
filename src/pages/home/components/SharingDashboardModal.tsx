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

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
  } from "../../../components/ui/select"
  


interface SharingDashboardModalProps {
    dashboardId: string;
    dashboardName: string;
    onClose: () => void;
    onSharing: (dashboardId: string) => void;
  }


export function SharingDashboardModal({
    dashboardId,
    dashboardName,
    onClose,
    onSharing,
  }: SharingDashboardModalProps) {
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
  
    const handleConfirmSharing = async () => {
      setIsLoading(true);
      await onSharing(dashboardId); // Wait for the API call to complete
      setIsLoading(false);
      onClose(); // Close modal only after successful API completion
    };
  
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Sharing and access: <strong>{dashboardName}</strong> </DialogTitle>
            <DialogDescription>
            Give access to a user or group
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dashboardName" className="text-right whitespace-nowrap">
                User or Group
              </Label>
              <Input
                id="dashboardName"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="col-span-3"
              />
            </div>
            {/* Access level */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dashboardName" className="text-right whitespace-nowrap">
                Access Level
              </Label>
         
              <Select>
      <SelectTrigger className="bg-white ">
        <SelectValue placeholder="Select access" />
      </SelectTrigger>
      <SelectContent className="bg-white">
        <SelectGroup>
          {/* <SelectLabel> Access Level</SelectLabel> */}
          <SelectItem value="View only">View only</SelectItem>
          <SelectItem value="View and Edit">View and Edit</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
           
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
              disabled={inputValue !== dashboardName || isLoading} // Disable if  loading
              onClick={handleConfirmSharing}
            >
              {isLoading ? "Loading..." : "Confirm Sharing"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }