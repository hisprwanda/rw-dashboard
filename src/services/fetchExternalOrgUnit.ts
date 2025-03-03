import { useState, useCallback } from "react";
import axios from "axios";
import { useAuthorities } from '../context/AuthContext';
import { useConfig } from "@dhis2/app-runtime";


export const useExternalOrgUnitData = () => {
    const {apiVersion} = useConfig()
    const { setCurrentUserInfoAndOrgUnitsData } = useAuthorities();
  // Local states for response, error, and loading
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to fetch user and org unit data
  const fetchExternalUserInfoAndOrgUnitData = useCallback(async (url, token) => {
    setResponse(null);
    setError(null);
    setLoading(true);

    // Define the queries and their parameters
    const endpoints = {
        currentUser: `${url}/api/me`,
        orgUnits: `${url}/api/organisationUnits`,
        orgUnitLevels: `${url}/api/organisationUnitLevels`,
        orgUnitGroups: `${url}/api/organisationUnitGroups`, // Added endpoint for orgUnitGroups
    };

    const params = {
        currentUser: { fields: "organisationUnits[id,displayName]" },
        orgUnits: {
            fields: "id,displayName,path,children[id,displayName,path,level],level",
            paging: "false",
        },
        orgUnitLevels: { fields: "id,displayName,level", paging: "false" },
        orgUnitGroups: { // Added params for orgUnitGroups
            fields: "id,displayName,organisationUnits[id,displayName]",
            paging: "false",
        },
    };

    try {
        // Fetch all endpoints concurrently
        const [currentUserRes, orgUnitsRes, orgUnitLevelsRes, orgUnitGroupsRes] = await Promise.all([
            axios.get(endpoints.currentUser, {
                headers: { Authorization: `ApiToken ${token}` },
                params: params.currentUser,
            }),
            axios.get(endpoints.orgUnits, {
                headers: { Authorization: `ApiToken ${token}` },
                params: params.orgUnits,
            }),
            axios.get(endpoints.orgUnitLevels, {
                headers: { Authorization: `ApiToken ${token}` },
                params: params.orgUnitLevels,
            }),
            axios.get(endpoints.orgUnitGroups, { // Fetch organisation unit groups
                headers: { Authorization: `ApiToken ${token}` },
                params: params.orgUnitGroups,
            }),
        ]);

        // Combine results into a single object
        const result = {
            currentUser: currentUserRes.data,
            orgUnits: orgUnitsRes.data,
            orgUnitLevels: orgUnitLevelsRes.data,
            orgUnitGroups: orgUnitGroupsRes.data, // Added organisation unit groups data
        };

        setResponse(result); // Save the combined response
        setCurrentUserInfoAndOrgUnitsData(result);
        return result; // Return the result to the caller
    } catch (err) {
        setError(err.response?.statusText || err.message || "An error occurred");
        return null; // Return null in case of error
    } finally {
        setLoading(false);
    }
}, []);


  return { response, error, loading, fetchExternalUserInfoAndOrgUnitData };
};
