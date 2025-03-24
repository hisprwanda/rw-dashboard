import { useDataQuery } from '@dhis2/app-runtime';
import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuthorities } from '../context/AuthContext';
import { useDataSourceData } from './DataSourceHooks';
import { 
  formatAnalyticsDimensions, 
  unFormatAnalyticsDimensions 
} from '../lib/formatAnalyticsDimensions';
import {
  formatCurrentUserSelectedOrgUnit,
  formatOrgUnitGroup,
  formatOrgUnitLevels,
  formatSelectedOrganizationUnit,
} from '../lib/formatCurrentUserOrgUnit';
import { currentInstanceId } from '../constants/currentInstanceInfo';
import { useSystemInfo } from './fetchSystemInfo';
import { useDataItems } from './fetchDataItems';
import { useExternalDataItems } from './useExternalDataItems';
import { useExternalOrgUnitData } from './fetchExternalOrgUnit';
import { useOrgUnitData } from './fetchOrgunitData';
import { useRunGeoFeatures } from './maps';

interface VisualData {
  dataStore?: {
    visualType?: string;
    query?: {
      myData?: {
        params?: {
          dimension?: any;
          filter?: any;
        };
      };
    };
    organizationTree?: any;
    selectedOrgUnitLevel?: string;
    visualTitleAndSubTitle?: any;
    visualSettings?: {
      visualColorPalette?: any;
    };
    dataSourceId?: string;
    backedSelectedItems?: any;
  };
}

