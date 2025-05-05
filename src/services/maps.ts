import { useCallback, useMemo, useState } from 'react';
import { useAuthorities } from '../context/AuthContext';
import { useDataEngine } from '@dhis2/app-runtime';
import { useDataQuery } from '@dhis2/app-runtime';

type fetchGeoFeatures = {
    selectedOrgUnitsWhenUsingMap:any
}
type useFetchSavedGeoFeatureByQueryProps = {
  geoFeaturesQuery: any;
  mapAnalyticsQueryOneQuery: any;
  mapAnalyticsQueryTwo: any;
};
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


export const useFetchSavedGeoFeatureByQuery = ({
  geoFeaturesQuery,
  mapAnalyticsQueryOneQuery,
  mapAnalyticsQueryTwo,
}: useFetchSavedGeoFeatureByQueryProps) => {
  const engine = useDataEngine();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [geoFeaturesSavedData, setGeoFeaturesSavedData] = useState(null);
  const [analyticsMapData, setAnalyticsMapData] = useState(null);
  const [metaMapData, setMetaMapData] = useState(null);

  // Memoize the final query object with correct resource structure
  const finalQuery = useMemo(() => {
    if (!geoFeaturesQuery) {
      return null;
    }
    return {
      geoFeatures: {
        resource: "geoFeatures",
        params: geoFeaturesQuery.result.params,
      },
      mapAnalyticsOne: {
        resource: "analytics",
        params: mapAnalyticsQueryOneQuery.myData.params,
      },
      mapAnalyticsTwo: {
        resource: "analytics",
        params: mapAnalyticsQueryTwo.myData.params,
      },
    };
  }, [geoFeaturesQuery, mapAnalyticsQueryOneQuery, mapAnalyticsQueryTwo]);

  const runSavedSingleGeoFeature = useCallback(async () => {
    if (!finalQuery) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await engine.query(finalQuery);
      setGeoFeaturesSavedData(result?.geoFeatures);
      setAnalyticsMapData(result?.mapAnalyticsOne);
      setMetaMapData(result?.mapAnalyticsTwo);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      console.error("Query Error:", err);
    } finally {
      setLoading(false);
    }
  }, [engine, finalQuery]);

  return {
    geoFeaturesSavedData,
    analyticsMapData,
    metaMapData,
    loading,
    error,
    runSavedSingleGeoFeature,
  };
};



