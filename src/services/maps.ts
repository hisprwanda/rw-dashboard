import { useState } from 'react';
import { useAuthorities } from '../context/AuthContext';
import { useDataEngine } from '@dhis2/app-runtime';
import { useDataQuery } from '@dhis2/app-runtime';

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

    const orgUnitIds = selectedOrganizationUnits?.map((unit: any) => unit).join(';');
    const orgUnitLevelIds = selectedOrganizationUnitsLevels?.map((unit: any) => `LEVEL-${unit}`).join(';');
    const orgUnitGroupIds = selectedOrgUnitGroups?.map((item: any) => `OU_GROUP-${item}`).join(';');

    const ou = `ou:${
        isUseCurrentUserOrgUnits
            ? `${isSetPredifinedUserOrgUnits.is_USER_ORGUNIT ? 'USER_ORGUNIT;' : ''}${
                isSetPredifinedUserOrgUnits.is_USER_ORGUNIT_CHILDREN ? 'USER_ORGUNIT_CHILDREN;' : ''}${
                isSetPredifinedUserOrgUnits.is_USER_ORGUNIT_GRANDCHILDREN ? 'USER_ORGUNIT_GRANDCHILDREN;' : ''
            }`.slice(0, -1)
            : `${orgUnitIds};${orgUnitLevelIds};${orgUnitGroupIds}`
    }`;

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

    const fetchGeoFeatures = async () => {
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

