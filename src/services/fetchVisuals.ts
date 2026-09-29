import { useVisual, type SavedVisual } from '@/features/visualizers'
import { useApplicationTitle } from '@/features/system'
import { useDataEngine, useDataQuery } from '@dhis2/app-runtime'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useCallback, useMemo, useRef, useState } from 'react'
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
import { analyticsPayloadDeterminerTypes } from '../types/analyticsTypes'
import { env } from '@/shared/constants/env'

type handleDataSourceChangeProps = {
    dataSourceId: string | undefined
    dimensions: any
    dataSourceDetails: any
    selectedOrganizationUnits: any
    selectedOrganizationUnitsLevels: any
    selectedOrgUnitGroups: any
    isSetPredifinedUserOrgUnits: any
    analyticsPayloadDeterminer: analyticsPayloadDeterminerTypes
}

export const useFetchSingleVisualData = (visualId: string | undefined) => {
    const previousDataRef = useRef<{ dataStore: SavedVisual } | null>(null)
    const [dataSourceChangeLoading, setDataSourceChangeLoading] = useState(false)

    const applicationTitle = useApplicationTitle()
    const { data: savedDataSources } = useDataSources()

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
        setIsUseCurrentUserOrgUnits,
    } = useAuthorities()

    // Always call hooks in the same order; the query simply stays idle without an id.
    const { data: visual, isLoading: loading, error, refetch } = useVisual(visualId)
    // Legacy shape `{ dataStore: visual }` kept for the pages that still read it.
    const data = useMemo(() => (visual ? { dataStore: visual } : undefined), [visual])

    const handleDataSourceChange = useCallback(
        async ({
            dataSourceId,
            dimensions,
            dataSourceDetails,
            selectedOrganizationUnits,
            selectedOrganizationUnitsLevels,
            selectedOrgUnitGroups,
            isSetPredifinedUserOrgUnits,
            analyticsPayloadDeterminer,
        }: handleDataSourceChangeProps) => {
            const isUseCurrentUserOrgUnits = Object.values(isSetPredifinedUserOrgUnits).some(
                (value) => value === true
            )

            try {
                setDataSourceChangeLoading(true)
                if (dataSourceId === currentInstanceId) {
                    const currentInstanceDetails = {
                        instanceName: applicationTitle,
                        isCurrentInstance: true,
                    }
                    // clear existing analytics data
                    setAnalyticsData([])
                    setMetaDataLabels({})
                    // run analytics with saved data
                    await fetchAnalyticsData({
                        dimension: formatAnalyticsDimensions(dimensions),
                        instance: currentInstanceDetails,
                        analyticsPayloadDeterminer,
                        selectedOrganizationUnits,
                        selectedOrgUnitGroups,
                        selectedOrganizationUnitsLevels,
                        isUseCurrentUserOrgUnits,
                        isSetPredifinedUserOrgUnits,
                    })
                    // fetch necessary data for selected instance
                    setSelectedDataSourceDetails(currentInstanceDetails)
                } else if (dataSourceDetails) {
                    // clear existing analytics data
                    setAnalyticsData([])
                    setMetaDataLabels({})
                    // run analytics with saved data
                    await fetchAnalyticsData({
                        dimension: formatAnalyticsDimensions(dimensions),
                        instance: dataSourceDetails,
                        selectedOrganizationUnits,
                        selectedOrgUnitGroups,
                        selectedOrganizationUnitsLevels,
                        isUseCurrentUserOrgUnits,
                        isSetPredifinedUserOrgUnits,
                    })
                    // fetch necessary data for selected instance
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

        const savedDataSourceId = saved.dataSourceId
        const dimensions = unFormatAnalyticsDimensions(saved.query?.myData?.params.dimension)
        const analyticsPayloadDeterminer = saved.analyticsPayloadDeterminer
        setSelectedDataSourceOption(savedDataSourceId)
        setAnalyticsDimensions(dimensions)

        const selectedDataSourceDetails = savedDataSources?.find(
            (item: any) => item.key === savedDataSourceId
        )?.value

        // Update all visual related states (like settings)
        setSelectedChartType(saved.visualType)
        setAnalyticsQuery(saved.query)
        setAnalyticsPayloadDeterminer(saved.analyticsPayloadDeterminer)
        const selectedOrganizationUnits = formatSelectedOrganizationUnit(
            saved.query?.myData?.params.filter
        )
        const isSetPredifinedUserOrgUnits = formatCurrentUserSelectedOrgUnit(
            saved.query?.myData?.params.filter
        )
        const isAnyTrue = Object.values(isSetPredifinedUserOrgUnits).some((value) => value === true)
        const selectedOrgUnitGroups = formatOrgUnitGroup(saved.query?.myData?.params.filter)
        const selectedOrganizationUnitsLevels = formatOrgUnitLevels(
            saved.query?.myData?.params.filter
        )
        setIsUseCurrentUserOrgUnits(isAnyTrue)
        setSelectedOrganizationUnits(selectedOrganizationUnits)
        setIsSetPredifinedUserOrgUnits(isSetPredifinedUserOrgUnits)
        setSelectedOrgUnits(saved.organizationTree ?? [])
        setSelectedOrgUnitGroups(selectedOrgUnitGroups)
        setSelectedOrganizationUnitsLevels(selectedOrganizationUnitsLevels)
        setSelectedLevel(saved.selectedOrgUnitLevel ?? null)
        setSelectedVisualTitleAndSubTitle(saved.visualTitleAndSubTitle)
        setSelectedColorPalette(saved.visualSettings.visualColorPalette)
        setSelectedVisualSettings(saved.visualSettings)
        setBackedSelectedItems(saved.backedSelectedItems)

        // Handle data source change
        handleDataSourceChange({
            dataSourceId: savedDataSourceId,
            dimensions,
            dataSourceDetails: selectedDataSourceDetails,
            selectedOrganizationUnits,
            selectedOrganizationUnitsLevels,
            selectedOrgUnitGroups,
            isSetPredifinedUserOrgUnits,
            analyticsPayloadDeterminer,
        })
    }, [
        data,
        savedDataSources,
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
        setBackedSelectedItems,
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

export const useFetchVisualsData = () => {
    const query = {
        dataStore: {
            resource: `dataStore/${env.visualsStore}`,
            params: () => ({
                fields: '.',
            }),
        },
    }

    const { data, loading, error, isError, refetch } = useDataQuery(query)
    // Sort the entries based on `updatedAt` in descending order
    const sortedData = data?.dataStore?.entries?.sort(
        (a, b) => b.value.updatedAt - a.value.updatedAt
    )

    return { data, loading, error, isError, refetch }
}
