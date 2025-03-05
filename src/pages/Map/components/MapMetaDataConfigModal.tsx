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



export function MapMetaDataConfigModal() {
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
  
    return (
      <Dialog open>
        <DialogContent className="sm:max-w-[425px] bg-white">
          <DialogHeader>
            <DialogTitle>Add Map</DialogTitle>
            <DialogDescription>
              Are you sure you want to Add the Map? Please type the name
              of the Map <strong>hello</strong> to confirm.
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
             
              className="mr-2"
              disabled={isLoading} 
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
          
            >
              {isLoading ? "Loading..." : "Confirm Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }