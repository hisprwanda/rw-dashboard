import { useEffect, useState, useCallback } from "react";
import debounce from "lodash/debounce";
import { CircularLoader } from "@dhis2/ui";
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
import SharedUsersAndGroups from "./SharedUsersAndGroups";
import { useFetchSingleDashboardData, useUpdatingDashboardSharing } from "../../../services/fetchDashboard";
import { useToast } from "../../../components/ui/use-toast";

interface SharingDashboardModalProps {
  dashboardId: string;
  dashboardName: string;
  onClose: () => void;
}

export function SharingDashboardModal({
  dashboardId,
  dashboardName,
  onClose,
}: SharingDashboardModalProps) {
  const { toast } = useToast();
  const { data: allsavedDashboardData, error, isError: isErrorFetchSingleDashboardData, loading: isFetchSingleDashboardDataLoading, refetch } = useFetchSingleDashboardData(dashboardId);
  
  // ✅ Ensure savedDashboardData is always an object (prevents "Cannot read properties of undefined")
  const savedDashboardData = allsavedDashboardData?.dataStore || {};

  const [inputValue, setInputValue] = useState({
    name: "",
    id: "",
    type: "User",
    accessLevel: "View only",
  });

  const [isLoading, setIsLoading] = useState(false);
  const { data: usersAndUserGroupsData, fetchUsersAndUserGroups, isLoading: isFetchingUserAndUserGroupLoading } = useFetchUsersAndUserGroups();
  const { updatingDashboardSharing, data, isError, isLoading: isUpdatingDashboardSharingLoading } = useUpdatingDashboardSharing();
  const [combinedResults, setCombinedResults] = useState<any[]>([]);

  useEffect(() => {
    if (usersAndUserGroupsData) {
      const users = usersAndUserGroupsData.users?.map(user => ({
        id: user.id,
        name: user.displayName,
        type: "User",
      })) || [];

      const userGroups = usersAndUserGroupsData.userGroups?.map(group => ({
        id: group.id,
        name: group.displayName,
        type: "Group",
      })) || [];

      setCombinedResults([...users, ...userGroups]);
    }
  }, [usersAndUserGroupsData]);

  const debouncedFetchUsers = useCallback(
    debounce((searchTerm) => {
      if (searchTerm.trim().length > 0) {
        fetchUsersAndUserGroups(searchTerm);
      }
    }, 500),
    [fetchUsersAndUserGroups]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue((prev) => ({ ...prev, name: value }));
    debouncedFetchUsers(value);
  };

  const handleSelectItem = (selectedItem) => {
    setInputValue({
      name: selectedItem.name,
      id: selectedItem.id,
      type: selectedItem.type,
      accessLevel: "View only",
    });
    setCombinedResults([]);
  };

  const handleAccessLevelChange = (accessLevel) => {
    setInputValue((prev) => ({ ...prev, accessLevel }));
  };

  // ✅ Function to update sharing list safely
  const updateSharingList = () => {
    if (!inputValue.id) return savedDashboardData;

    // ✅ Ensure sharing is an array (prevents "Cannot read properties of undefined")
    const existingSharing = savedDashboardData.sharing || [];
    const isAlreadyShared = existingSharing.some((share) => share.id === inputValue.id);

    if (!isAlreadyShared) {
      return {
        ...savedDashboardData,
        sharing: [...existingSharing, inputValue],
      };
    }

    return savedDashboardData;
  };

  const handleConfirmSharing = async () => {
    const updatedData = updateSharingList();
    setIsLoading(true);
    console.log({ updatedData });
     await updatingDashboardSharing({uuid:dashboardId, dashboardData:updatedData});
     await refetch()
    setIsLoading(false);
  };

  // ✅ Safe check before using `savedDashboardData.sharing`
  const isAlreadyShared = savedDashboardData?.sharing?.some((share) => share.id === inputValue.id) || false;

  return (
    <Dialog open onOpenChange={onClose}>
 <DialogContent className="sm:max-w-[725px] bg-white">
        <DialogHeader>
          <DialogTitle>
            Sharing and access: <strong>{dashboardName}</strong>
          </DialogTitle>
          <DialogDescription>Give access to a user or group</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-4">
            <Label className="text-right whitespace-nowrap">User or Group</Label>
            <div className="relative flex items-center gap-2 w-full">
              <Input
                value={inputValue.name}
                onChange={handleInputChange}
                className="flex-1"
                placeholder="Search users or groups..."
              />
              {isFetchingUserAndUserGroupLoading && <CircularLoader small />}
              {combinedResults.length > 0 && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white shadow-lg border border-gray-300 rounded-md max-h-48 overflow-auto z-10">
                  {combinedResults.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelectItem(item)}
                    >
                      <span>{item.name}</span>
                      <span className="text-sm text-gray-500">{item.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Label className="text-right whitespace-nowrap">Access Level</Label>
            <Select onValueChange={handleAccessLevelChange}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder={inputValue.accessLevel} />
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
          <Button
            variant="default"
            disabled={!inputValue.id || isLoading || isAlreadyShared}
            onClick={handleConfirmSharing}
          >
            {isLoading ? "Loading..." : "Give Access"}
          </Button>
        </DialogFooter>
        <DialogFooter>
          <SharedUsersAndGroups dashboardId={dashboardId} /> 
        </DialogFooter>
      </DialogContent>
     
    </Dialog>
  );
}
