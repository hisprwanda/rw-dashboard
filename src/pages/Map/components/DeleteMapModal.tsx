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



interface DeleteMapModalProps {
    MapId: string;
    MapName: string;
    onClose: () => void;
    onDelete: (MapId: string) => void;
  }


export function DeleteMapModal({
    MapId,
    MapName,
    onClose,
    onDelete,
  }: DeleteMapModalProps) {
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);

  
    const handleConfirmDelete = async () => {
      setIsLoading(true);
      await onDelete(MapId); // Wait for the API call to complete
      setIsLoading(false);
      onClose(); // Close modal only after successful API completion
    };
  
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Delete Map</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the Map? Please type the name
              of the Map <strong>{MapName}</strong> to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="MapName" className="text-right">
                Map Name
              </Label>
              <Input
                id="MapName"
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
              disabled={inputValue !== MapName || isLoading} // Disable if name mismatch or loading
              onClick={handleConfirmDelete}
            >
              {isLoading ? "Loading..." : "Confirm Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }