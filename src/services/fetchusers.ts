import { useState } from "react";
import { useDataEngine } from "@dhis2/app-runtime";

 type eachUserOrGroupType = {
    id:string;  
    displayName: string;
 }
 type usersAndUserGroupsTypes = {
    userGroups: eachUserOrGroupType[];
    users: eachUserOrGroupType[];
 }


export const useFetchUsersAndUserGroups = () => {
  const engine = useDataEngine();
  const [data, setData] = useState<usersAndUserGroupsTypes | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const fetchUsersAndUserGroups = async (searchItem: string) => {
    setIsLoading(true);
    setIsError(false);

    const query = {
      dataStore: {
        resource: `sharing/search`,
        params: { key: searchItem }, 
      },
    };

    try {
      const { dataStore } = await engine.query(query);
      setData(dataStore);
      return dataStore;
    } catch (error) {
      setIsError(true);
      throw new Error("Failed to fetch users and user groups");
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, data, isError, fetchUsersAndUserGroups };
};
