import { useDataQuery } from '@dhis2/app-runtime';
import { useEffect, useCallback } from 'react';
import { useAuthorities } from '../context/AuthContext';
import { useDataSourceData } from '../services/DataSourceHooks';
import { formatAnalyticsDimensions, unFormatAnalyticsDimensions } from '../lib/formatAnalyticsDimensions';
import {
  formatCurrentUserSelectedOrgUnit,
  formatOrgUnitGroup,
  formatOrgUnitLevels,
  formatSelectedOrganizationUnit,
} from '../lib/formatCurrentUserOrgUnit';
import { currentInstanceId } from '../constants/currentInstanceInfo';
import { useSystemInfo } from './fetchSystemInfo';
import debounce from 'lodash/debounce';
import { useDataItems } from './fetchDataItems';
import { useExternalDataItems } from './useExternalDataItems';
import { useExternalOrgUnitData } from './fetchExternalOrgUnit';
import { useOrgUnitData } from './fetchOrgunitData';

interface VisualData {
  // Define the structure of your `data` object here for better TypeScript support.
  dataStore?: {
    visualType?: string;
    query?: any;
    organizationTree?: any;
    selectedOrgUnitLevel?: string;
    visualTitleAndSubTitle?: any;
    visualSettings?: { visualColorPalette?: any };
  };
}

export const useFetchSingleVisualData = (visualId: string) => {
     const {  error:dataItemsFetchError, loading:isFetchCurrentInstanceDataItemsLoading,fetchCurrentInstanceData } = useDataItems();
     const {fetchExternalDataItems,response,error:fetchExternalDataError,loading:isFetchExternalInstanceDataItemsLoading} = useExternalDataItems()
     const {fetchExternalUserInfoAndOrgUnitData} = useExternalOrgUnitData()
      const { fetchCurrentUserInfoAndOrgUnitData } = useOrgUnitData();
     const { data: systemInfo } = useSystemInfo();
  const { data: savedDataSource } = useDataSourceData();

  const {
    setSelectedDataSourceOption,
    setSelectedDataSourceDetails,
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
    setSelectedVisualSettings,
    setSelectedColorPalette,
    setBackedSelectedItems,
    fetchAnalyticsData,
    selectedDataSourceDetails,
    selectedDimensionItemType,
    setCurrentUserInfoAndOrgUnitsData
  } = useAuthorities();

  // Return default values if no visualId is provided
  if (!visualId) {
    return { data: null, loading: false, error: null, isError: false, refetch: () => {} };
  }

  // Query definition
  const query = {
    dataStore: {
      resource: `dataStore/${process.env.REACT_APP_VISUALS_STORE}/${visualId}`,
    },
  };

  // Fetch data using `useDataQuery`
  const { data, loading, error, refetch } = useDataQuery<VisualData>(query);

  // Determine data source details
  const determineDataSource = useCallback(
    (singleSavedVisualData: VisualData) => {
      const savedDataSourceId = singleSavedVisualData?.dataStore?.dataSourceId;
      setSelectedDataSourceOption(savedDataSourceId);

      // Find the details for the selected data source
      const selectedDataSourceDetails = savedDataSource?.dataStore?.entries?.find(
        (item: any) => item.key === savedDataSourceId
      )?.value;

      if (savedDataSourceId === currentInstanceId) {
        const currentInstanceDetails = {
          instanceName: systemInfo?.title?.applicationTitle || '',
          isCurrentInstance: true,
        };
        setSelectedDataSourceDetails(currentInstanceDetails);
      } else {
        setSelectedDataSourceDetails(selectedDataSourceDetails );
      }
    },
    [savedDataSource, systemInfo, setSelectedDataSourceOption, setSelectedDataSourceDetails]
  );

  // Handle state updates after data is fetched
  useEffect(() => {
    if (data) {
      setAnalyticsData([]); // Clear existing data
      const dimensions = unFormatAnalyticsDimensions(data?.dataStore?.query?.myData?.params?.dimension);
      setAnalyticsDimensions(dimensions);

      determineDataSource(data);

      // Update other states
      setSelectedChartType(data?.dataStore?.visualType);
      setAnalyticsQuery(data?.dataStore?.query);
      setSelectedOrganizationUnits(formatSelectedOrganizationUnit(data?.dataStore?.query?.myData?.params?.filter));
      setIsSetPredifinedUserOrgUnits(formatCurrentUserSelectedOrgUnit(data?.dataStore?.query?.myData?.params?.filter));
      setSelectedOrgUnits(data?.dataStore?.organizationTree);
      setSelectedOrgUnitGroups(formatOrgUnitGroup(data?.dataStore?.query?.myData?.params?.filter));
      setSelectedOrganizationUnitsLevels(formatOrgUnitLevels(data?.dataStore?.query?.myData?.params?.filter));
      setSelectedLevel(data?.dataStore?.selectedOrgUnitLevel);
      setSelectedVisualTitleAndSubTitle(data?.dataStore?.visualTitleAndSubTitle);
      setSelectedColorPalette(data?.dataStore?.visualSettings?.visualColorPalette);
      setSelectedVisualSettings(data?.dataStore?.visualSettings);
      setBackedSelectedItems(data?.dataStore?.backedSelectedItems);
    }
  }, [
    data,
    determineDataSource,
    setAnalyticsData,
    setAnalyticsDimensions,
    setAnalyticsQuery,
    setIsSetPredifinedUserOrgUnits,
    setSelectedChartType,
    setSelectedColorPalette,
    setSelectedLevel,
    setSelectedOrgUnitGroups,
    setSelectedOrgUnits,
    setSelectedOrganizationUnits,
    setSelectedOrganizationUnitsLevels,
    setSelectedVisualSettings,
    setSelectedVisualTitleAndSubTitle,
    setBackedSelectedItems
  ]);


    /// start utils functions
  /// fetch current user and Organization unit
  const fetchCurrentUserAndOrgUnitData = async () => {
    const result = await fetchCurrentUserInfoAndOrgUnitData(); 
    setCurrentUserInfoAndOrgUnitsData(result); 
  };
  
// keepUp with selected data source
function keepUpWithSelectedDataSource() {
const details = selectedDataSourceDetails.current;

if (!details) return;
// Proceed with using the latest `details`
if (details.isCurrentInstance) {
    fetchCurrentInstanceData(selectedDimensionItemType);
    fetchCurrentUserAndOrgUnitData();
} else if (details.url && details.token) {
    fetchExternalDataItems(details.url, details.token,selectedDimensionItemType);
    fetchExternalUserInfoAndOrgUnitData(details.url, details.token);
} else {
    console.error("Invalid data source details: Missing URL or token.");
}
}

    // end util functions

  
      //// run analytics API
      const debounceRunAnalytics = useCallback(debounce(() => {
        const dimensions = unFormatAnalyticsDimensions(data?.dataStore?.query?.myData?.params?.dimension);
         // clear existing analytics data    
        setAnalyticsData([]); 
        keepUpWithSelectedDataSource()
              fetchAnalyticsData(
                  formatAnalyticsDimensions(dimensions),
                  selectedDataSourceDetails
              );

      }, 500), [ data]);
      
      useEffect(() => {
          debounceRunAnalytics();
          return debounceRunAnalytics.cancel; // Cleanup debounce on unmount
      }, [debounceRunAnalytics]);

  // Return the query result and metadata
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
            resource: `dataStore/${process.env.REACT_APP_VISUALS_STORE}`,
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
