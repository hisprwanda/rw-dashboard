import { useDataQuery } from "@dhis2/app-runtime";
import { useEffect, useCallback, useMemo, useRef, useState } from "react";
import { useAuthorities } from "../context/AuthContext";
import { useDataSourceData } from "./DataSourceHooks";
import {
  formatAnalyticsDimensions,
  unFormatAnalyticsDimensions,
} from "../lib/formatAnalyticsDimensions";
import {
  formatCurrentUserSelectedOrgUnit,
  formatOrgUnitGroup,
  formatOrgUnitLevels,
  formatSelectedOrganizationUnit,
} from "../lib/formatCurrentUserOrgUnit";
import { currentInstanceId } from "../constants/currentInstanceInfo";
import { useSystemInfo } from "./fetchSystemInfo";
import { useDataItems } from "./fetchDataItems";
import { useExternalDataItems } from "./useExternalDataItems";
import { useExternalOrgUnitData } from "./fetchExternalOrgUnit";
import { useOrgUnitData } from "./fetchOrgunitData";
import { useRunGeoFeatures } from "./maps";
import { getSelectedOrgUnitsWhenUsingMap } from "../lib/getAnalyticsFilters";

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
  isSetPredifinedUserOrgUnits:any
};

export const useFetchSingleMapData = (mapId: string) => {
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
    loading: isFetchExternalInstanceDataItemsLoading,
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
    setCurrentUserInfoAndOrgUnitsData,
  } = useAuthorities();

  if (!mapId) {
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
      isFetchExternalInstanceDataItemsLoading,
    };
  }

  const query = useMemo(
    () => ({
      dataStore: {
        resource: `dataStore/${process.env.REACT_APP_MAPS_STORE}/${mapId}`,
      },
    }),
    [mapId]
  );

  const { data, loading, error, refetch } = useDataQuery(query);
  const { fetchGeoFeatures } = useRunGeoFeatures();

  const handleDataSourceChange = useCallback(
    async ({
      dataSourceId,
      dimensions,
      dataSourceDetails,
      selectedOrgUnitGroups,
      selectedOrganizationUnits,
      selectedOrganizationUnitsLevels,
      isSetPredifinedUserOrgUnits
    }: handleDataSourceChangeProps) => {
      let selectedPeriodsOnMap: string[] = [];
      selectedPeriodsOnMap.push(`pe:${dimensions?.pe?.join(";")}`);

      /// start defining selectedOrgUnitsWhenUsingMap
      const orgUnitIds = selectedOrganizationUnits
        ?.map((unit: any) => unit)
        ?.join(";");
      const orgUnitLevelIds = selectedOrganizationUnitsLevels
        ?.map((unit: any) => `LEVEL-${unit}`)
        ?.join(";");
      const orgUnitGroupIds = selectedOrgUnitGroups
        ?.map((item: any) => `OU_GROUP-${item}`)
        ?.join(";");

      const isUseCurrentUserOrgUnits = Object.values(
        isSetPredifinedUserOrgUnits
      ).some((value) => value === true);

      const selectedOrgUnitsWhenUsingMap = getSelectedOrgUnitsWhenUsingMap({
        isUseCurrentUserOrgUnits,
        isSetPredifinedUserOrgUnits,
        orgUnitIds,
        orgUnitLevelIds,
        orgUnitGroupIds,
      });
      /// end defining selectedOrgUnitsWhenUsingMap
      try {
        console.log("hello dimension data in aaaa", dimensions);
        setDataSourceChangeLoading(true);
        const isAnalyticsApiUsedInMap = true;
        if (dataSourceId === currentInstanceId) {
          const currentInstanceDetails = {
            instanceName: systemInfo?.title?.applicationTitle || "",
            isCurrentInstance: true,
          };
          setAnalyticsData([]);
          await fetchGeoFeatures();
          await fetchAnalyticsData({
            dimension: formatAnalyticsDimensions(
              dimensions,
              isAnalyticsApiUsedInMap
            ),
            instance: currentInstanceDetails,
            isAnalyticsApiUsedInMap,
            selectedPeriodsOnMap,
            selectedOrgUnitsWhenUsingMap,
          });
          setSelectedDataSourceDetails(currentInstanceDetails);
          await fetchCurrentInstanceData(selectedDimensionItemType);
          const result = await fetchCurrentUserInfoAndOrgUnitData();
          setCurrentUserInfoAndOrgUnitsData(result);
        } else if (dataSourceDetails) {
          setAnalyticsData([]);
          await fetchGeoFeatures();
          await fetchAnalyticsData({
            dimension: formatAnalyticsDimensions(
              dimensions,
              isAnalyticsApiUsedInMap
            ),
            instance: dataSourceDetails,
            isAnalyticsApiUsedInMap,
            selectedPeriodsOnMap,
          });
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
    },
    [
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
      setSelectedDataSourceDetails,
    ]
  );

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (
      !data ||
      JSON.stringify(data) === JSON.stringify(previousDataRef.current)
    ) {
      return;
    }

    previousDataRef.current = data;

    const savedDataSourceId = data.dataStore?.dataSourceId;
    const selectedPeriods =
      data.dataStore?.queries?.mapAnalyticsQueryOne?.myData?.params?.filter;
    let tempAnalyticsData =
      data.dataStore?.queries?.mapAnalyticsQueryOne?.myData?.params?.dimension?.slice(
        0,
        -1
      );
    let analyticsOfPeriodsAndData = [...tempAnalyticsData, selectedPeriods];
    const dimensions = unFormatAnalyticsDimensions(analyticsOfPeriodsAndData);

    setSelectedDataSourceOption(savedDataSourceId);
    setAnalyticsDimensions(dimensions);

    const selectedDataSourceDetails = savedDataSource?.dataStore?.entries?.find(
      (item: any) => item.key === savedDataSourceId
    )?.value;

    setSelectedChartType(data.dataStore?.visualType);
    setAnalyticsQuery(data.dataStore?.queries?.mapAnalyticsQueryOne);
    setMapAnalyticsQueryTwo(data.dataStore?.queries?.mapAnalyticsQueryTwo);
    setGeoFeaturesQuery(data.dataStore?.queries?.geoFeaturesQuery);
    const selectedOrgUnit =
      data.dataStore?.queries?.mapAnalyticsQueryOne?.myData?.params
        ?.dimension?.[1];
    setSelectedOrganizationUnits(
      formatSelectedOrganizationUnit(selectedOrgUnit)
    );
    setIsSetPredifinedUserOrgUnits(
      formatCurrentUserSelectedOrgUnit(selectedOrgUnit)
    );
    setSelectedOrgUnits(data.dataStore?.organizationTree);
    setSelectedOrgUnitGroups(formatOrgUnitGroup(selectedOrgUnit));
    setSelectedOrganizationUnitsLevels(formatOrgUnitLevels(selectedOrgUnit));
    setSelectedLevel(data.dataStore?.selectedOrgUnitLevel);
    setSelectedVisualTitleAndSubTitle(data.dataStore?.visualTitleAndSubTitle);
    setSelectedColorPalette(data.dataStore?.visualSettings?.visualColorPalette);
    setSelectedVisualSettings(data.dataStore?.visualSettings);
    setBackedSelectedItems(data.dataStore?.backedSelectedItems);

    const selectedOrganizationUnits = formatSelectedOrganizationUnit(selectedOrgUnit);
    const selectedOrganizationUnitsLevels =formatOrgUnitLevels(selectedOrgUnit);
    const selectedOrgUnitGroups = formatOrgUnitGroup(selectedOrgUnit);
    const isSetPredifinedUserOrgUnits = formatCurrentUserSelectedOrgUnit(selectedOrgUnit);
    handleDataSourceChange({
      dataSourceId: savedDataSourceId,
      dimensions,
      dataSourceDetails: selectedDataSourceDetails,
      selectedOrganizationUnits,
      selectedOrganizationUnitsLevels,
      selectedOrgUnitGroups,
      isSetPredifinedUserOrgUnits
    });
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
    setBackedSelectedItems,
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
    isFetchExternalInstanceDataItemsLoading,
  };
};
