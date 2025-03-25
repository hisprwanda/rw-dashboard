import { useState } from 'react';
import { useAuthorities } from '../context/AuthContext';
import { useDataEngine } from '@dhis2/app-runtime';
import { useDataQuery } from '@dhis2/app-runtime';

type fetchGeoFeatures = {
    selectedOrgUnitsWhenUsingMap:any
}
export const useRunGeoFeatures = () => {
    const engine = useDataEngine();
    const { 
        isUseCurrentUserOrgUnits, 
        isSetPredifinedUserOrgUnits, 
        selectedOrganizationUnits, 
        selectedOrganizationUnitsLevels, 
        selectedOrgUnitGroups ,
        setGeoFeaturesData,
        setGeoFeaturesQuery
    } = useAuthorities();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchGeoFeatures = async ({selectedOrgUnitsWhenUsingMap}:fetchGeoFeatures) => {
        const ou = selectedOrgUnitsWhenUsingMap
        const queryParams = {
            ou,
            displayProperty: 'NAME',
        };
    
        const query = {
            result: {
                resource: 'geoFeatures',
                params: queryParams,
            },
        };
        setLoading(true);
        setError(null);
        try {
            const result = await engine.query(query);
            setData(result);
            setGeoFeaturesData(result?.result)
            setGeoFeaturesQuery(query)
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, error, isError: !!error, fetchGeoFeatures };
};


export const useFetchAllSavedMaps = ()=>{
    const query = {
        dataStore: {  
            resource: `dataStore/${process.env.REACT_APP_MAPS_STORE}`,
            params: () => ({
              fields: '.',
            }),
        },
    };

    const { data, loading, error ,isError,refetch} = useDataQuery(query);
  // Sort the entries based on `updatedAt` in descending order
  const sortedData = data?.dataStore?.entries?.sort(
    (a, b) => b.value.updatedAt - a.value.updatedAt
);
    return { data, loading, error,isError,refetch };

}

