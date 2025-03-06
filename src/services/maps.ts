import { useState } from 'react';
import { useAuthorities } from '../context/AuthContext';
import { useDataEngine } from '@dhis2/app-runtime';

export const useRunGeoFeatures = () => {
    const engine = useDataEngine();
    const { 
        isUseCurrentUserOrgUnits, 
        isSetPredifinedUserOrgUnits, 
        selectedOrganizationUnits, 
        selectedOrganizationUnitsLevels, 
        selectedOrgUnitGroups 
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
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, error, isError: !!error, fetchGeoFeatures };
};





export const useMapData = () => {
    const query = {
        maps: {
            resource: 'maps',
            params: {
                fields: 'id,name,createdBy',
                paging: false,
            },
        },
    };

    const { data, loading, error, isError, refetch } = useDataQuery(query);

    return { data: data?.maps, loading, error, isError, refetch };
};
