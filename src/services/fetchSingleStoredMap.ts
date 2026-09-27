import { useApplicationTitle } from '@/features/system'
import { useDataEngine } from '@dhis2/app-runtime'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useCallback, useRef, useState } from 'react'
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
import { useDataItems } from './fetchDataItems'
import { useExternalDataItems } from './useExternalDataItems'
import { useRunGeoFeatures } from './maps'
import {
    buildOrgUnitDimension,
    type DataItemRef,
    type StoredAnalyticsQuery,
} from '@/features/analytics'
import type { ChartType, VisualSettings, VisualTitles } from '@/features/charts'
import type { BasemapType } from '../types/maps'
import type { mapSettingsTypes } from '../types/mapFormTypes'
import { env } from '@/shared/constants/env'

/** A map as stored in the maps dataStore namespace (typed properly in Phase 7). */
interface SavedMap {
    visualType: ChartType
    dataSourceId: string
    queries?: {
        mapAnalyticsQueryOne?: StoredAnalyticsQuery
        mapAnalyticsQueryTwo?: StoredAnalyticsQuery
        geoFeaturesQuery?: unknown
    }
    organizationTree?: string[]
    selectedOrgUnitLevel?: number[]
    visualTitleAndSubTitle: VisualTitles
    visualSettings: VisualSettings
    backedSelectedItems?: DataItemRef[]
    BasemapType?: BasemapType
    mapSettings?: mapSettingsTypes
}

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

    const {
        fetchCurrentInstanceData,
        error: dataItemsFetchError,
        loading: isFetchCurrentInstanceDataItemsLoading,
    } = useDataItems()

    const {
        fetchExternalDataItems,
        error: fetchExternalDataError,
        loading: isFetchExternalInstanceDataItemsLoading,
    } = useExternalDataItems()

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
    const engine = useDataEngine()
    const {
        data,
        isLoading: loading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['maps', 'detail', mapId],
        queryFn: async () =>
            (await engine.query({
                dataStore: {
                    resource: `dataStore/${env.mapsStore}/${mapId}`,
                },
            })) as VisualData,
        enabled: !!mapId,
    })
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
                    await fetchCurrentInstanceData(selectedDimensionItemType)
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
                    await fetchExternalDataItems(
                        dataSourceDetails.url,
                        dataSourceDetails.token,
                        selectedDimensionItemType
                    )
                }
            } finally {
                setDataSourceChangeLoading(false)
            }
        },
        [
            applicationTitle,
            selectedDimensionItemType,
            fetchCurrentInstanceData,
            fetchExternalDataItems,
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
        let tempAnalyticsData =
            saved.queries?.mapAnalyticsQueryOne?.myData?.params?.dimension?.slice(0, -1)
        let analyticsOfPeriodsAndData = [...tempAnalyticsData, selectedPeriods]
        const dimensions = unFormatAnalyticsDimensions(analyticsOfPeriodsAndData)

        setSelectedDataSourceOption(savedDataSourceId)
        setAnalyticsDimensions(dimensions)

        const selectedDataSourceDetails = savedDataSources?.find(
            (item: any) => item.key === savedDataSourceId
        )?.value

        setSelectedChartType(saved.visualType)
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
        setSelectedVisualTitleAndSubTitle(saved.visualTitleAndSubTitle)
        setSelectedColorPalette(saved.visualSettings.visualColorPalette)
        setSelectedVisualSettings(saved.visualSettings)
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
        dataItemsFetchError,
        isFetchCurrentInstanceDataItemsLoading,
        fetchExternalDataError,
        isFetchExternalInstanceDataItemsLoading,
    }
}
