import React, { useEffect, useState } from "react";
import { ChevronDown, Users } from "lucide-react";
import { useFetchSingleDashboardData, useUpdatingDashboardSharing } from "../../../services/fetchDashboard";
import { CircularLoader } from "@dhis2/ui";

const SharedUsersAndGroups = ({ dashboardId }: { dashboardId: string }) => {
  const { 
    data: allSavedDashboardData, 
    error, 
    isError: isErrorFetchSingleDashboardData, 
    loading: isFetchSingleDashboardDataLoading, 
    refetch 
  } = useFetchSingleDashboardData(dashboardId);
  
  const { 
    updatingDashboardSharing, 
    data, 
    isError, 
    isLoading: isUpdatingDashboardSharingLoading 
  } = useUpdatingDashboardSharing();

  const [savedDashboardData, setSavedDashboardData] = useState(() => allSavedDashboardData?.dataStore || {});
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (allSavedDashboardData?.dataStore) {
      console.log('Dashboard data updated:', allSavedDashboardData.dataStore);
      setSavedDashboardData(allSavedDashboardData.dataStore);
    }
  }, [allSavedDashboardData]);

  const accessOptions = ["No access", "View only", "View and edit"];
  const accessOptionsForSavedUserOrGroup = ["View only", "View and edit", "Remove access"];

  const updateDashboard = async (updatedData) => {
    try {
      setIsUpdating(true);
 
      await updatingDashboardSharing({
        uuid: dashboardId,
        dashboardData: updatedData
      });
      await refetch();
 
    } catch (error) {
      console.error('Error updating dashboard:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGeneralAccessChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {

    const updatedData = {
      ...savedDashboardData,
      generalDashboardAccess: e.target.value,
    };
    setSavedDashboardData(updatedData);

   await updateDashboard(updatedData);
  };

  const handleUserAccessChange = async (id: string, newAccessLevel: string) => {

    const updatedData = {
      ...savedDashboardData,
      sharing: savedDashboardData.sharing?.filter(user => user.id !== id) || []
    };

    if (newAccessLevel !== "Remove access") {
      const existingUser = savedDashboardData.sharing?.find(user => user.id === id);
      updatedData.sharing.push({
        ...existingUser,
        accessLevel: newAccessLevel
      });
    }


    setSavedDashboardData(updatedData);
    await updateDashboard(updatedData);
  };

  if (isFetchSingleDashboardDataLoading || isUpdating) {
    return (
      <div className="w-full flex justify-center">
        <CircularLoader />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md w-full">
      <h2 className="text-lg font-semibold mb-4">Users and groups that currently have access</h2>
      <div className="border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="text-gray-600" size={24} />
            <div>
              <p className="font-medium text-gray-900">All users</p>
              <p className="text-sm text-gray-500">Anyone logged in</p>
            </div>
          </div>
          <div className="relative">
            <select
              className="border rounded-md p-2 text-sm bg-white focus:outline-none focus:ring focus:ring-gray-300"
              value={savedDashboardData.generalDashboardAccess || "No access"}
              onChange={handleGeneralAccessChange}
              disabled={isUpdating}
            >
              {accessOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="max-h-[200px] overflow-auto">
          {savedDashboardData.sharing?.map((userOrGroup) => (
            <div key={userOrGroup.id} className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-3">
                <Users className="text-gray-600" size={24} />
                <div>
                  <p className="font-medium text-gray-900">{userOrGroup.name}</p>
                  <p className="text-sm text-gray-500">{userOrGroup.id}</p>
                </div>
              </div>
              <div className="relative">
                <select
                  className="border rounded-md p-2 text-sm bg-white focus:outline-none focus:ring focus:ring-gray-300"
                  value={userOrGroup.accessLevel}
                  onChange={(e) => handleUserAccessChange(userOrGroup.id, e.target.value)}
                  disabled={isUpdating}
                >
                  {accessOptionsForSavedUserOrGroup.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SharedUsersAndGroups;