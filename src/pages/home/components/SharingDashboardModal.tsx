import { useEffect, useState, useCallback } from "react";
import debounce from "lodash/debounce";
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
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { useFetchUsersAndUserGroups } from "../../../services/fetchusers";

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
  const { data, fetchUsersAndUserGroups, isError, isLoading: isFetchingUserAndUserGroupLoading } =
    useFetchUsersAndUserGroups();

  // Debounced function to fetch users/groups
  const debouncedFetchUsers = useCallback(
    debounce((searchTerm: string) => {
      if (searchTerm.trim().length > 0) {
        fetchUsersAndUserGroups(searchTerm);
      }
    }, 500),
    [fetchUsersAndUserGroups]
  );

  // Handle input change and trigger debounced API call
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    debouncedFetchUsers(value);
  };

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
          <DialogTitle>
            Sharing and access: <strong>{dashboardName}</strong>
          </DialogTitle>
          <DialogDescription>Give access to a user or group</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dashboardName" className="text-right whitespace-nowrap">
              User or Group
            </Label>
            <Input
              id="dashboardName"
              value={inputValue}
              onChange={handleInputChange}
              className="col-span-3"
            />
          </div>

          {/* Access level */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="accessLevel" className="text-right whitespace-nowrap">
              Access Level
            </Label>

            <Select>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select access" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectGroup>
                  <SelectItem value="View only">View only</SelectItem>
                  <SelectItem value="View and Edit">View and Edit</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="mr-2" disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" disabled={inputValue !== dashboardName || isLoading} onClick={handleConfirmSharing}>
            {isLoading ? "Loading..." : "Confirm Sharing"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
