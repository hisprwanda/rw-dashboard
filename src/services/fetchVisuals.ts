import { useDataQuery } from '@dhis2/app-runtime';
import { useEffect, useCallback, useMemo, useRef, useState } from 'react';
import { useAuthorities } from '../context/AuthContext';
import { useDataSourceData } from '../services/DataSourceHooks';
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
import { analyticsPayloadDeterminerTypes } from '../types/analyticsTypes';

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

type handleDataSourceChangeProps = {
  dataSourceId: string | undefined;
  dimensions: any;
  dataSourceDetails: any;
  selectedOrganizationUnits: any;
  selectedOrganizationUnitsLevels: any;
  selectedOrgUnitGroups: any;
  isSetPredifinedUserOrgUnits: any;
  analyticsPayloadDeterminer:analyticsPayloadDeterminerTypes
};

export const useFetchSingleVisualData = (visualId: string) => {
  const isInitialMount = useRef(true);
  const previousDataRef = useRef<VisualData | null>(null);
  const [dataSourceChangeLoading, setDataSourceChangeLoading] = useState(false);
  
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
    setAnalyticsPayloadDeterminer,
    setAnalyticsDimensions,
    setIsSetPredifinedUserOrgUnits,
    setSelectedOrganizationUnits,
    setSelectedOrgUnits,
    setSelectedOrgUnitGroups,
    setSelectedOrganizationUnitsLevels,
    setSelectedLevel,
    setAnalyticsData,
    setMetaDataLabels,
    setSelectedVisualTitleAndSubTitle,
    setSelectedVisualSettings,
    setSelectedColorPalette,
    setBackedSelectedItems,
    fetchAnalyticsData,
    selectedDimensionItemType,
    setCurrentUserInfoAndOrgUnitsData,
    setIsUseCurrentUserOrgUnits
  } = useAuthorities();

  // Early return if no visualId
  if (!visualId) {
    return { 
      data: null, 
      loading: false, 
      error: null, 
      isError: false, 
      refetch: () => {},
      isHandleDataSourceChangeLoading: false,
      dataItemsFetchError,
      isFetchCurrentInstanceDataItemsLoading,
      fetchExternalDataError,
      isFetchExternalInstanceDataItemsLoading
    };
  }

  const query = useMemo(() => ({
    dataStore: {
      resource: `dataStore/${process.env.REACT_APP_VISUALS_STORE}/${visualId}`,
    },
  }), [visualId]);

  const { data, loading, error, refetch } = useDataQuery<VisualData>(query);

  const handleDataSourceChange = useCallback(async ({
    dataSourceId,
    dimensions,
    dataSourceDetails,
    selectedOrganizationUnits,
    selectedOrganizationUnitsLevels,
    selectedOrgUnitGroups,
    isSetPredifinedUserOrgUnits,
    analyticsPayloadDeterminer
  }: handleDataSourceChangeProps) => {
    const isUseCurrentUserOrgUnits = Object.values(
      isSetPredifinedUserOrgUnits
    ).some((value) => value === true);

    try {
      setDataSourceChangeLoading(true);
      if (dataSourceId === currentInstanceId) {
        const currentInstanceDetails = {
          instanceName: systemInfo?.title?.applicationTitle || '',
          isCurrentInstance: true,
        };
        // clear existing analytics data
        setAnalyticsData([]);
        setMetaDataLabels({});
        // run analytics with saved data
        await fetchAnalyticsData({
          dimension: formatAnalyticsDimensions(dimensions),
          instance: currentInstanceDetails,
          analyticsPayloadDeterminer,
          selectedOrganizationUnits,
          selectedOrgUnitGroups,
          selectedOrganizationUnitsLevels,
          isUseCurrentUserOrgUnits,
          isSetPredifinedUserOrgUnits
        });
        // fetch necessary data for selected instance
        setSelectedDataSourceDetails(currentInstanceDetails);
        await fetchCurrentInstanceData(selectedDimensionItemType);
        const result = await fetchCurrentUserInfoAndOrgUnitData();
        setCurrentUserInfoAndOrgUnitsData(result);
      } else if (dataSourceDetails) {
        // clear existing analytics data
        setAnalyticsData([]);
        setMetaDataLabels({});
        // run analytics with saved data
        await fetchAnalyticsData({
          dimension: formatAnalyticsDimensions(dimensions),
          instance: dataSourceDetails,
          selectedOrganizationUnits,
          selectedOrgUnitGroups,
          selectedOrganizationUnitsLevels,
          isUseCurrentUserOrgUnits,
          isSetPredifinedUserOrgUnits
        });
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
    } finally {
      setDataSourceChangeLoading(false);
    }
  }, [
    systemInfo,
    selectedDimensionItemType,
    fetchCurrentInstanceData,
    fetchCurrentUserInfoAndOrgUnitData,
    fetchExternalDataItems,
    fetchExternalUserInfoAndOrgUnitData,
    fetchAnalyticsData,
    setAnalyticsData,
    setMetaDataLabels,
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
    const dimensions = unFormatAnalyticsDimensions(
      data.dataStore?.query?.myData?.params?.dimension
    );
    const analyticsPayloadDeterminer = data.dataStore?.analyticsPayloadDeterminer
    setSelectedDataSourceOption(savedDataSourceId);
    setAnalyticsDimensions(dimensions);

    const selectedDataSourceDetails = savedDataSource?.dataStore?.entries?.find(
      (item: any) => item.key === savedDataSourceId
    )?.value;

    // Update all visual related states (like settings)
    setSelectedChartType(data.dataStore?.visualType);
    setAnalyticsQuery(data.dataStore?.query);
    setAnalyticsPayloadDeterminer(data.dataStore?.analyticsPayloadDeterminer);
    const selectedOrganizationUnits = formatSelectedOrganizationUnit(
      data.dataStore?.query?.myData?.params?.filter
    );
    const isSetPredifinedUserOrgUnits = formatCurrentUserSelectedOrgUnit(
      data.dataStore?.query?.myData?.params?.filter
    );
    const isAnyTrue = Object.values(isSetPredifinedUserOrgUnits).some(value => value === true);
    const selectedOrgUnitGroups = formatOrgUnitGroup(
      data.dataStore?.query?.myData?.params?.filter
    );
    const selectedOrganizationUnitsLevels = formatOrgUnitLevels(
      data.dataStore?.query?.myData?.params?.filter
    );
    setIsUseCurrentUserOrgUnits(isAnyTrue);
    setSelectedOrganizationUnits(selectedOrganizationUnits);
    setIsSetPredifinedUserOrgUnits(isSetPredifinedUserOrgUnits);
    setSelectedOrgUnits(data.dataStore?.organizationTree);
    setSelectedOrgUnitGroups(selectedOrgUnitGroups);
    setSelectedOrganizationUnitsLevels(selectedOrganizationUnitsLevels);
    setSelectedLevel(data.dataStore?.selectedOrgUnitLevel);
    setSelectedVisualTitleAndSubTitle(data.dataStore?.visualTitleAndSubTitle);
    setSelectedColorPalette(data.dataStore?.visualSettings?.visualColorPalette);
    setSelectedVisualSettings(data.dataStore?.visualSettings);
    setBackedSelectedItems(data.dataStore?.backedSelectedItems);

    // Handle data source change
    handleDataSourceChange({
      dataSourceId: savedDataSourceId,
      dimensions,
      dataSourceDetails: selectedDataSourceDetails,
      selectedOrganizationUnits,
      selectedOrganizationUnitsLevels,
      selectedOrgUnitGroups,
      isSetPredifinedUserOrgUnits,
      analyticsPayloadDeterminer
    });
  }, [
    data,
    savedDataSource,
    handleDataSourceChange,
    setAnalyticsDimensions,
    setSelectedDataSourceOption,
    setSelectedChartType,
    setAnalyticsQuery,
    setAnalyticsPayloadDeterminer,
    setSelectedOrganizationUnits,
    setIsUseCurrentUserOrgUnits,
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
    isHandleDataSourceChangeLoading: dataSourceChangeLoading,
    dataItemsFetchError,
    isFetchCurrentInstanceDataItemsLoading,
    fetchExternalDataError,
    isFetchExternalInstanceDataItemsLoading
  };
};

export const useFetchVisualsData = () => {
    const query = {
        dataStore: {  
            resource: `dataStore/${process.env.REACT_APP_VISUALS_STORE}`,
            params: () => ({
              fields: '.',
            }),
        },
    };

    const { data, loading, error, isError, refetch } = useDataQuery(query);
    // Sort the entries based on `updatedAt` in descending order
    const sortedData = data?.dataStore?.entries?.sort(
      (a, b) => b.value.updatedAt - a.value.updatedAt
    );
    
    return { data, loading, error, isError, refetch };
};