export const useFetchSingleMapData = (mapId: string) => {
  const isInitialMount = useRef(true);
  const previousDataRef = useRef<VisualData | null>(null);
  
  const {
    fetchCurrentInstanceData,
    error: dataItemsFetchError,
    loading: isFetchCurrentInstanceDataItemsLoading,
  } = useDataItems();
  
  const {
    fetchExternalDataItems,
    error: fetchExternalDataError,
    loading: isFetchExternalInstanceDataItemsLoading
  } = useExternalDataItems();
  
  const { fetchExternalUserInfoAndOrgUnitData } = useExternalOrgUnitData();
  const { fetchCurrentUserInfoAndOrgUnitData } = useOrgUnitData();
  const { data: systemInfo } = useSystemInfo();
  const { data: savedDataSource } = useDataSourceData();

  const {
    setSelectedDataSourceOption,
    setSelectedDataSourceDetails,
    setSelectedChartType,
    setAnalyticsQuery,
    setGeoFeaturesQuery,
    setMapAnalyticsQueryTwo,
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
    selectedDimensionItemType,
    setCurrentUserInfoAndOrgUnitsData
  } = useAuthorities();

  // Early return if no mapId
  if (!mapId) {
    return { 
      data: null, 
      loading: false, 
      error: null, 
      isError: false, 
      refetch: () => {} 
    };
  }

  const query = useMemo(() => ({
    dataStore: {
      resource: `dataStore/${process.env.REACT_APP_MAPS_STORE}/${mapId}`,
    },
  }), [mapId]);

  const { data, loading, error, refetch } = useDataQuery<VisualData>(query);
  const {fetchGeoFeatures} = useRunGeoFeatures()

  const handleDataSourceChange = useCallback(async (
    dataSourceId: string | undefined,
    dimensions: any,
    dataSourceDetails: any
  ) => {
    const isAnalyticsApiUsedInMap = true
    if (dataSourceId === currentInstanceId) {
      const currentInstanceDetails = {
        instanceName: systemInfo?.title?.applicationTitle || '',
        isCurrentInstance: true,
      };
      // clear existing analytics data
      setAnalyticsData([]);
      /// fetch geo features data
      await fetchGeoFeatures()
      // run analytics with saved data
      await fetchAnalyticsData(
        formatAnalyticsDimensions(dimensions,isAnalyticsApiUsedInMap),
        currentInstanceDetails,isAnalyticsApiUsedInMap
      );
      // fetch necessary data for selected instance
      setSelectedDataSourceDetails(currentInstanceDetails);
      await fetchCurrentInstanceData(selectedDimensionItemType);
      const result = await fetchCurrentUserInfoAndOrgUnitData();
      setCurrentUserInfoAndOrgUnitsData(result);
      
    
    } else if (dataSourceDetails) {
        // clear existing analytics data
      setAnalyticsData([]);
          /// fetch geo features data
          await fetchGeoFeatures()
           // run analytics with saved data
      await fetchAnalyticsData(
        formatAnalyticsDimensions(dimensions,isAnalyticsApiUsedInMap),
        dataSourceDetails,isAnalyticsApiUsedInMap
      );
            // fetch necessary data for selected instance
      setSelectedDataSourceDetails(dataSourceDetails);
      await fetchExternalDataItems(
        dataSourceDetails.url,
        dataSourceDetails.token,
        selectedDimensionItemType
      );
      await fetchExternalUserInfoAndOrgUnitData(
        dataSourceDetails.url,
        dataSourceDetails.token
      );
      
   
    }
  }, [
    systemInfo,
    selectedDimensionItemType,
    fetchCurrentInstanceData,
    fetchCurrentUserInfoAndOrgUnitData,
    fetchExternalDataItems,
    fetchExternalUserInfoAndOrgUnitData,
    fetchAnalyticsData,
   fetchGeoFeatures,
    setAnalyticsData,
    setCurrentUserInfoAndOrgUnitsData,
    setSelectedDataSourceDetails
  ]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!data || JSON.stringify(data) === JSON.stringify(previousDataRef.current)) {
      return;
    }

    previousDataRef.current = data;

    const savedDataSourceId = data.dataStore?.dataSourceId;
    // getting selected period from filter
    const selectedPeriods = data.dataStore?.queries?.mapAnalyticsQueryOne?.myData?.params?.filter
    // getting selected data dimension ids
    let tempAnalyticsData =  data.dataStore?.queries?.mapAnalyticsQueryOne?.myData?.params?.dimension?.slice(0, -1)
    // creating new dimensions array which is in this format ["dx:778ids","pe:ids"]
    let analyticsOfPeriodsAndData = [...tempAnalyticsData,selectedPeriods]
    //// transforming analyticsOfPeriodsAndData to be in the format of {pe:[selectedPeriodIds],dx[selectedDataIds]} analyticsDimension format 
    const dimensions = unFormatAnalyticsDimensions(
      analyticsOfPeriodsAndData
    );

    setSelectedDataSourceOption(savedDataSourceId);
    setAnalyticsDimensions(dimensions);

    const selectedDataSourceDetails = savedDataSource?.dataStore?.entries?.find(
      (item: any) => item.key === savedDataSourceId
    )?.value;

    // Update all visual related states (like settings)
    setSelectedChartType(data.dataStore?.visualType);

    setAnalyticsQuery(data.dataStore?.queries?.mapAnalyticsQueryOne );
    setMapAnalyticsQueryTwo(data.dataStore?.queries?.mapAnalyticsQueryTwo);
    setGeoFeaturesQuery(data.dataStore?.queries?.geoFeaturesQuery);
    const selectedOrgUnit = data.dataStore?.queries?.mapAnalyticsQueryOne?.myData?.params?.dimension?.[1]
    setSelectedOrganizationUnits(
      formatSelectedOrganizationUnit(selectedOrgUnit)
    );
    setIsSetPredifinedUserOrgUnits(
      formatCurrentUserSelectedOrgUnit(selectedOrgUnit)
    );
    setSelectedOrgUnits(data.dataStore?.organizationTree);
    setSelectedOrgUnitGroups(
      formatOrgUnitGroup(selectedOrgUnit)
    );
    setSelectedOrganizationUnitsLevels(
      formatOrgUnitLevels(selectedOrgUnit)
    );
    setSelectedLevel(data.dataStore?.selectedOrgUnitLevel);
    setSelectedVisualTitleAndSubTitle(data.dataStore?.visualTitleAndSubTitle);
    setSelectedColorPalette(data.dataStore?.visualSettings?.visualColorPalette);
    setSelectedVisualSettings(data.dataStore?.visualSettings);
    setBackedSelectedItems(data.dataStore?.backedSelectedItems);

    // Handle data source change
    handleDataSourceChange(savedDataSourceId, dimensions, selectedDataSourceDetails);
  }, [
    data,
    savedDataSource,
    handleDataSourceChange,
    setAnalyticsDimensions,
    setSelectedDataSourceOption,
    setSelectedChartType,
    setAnalyticsQuery,
    setSelectedOrganizationUnits,
    setIsSetPredifinedUserOrgUnits,
    setSelectedOrgUnits,
    setSelectedOrgUnitGroups,
    setSelectedOrganizationUnitsLevels,
    setSelectedLevel,
    setSelectedVisualTitleAndSubTitle,
    setSelectedColorPalette,
    setSelectedVisualSettings,
    setBackedSelectedItems
  ]);

  return {
    data,
    loading,
    error,
    isError: !!error,
    refetch,
    dataItemsFetchError,
    isFetchCurrentInstanceDataItemsLoading,
    fetchExternalDataError,
    isFetchExternalInstanceDataItemsLoading
  };
};