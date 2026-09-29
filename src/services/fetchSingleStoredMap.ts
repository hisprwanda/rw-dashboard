import { useApplicationTitle } from '@/features/system'
import { useEffect, useCallback, useMemo, useRef, useState } from 'react'
import { useMap, type SavedMap } from '@/features/maps'
import { useAuthorities } from '../context/AuthContext'
import { useDataSources } from '@/features/data-sources'
import {
    formatAnalyticsDimensions,
    parseAnalyticsDimensions as unFormatAnalyticsDimensions,
} from '@/features/analytics'
import {
    formatCurrentUserSelectedOrgUnit,
    formatOrgUnitGroup,
    formatOrgUnitLevels,
    formatSelectedOrganizationUnit,
} from '../lib/formatCurrentUserOrgUnit'
import { currentInstanceId } from '../constants/currentInstanceInfo'
import { useRunGeoFeatures } from './maps'
import {
    buildOrgUnitDimension,
    type DataItemRef,
    type StoredAnalyticsQuery,
} from '@/features/analytics'
import type { ChartType, VisualSettings, VisualTitles } from '@/features/charts'
import type { BasemapType } from '../types/maps'
import type { mapSettingsTypes } from '../types/mapFormTypes'

interface VisualData {
    dataStore?: SavedMap
}

type handleDataSourceChangeProps = {
    dataSourceId: string | undefined
    dimensions: any
    dataSourceDetails: any
    selectedOrganizationUnits: any
    selectedOrganizationUnitsLevels: any
    selectedOrgUnitGroups: any
    isSetPredifinedUserOrgUnits: any
}

