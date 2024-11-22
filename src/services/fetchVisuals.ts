import { useDataQuery } from '@dhis2/app-runtime';
import { useEffect } from 'react';
import { useAuthorities } from '../context/AuthContext';
import { formatAnalyticsDimensions, unFormatAnalyticsDimensions } from '../lib/formatAnalyticsDimensions';
import {
  formatCurrentUserSelectedOrgUnit,
  formatOrgUnitGroup,
  formatOrgUnitLevels,
  formatSelectedOrganizationUnit,
} from '../lib/formatCurrentUserOrgUnit';

export const useFetchSingleVisualData = (visualId: string) => {
  const {

    setSelectedChartType,
    setAnalyticsQuery,

    setAnalyticsDimensions,
    setIsSetPredifinedUserOrgUnits,

    setSelectedOrganizationUnits,

    setSelectedOrgUnits,
   
    setSelectedOrgUnitGroups,
 
    setSelectedOrganizationUnitsLevels,
    setSelectedLevel,
    setAnalyticsData,
    setSelectedVisualTitleAndSubTitle,
     setSelectedVisualSettings
  } = useAuthorities();

  // Return default values if no visualId
  if (!visualId) {
    return { data: null, loading: false, error: null, isError: false, refetch: () => {} };
  }

  // Define the query
  const query = {
    dataStore: {
      resource: `dataStore/rw-visuals/${visualId}`,
    },
  };

  // Fetch data using useDataQuery
  const { data, loading, error, refetch } = useDataQuery(query);
   // clear existing data
  
  // Use useEffect to handle state updates after data is fetched
  useEffect(() => {
    if (data) {
         // clear existing data
         setAnalyticsData([])
      // Safely update state when data is fetched
      setSelectedChartType(data?.dataStore?.visualType);
      setAnalyticsQuery(data?.dataStore?.query);
      setSelectedOrganizationUnits(formatSelectedOrganizationUnit(data?.dataStore?.query?.myData?.params?.filter));
      // Safely unformat analytics dimensions
      const dimensions = unFormatAnalyticsDimensions(data?.dataStore?.query?.myData?.params?.dimension);
      setAnalyticsDimensions(dimensions);
      // Handle other state updates
      setIsSetPredifinedUserOrgUnits(formatCurrentUserSelectedOrgUnit(data?.dataStore?.query?.myData?.params?.filter));
      setSelectedOrgUnits(data?.dataStore?.organizationTree);
      setSelectedOrgUnitGroups(formatOrgUnitGroup(data?.dataStore?.query?.myData?.params?.filter));
      setSelectedOrganizationUnitsLevels(formatOrgUnitLevels(data?.dataStore?.query?.myData?.params?.filter));
      setSelectedLevel(data?.dataStore?.selectedOrgUnitLevel);
      setSelectedVisualTitleAndSubTitle(data?.dataStore?.visualTitleAndSubTitle)
      setSelectedVisualSettings(data?.dataStore?.visualSettings)
    }
  }, [data,setSelectedVisualSettings,setSelectedVisualTitleAndSubTitle,setSelectedLevel,setSelectedOrganizationUnitsLevels,setSelectedOrgUnitGroups,setSelectedOrgUnits,setIsSetPredifinedUserOrgUnits,setAnalyticsData,setSelectedChartType,setAnalyticsQuery,setSelectedOrganizationUnits,setAnalyticsDimensions]); 


  // Return the query result and other metadata
  return {
    data,
    loading,
    error,
    isError: !!error,
    refetch,
  };
};
export const useFetchVisualsData = ()=>{

    const query = {
        dataStore: {  
            resource: 'dataStore/rw-visuals',
            params: () => ({
              fields: '.',
            }),
        },
    };

    const { data, loading, error ,isError,refetch} = useDataQuery(query);

    return { data, loading, error,isError,refetch };

}