export const useFetchSingleMapData = (mapId: string | undefined) => {
    const previousDataRef = useRef<VisualData | null>(null)
    const [dataSourceChangeLoading, setDataSourceChangeLoading] = useState(false)

    const applicationTitle = useApplicationTitle()
    const { data: savedDataSources } = useDataSources()

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
        setMetaDataLabels,
        setSelectedVisualTitleAndSubTitle,
        setSelectedVisualSettings,
        setSelectedColorPalette,
        setBackedSelectedItems,
        setCurrentBasemap,
        setMapSettings,
        setIsUseCurrentUserOrgUnits,
        fetchAnalyticsData,
        selectedDimensionItemType,
    } = useAuthorities()

    // Always call hooks in the same order; the query simply stays idle without an id.
    const { data: map, isLoading: loading, error, refetch } = useMap(mapId)
    // Legacy shape `{ dataStore: map }` kept for the components that still read it.
    const data = useMemo<VisualData | undefined>(
        () => (map ? { dataStore: map } : undefined),
        [map]
    )
    const { fetchGeoFeatures } = useRunGeoFeatures()

    const handleDataSourceChange = useCallback(
        async ({
            dataSourceId,
            dimensions,
            dataSourceDetails,
            selectedOrgUnitGroups,
            selectedOrganizationUnits,
            selectedOrganizationUnitsLevels,
            isSetPredifinedUserOrgUnits,
        }: handleDataSourceChangeProps) => {
            let selectedPeriodsOnMap: string[] = []
            selectedPeriodsOnMap.push(`pe:${dimensions?.pe?.join(';')}`)

            const isUseCurrentUserOrgUnits = Object.values(isSetPredifinedUserOrgUnits).some(
                (value) => value === true
            )
            const selectedOrgUnitsWhenUsingMap = buildOrgUnitDimension({
                useCurrentUserOrgUnits: isUseCurrentUserOrgUnits,
                userOrgUnitScope: isSetPredifinedUserOrgUnits,
                orgUnitIds: selectedOrganizationUnits ?? [],
                levelIds: selectedOrganizationUnitsLevels ?? [],
                groupIds: selectedOrgUnitGroups ?? [],
            })
            try {
                setDataSourceChangeLoading(true)
                const isAnalyticsApiUsedInMap = true
                if (dataSourceId === currentInstanceId) {
                    const currentInstanceDetails = {
                        instanceName: applicationTitle,
                        isCurrentInstance: true,
                    }
                    setAnalyticsData([])
                    setMetaDataLabels({})
                    await fetchGeoFeatures({ selectedOrgUnitsWhenUsingMap })
                    await fetchAnalyticsData({
                        dimension: formatAnalyticsDimensions(dimensions, isAnalyticsApiUsedInMap),
                        instance: currentInstanceDetails,
                        isAnalyticsApiUsedInMap,
                        selectedPeriodsOnMap,
                        selectedOrgUnitsWhenUsingMap,

                        selectedOrganizationUnits,
                        selectedOrgUnitGroups,
                        selectedOrganizationUnitsLevels,
                        isUseCurrentUserOrgUnits,
                        isSetPredifinedUserOrgUnits,
                    })
                    setSelectedDataSourceDetails(currentInstanceDetails)
                } else if (dataSourceDetails) {
                    setAnalyticsData([])
                    setMetaDataLabels({})
                    await fetchGeoFeatures({ selectedOrgUnitsWhenUsingMap })
                    await fetchAnalyticsData({
                        dimension: formatAnalyticsDimensions(dimensions, isAnalyticsApiUsedInMap),
                        instance: dataSourceDetails,
                        isAnalyticsApiUsedInMap,
                        selectedPeriodsOnMap,
                    })
                    setSelectedDataSourceDetails(dataSourceDetails)
                }
            } finally {
                setDataSourceChangeLoading(false)
            }
        },
        [
            applicationTitle,
            selectedDimensionItemType,
            fetchAnalyticsData,
            fetchGeoFeatures,
            setAnalyticsData,
            setMetaDataLabels,
            setSelectedDataSourceDetails,
        ]
    )

    useEffect(() => {
        if (!data || JSON.stringify(data) === JSON.stringify(previousDataRef.current)) {
            return
        }

        previousDataRef.current = data
        const saved = data.dataStore
        if (!saved) return

        const savedDataSourceId = saved.dataSourceId
        const selectedPeriods = saved.queries?.mapAnalyticsQueryOne?.myData?.params?.filter
        const tempAnalyticsData =
            saved.queries?.mapAnalyticsQueryOne?.myData?.params?.dimension?.slice(0, -1) ?? []
        const analyticsOfPeriodsAndData = [...tempAnalyticsData, selectedPeriods]
        const dimensions = unFormatAnalyticsDimensions(analyticsOfPeriodsAndData)

        setSelectedDataSourceOption(savedDataSourceId)
        setAnalyticsDimensions(dimensions)

        const selectedDataSourceDetails = savedDataSources?.find(
            (item: any) => item.key === savedDataSourceId
        )?.value

        // Maps saved through the map form do not store the chart appearance.
        if (saved.visualType) setSelectedChartType(saved.visualType)
        setAnalyticsQuery(saved.queries?.mapAnalyticsQueryOne)
        setMapAnalyticsQueryTwo(saved.queries?.mapAnalyticsQueryTwo)
        setGeoFeaturesQuery(saved.queries?.geoFeaturesQuery)
        const selectedOrgUnit = saved.queries?.mapAnalyticsQueryOne?.myData?.params?.dimension?.[1]
        setSelectedOrganizationUnits(formatSelectedOrganizationUnit(selectedOrgUnit))
        setIsSetPredifinedUserOrgUnits(formatCurrentUserSelectedOrgUnit(selectedOrgUnit))
        setSelectedOrgUnits(saved.organizationTree ?? [])
        setSelectedOrgUnitGroups(formatOrgUnitGroup(selectedOrgUnit))
        setSelectedOrganizationUnitsLevels(formatOrgUnitLevels(selectedOrgUnit))
        setSelectedLevel(saved.selectedOrgUnitLevel ?? null)
        if (saved.visualTitleAndSubTitle) {
            setSelectedVisualTitleAndSubTitle(saved.visualTitleAndSubTitle)
        }
        if (saved.visualSettings) {
            setSelectedColorPalette(saved.visualSettings.visualColorPalette)
            setSelectedVisualSettings(saved.visualSettings)
        }
        setBackedSelectedItems(saved.backedSelectedItems ?? [])
        setCurrentBasemap(saved.BasemapType ?? 'osm-light')
        if (saved.mapSettings) setMapSettings(saved.mapSettings)

        const selectedOrganizationUnits = formatSelectedOrganizationUnit(selectedOrgUnit)
        const selectedOrganizationUnitsLevels = formatOrgUnitLevels(selectedOrgUnit)
        const selectedOrgUnitGroups = formatOrgUnitGroup(selectedOrgUnit)
        const isSetPredifinedUserOrgUnits = formatCurrentUserSelectedOrgUnit(selectedOrgUnit)
        const isAnyTrue = Object.values(isSetPredifinedUserOrgUnits).some((value) => value === true)
        setIsUseCurrentUserOrgUnits(isAnyTrue)
        handleDataSourceChange({
            dataSourceId: savedDataSourceId,
            dimensions,
            dataSourceDetails: selectedDataSourceDetails,
            selectedOrganizationUnits,
            selectedOrganizationUnitsLevels,
            selectedOrgUnitGroups,
            isSetPredifinedUserOrgUnits,
        })
    }, [
        data,
        savedDataSources,
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
        setCurrentBasemap,
        setMapSettings,
        setIsUseCurrentUserOrgUnits,
    ])

    return {
        data,
        loading,
        error,
        isError: !!error,
        refetch,
        isHandleDataSourceChangeLoading: dataSourceChangeLoading,
    }
}
