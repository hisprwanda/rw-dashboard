// AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react'
import { useDataEngine } from '@dhis2/app-runtime'
import { useQueryClient } from '@tanstack/react-query'
import { useMe } from '@/features/auth'
import {
    analyticsQueryOptions,
    buildAnalyticsRequest,
    getDimensionItems,
    transformMetadataLabels,
    type AnalyticsParams,
} from '@/features/analytics'
import {
    orgUnitNameQueryOptions,
    useOrgUnitMetadata,
    type OrgUnitMetadata,
    type UserOrgUnitScope,
} from '@/features/org-units'
import { useApplicationTitle } from '@/features/system'
import type { InstanceConnection } from '@/shared/api'
import { ErrorState, LoadingState } from '@/shared/components'
import type { Me } from '@/shared/types/dhis2.types'
import { useLegacyOrgUnitSelection } from './useLegacyOrgUnitSelection'
import {
    VisualSettingsTypes,
    VisualTitleAndSubtitleType,
    ColorPaletteTypes,
    visualColorPaletteTypes,
    AxisSettingsTypes,
} from '../types/visualSettingsTypes'
import { systemDefaultColorPalettes } from '../constants/colorPalettes'
import type { DataSource } from '@/features/data-sources'
import { dimensionItemTypesTYPES } from '../types/dimensionDataItemTypes'
import { dimensionItemTypes } from '../constants/dimensionItemTypes'
import { BackedSelectedItem, visualTypes } from '../types/visualType'
import { currentInstanceId } from '../constants/currentInstanceInfo'
import { analyticsPayloadDeterminerTypes } from '../types/analyticsTypes'
import { BasemapType } from '../types/maps'
import { legendTypeTypes, mapSettingsTypes } from '../types/mapFormTypes'

export type FetchAnalyticsDataInput = {
    dimension: string[]
    instance: InstanceConnection
    isAnalyticsApiUsedInMap?: boolean
    selectedPeriodsOnMap?: string[]
    /** Maps: the `ou:` dimension (see buildOrgUnitDimension). */
    selectedOrgUnitsWhenUsingMap?: string
    analyticsPayloadDeterminer?: analyticsPayloadDeterminerTypes

    selectedOrganizationUnits?: string[]
    selectedOrgUnitGroups?: string[]
    selectedOrganizationUnitsLevels?: Array<string | number>
    isUseCurrentUserOrgUnits?: boolean
    isSetPredifinedUserOrgUnits?: UserOrgUnitScope
}

/** The data source picked in a builder: the current instance or a saved external one. */
export type SelectedDataSource = InstanceConnection & { instanceName: string } & Partial<DataSource>

type LegacyOrgUnitSelection = ReturnType<typeof useLegacyOrgUnitSelection>

interface AuthContextProps extends LegacyOrgUnitSelection {
    /** Org-unit tree/levels/groups of the selected data source (TanStack Query). */
    currentUserInfoAndOrgUnitsData: OrgUnitMetadata | undefined
    fetchSingleOrgUnitName: (orgUnitId: string, instance: InstanceConnection) => Promise<string>
    /** @deprecated use `useMe()` from @/features/auth */
    userDatails: { me?: Me }
    /** @deprecated use `useHasAuthority()` from @/features/auth */
    authorities: string[]
    analyticsDimensions: any
    setAnalyticsDimensions: any
    fetchAnalyticsData: (input: FetchAnalyticsDataInput) => Promise<void>
    analyticsData: any
    setAnalyticsData: any
    isFetchAnalyticsDataLoading: any
    fetchAnalyticsDataError: any
    analyticsQuery: any
    selectedChartType: visualTypes
    setSelectedChartType: any
    setAnalyticsQuery: any
    mapAnalyticsQueryTwo: any
    setMapAnalyticsQueryTwo: any
    geoFeaturesQuery: any
    setGeoFeaturesQuery: any
    selectedVisualsForDashboard: string[]
    setSelectedVisualsForDashboard: any
    visualTitleAndSubTitle: VisualTitleAndSubtitleType
    setSelectedVisualTitleAndSubTitle: any
    visualSettings: VisualSettingsTypes
    setSelectedVisualSettings: any
    selectedColorPalette: visualColorPaletteTypes
    setSelectedColorPalette: any
    visualsColorPalettes: ColorPaletteTypes
    setVisualsColorPalettes: any
    dataItemsData: any
    setDataItemsData: any
    selectedDataSourceDetails: SelectedDataSource
    setSelectedDataSourceDetails: any
    selectedDataSourceOption: string
    setSelectedDataSourceOption: any
    selectedDimensionItemType: dimensionItemTypesTYPES
    setSelectedDimensionItemType: any
    dataItemsDataPage: number
    setDataItemsDataPage: any
    subDataItemsData: any
    setSubDataItemsData: any
    backedSelectedItems: BackedSelectedItem[]
    setBackedSelectedItems: any
    isExportingDashboardAsPPTX: boolean
    setIsExportingDashboardAsPPTX: any
    geoFeaturesData: any
    setGeoFeaturesData: any
    analyticsMapData: any
    setAnalyticsMapData: any
    metaMapData: any
    setMetaMapData: any
    metaDataLabels: any
    setMetaDataLabels: any
    analyticsPayloadDeterminer: analyticsPayloadDeterminerTypes
    setAnalyticsPayloadDeterminer: any
    currentBasemap: BasemapType
    setCurrentBasemap: any
    legendType: legendTypeTypes
    setLegendType: any
    mapSettings: mapSettingsTypes
    setMapSettings: any
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

interface AuthProviderProps {
    children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const initialState: analyticsPayloadDeterminerTypes = {
        Columns: ['Data'],
        Rows: ['Period'],
        Filter: ['Organisation unit'],
    }
    const { data: me, isLoading: isMeLoading, error: meError, refetch: refetchMe } = useMe()
    const applicationTitle = useApplicationTitle()
    const orgUnitSelection = useLegacyOrgUnitSelection()
    const queryClient = useQueryClient()
    const [analyticsPayloadDeterminer, setAnalyticsPayloadDeterminer] =
        useState<analyticsPayloadDeterminerTypes>(initialState)
    const [isExportingDashboardAsPPTX, setIsExportingDashboardAsPPTX] = useState<boolean>(false)
    const [selectedDataSourceOption, setSelectedDataSourceOption] =
        useState<string>(currentInstanceId)
    const [geoFeaturesData, setGeoFeaturesData] = useState<any>([])
    const [analyticsMapData, setAnalyticsMapData] = useState<any>([])
    const [metaMapData, setMetaMapData] = useState<any>([])
    const [metaDataLabels, setMetaDataLabels] = useState<any>({})
    const [currentBasemap, setCurrentBasemap] = useState<BasemapType>('osm-light')
    const [legendType, setLegendType] = useState<legendTypeTypes>('auto')
    const [mapSettings, setMapSettings] = useState<mapSettingsTypes>({
        appliedLabels: {},
        selectedLabels: [],
        legend: {},
        legendType: 'auto',
    })
    /// this is the current instance definition as data source
    const defaultDataSource: SelectedDataSource = {
        instanceName: applicationTitle,
        isCurrentInstance: true,
    }

    const [selectedDataSourceDetails, setSelectedDataSourceDetails] =
        useState<SelectedDataSource>(defaultDataSource)
    const [selectedDimensionItemType, setSelectedDimensionItemType] =
        useState<dimensionItemTypesTYPES>(dimensionItemTypes[0])

    // metadata states
    //
    const [dataItemsData, setDataItemsData] = useState<any>()
    const [subDataItemsData, setSubDataItemsData] = useState<any>()
    const [dataItemsDataPage, setDataItemsDataPage] = useState<number>(1)
    const [backedSelectedItems, setBackedSelectedItems] = useState<BackedSelectedItem[]>([])
    const [isFetchAnalyticsDataLoading, setIsFetchAnalyticsDataLoading] = useState(false)
    const [analyticsData, setAnalyticsData] = useState<any>(null)
    const [fetchAnalyticsDataError, setFetchAnalyticsDataError] = useState<any>(false)
    const [analyticsDimensions, setAnalyticsDimensions] = useState<any>({
        dx: [],
        pe: ['LAST_12_MONTHS'],
    })
    const [analyticsQuery, setAnalyticsQuery] = useState<any>(null)
    const [mapAnalyticsQueryTwo, setMapAnalyticsQueryTwo] = useState<any>(null)
    const [geoFeaturesQuery, setGeoFeaturesQuery] = useState<any>(null)
    const [selectedChartType, setSelectedChartType] = useState<visualTypes>('Column')
    const [selectedVisualsForDashboard, setSelectedVisualsForDashboard] = useState<string[]>([])
    const [visualTitleAndSubTitle, setSelectedVisualTitleAndSubTitle] =
        useState<VisualTitleAndSubtitleType>({
            visualTitle: '',
            DefaultSubTitle: {
                periods: [],
                orgUnits: [],
                dataElements: [],
            },
            customSubTitle: '',
        })

    const [selectedColorPalette, setSelectedColorPalette] = useState<visualColorPaletteTypes>(
        systemDefaultColorPalettes[0] || []
    )
    const [visualsColorPalettes, setVisualsColorPalettes] = useState<ColorPaletteTypes>(
        systemDefaultColorPalettes
    )
    const [visualSettings, setSelectedVisualSettings] = useState<VisualSettingsTypes>({
        backgroundColor: '#ffffff',
        visualColorPalette: selectedColorPalette,
        fillColor: '#000000',
        XAxisSettings: { color: '#000000', fontSize: 12 },
        YAxisSettings: { color: '#000000', fontSize: 12 },
    })

    // Server data for the org-unit pickers follows the selected data source.
    const { data: currentUserInfoAndOrgUnitsData } = useOrgUnitMetadata(selectedDataSourceDetails)

    // Hooks must run before any early return.
    const engine = useDataEngine()

    if (isMeLoading) return <LoadingState fullScreen />
    if (meError || !me) return <ErrorState error={meError} onRetry={() => void refetchMe()} />

    /**
     * Legacy imperative entry point (kept until the builders move to features in Phases 6–7).
     * Request building lives in @/features/analytics; this only stores results in context.
     */
    const fetchAnalyticsData = async ({
        dimension,
        instance,
        isAnalyticsApiUsedInMap,
        selectedPeriodsOnMap = [],
        selectedOrgUnitsWhenUsingMap = '',
        analyticsPayloadDeterminer: layout,
        selectedOrganizationUnits = [],
        selectedOrgUnitGroups = [],
        selectedOrganizationUnitsLevels = [],
        isUseCurrentUserOrgUnits = false,
        isSetPredifinedUserOrgUnits = orgUnitSelection.isSetPredifinedUserOrgUnits,
    }: FetchAnalyticsDataInput): Promise<void> => {
        const request = buildAnalyticsRequest({
            dimension,
            layout,
            orgUnit: {
                useCurrentUserOrgUnits: isUseCurrentUserOrgUnits,
                userOrgUnitScope: isSetPredifinedUserOrgUnits,
                orgUnitIds: selectedOrganizationUnits,
                levelIds: selectedOrganizationUnitsLevels,
                groupIds: selectedOrgUnitGroups,
            },
            map: isAnalyticsApiUsedInMap
                ? {
                      periodFilter: selectedPeriodsOnMap.join(';'),
                      orgUnitDimension: selectedOrgUnitsWhenUsingMap,
                  }
                : undefined,
        })
        if (!request) {
            console.warn('Analytics request skipped: select data, period and org unit first.')
            return
        }

        setIsFetchAnalyticsDataLoading(true)
        setFetchAnalyticsDataError(null)
        // staleTime 0: an explicit "Update" always re-fetches (concurrent calls still dedupe).
        const run = (params: AnalyticsParams) =>
            queryClient.fetchQuery({
                ...analyticsQueryOptions(engine, instance, params),
                staleTime: 0,
            })

        try {
            const [data, metadata] = await Promise.all([
                run(request.dataParams),
                run(request.metadataParams),
            ])
            setAnalyticsQuery(request.storedQuery)

            if (isAnalyticsApiUsedInMap) {
                setMapAnalyticsQueryTwo(request.storedMapQuery)
                setMetaMapData(metadata)
                setAnalyticsMapData(data)
                return
            }

            setAnalyticsData(data)
            setMetaDataLabels(metadata.metaData)
            const labels = transformMetadataLabels(metadata.metaData)
            setSelectedVisualTitleAndSubTitle((prevState: VisualTitleAndSubtitleType) => ({
                ...prevState,
                DefaultSubTitle: {
                    periods: getDimensionItems(labels, 'periods'),
                    orgUnits: getDimensionItems(labels, 'orgUnits'),
                    dataElements: getDimensionItems(labels, 'dataElements'),
                },
            }))
        } catch (error) {
            setFetchAnalyticsDataError(error)
            console.error('Error fetching analytics data:', error)
        } finally {
            setIsFetchAnalyticsDataLoading(false)
        }
    }

    const fetchSingleOrgUnitName = (orgUnitId: string, instance: InstanceConnection) =>
        queryClient.fetchQuery(orgUnitNameQueryOptions(engine, instance, orgUnitId))

    return (
        <AuthContext.Provider
            value={{
                mapSettings,
                setMapSettings,
                legendType,
                setLegendType,
                analyticsPayloadDeterminer,
                currentBasemap,
                setCurrentBasemap,
                setAnalyticsPayloadDeterminer,
                metaDataLabels,
                setMetaDataLabels,
                geoFeaturesQuery,
                mapAnalyticsQueryTwo,
                analyticsMapData,
                setGeoFeaturesQuery,
                setMapAnalyticsQueryTwo,
                geoFeaturesData,
                metaMapData,
                setAnalyticsMapData,
                setGeoFeaturesData,
                setMetaMapData,
                isExportingDashboardAsPPTX,
                setIsExportingDashboardAsPPTX,
                setSubDataItemsData,
                subDataItemsData,
                backedSelectedItems,
                setBackedSelectedItems,
                dataItemsDataPage,
                setDataItemsDataPage,
                selectedDimensionItemType,
                setSelectedDimensionItemType,
                selectedDataSourceOption,
                setSelectedDataSourceOption,
                selectedDataSourceDetails,
                setSelectedDataSourceDetails,
                dataItemsData,
                setDataItemsData,
                setVisualsColorPalettes,
                visualsColorPalettes,
                selectedColorPalette,
                setSelectedColorPalette,
                visualSettings,
                setSelectedVisualSettings,
                fetchSingleOrgUnitName,
                visualTitleAndSubTitle,
                setSelectedVisualTitleAndSubTitle,
                selectedVisualsForDashboard,
                setSelectedVisualsForDashboard,
                setAnalyticsData,
                setAnalyticsQuery,
                userDatails: { me },
                authorities: me.authorities,
                ...orgUnitSelection,
                currentUserInfoAndOrgUnitsData,
                analyticsDimensions,
                setAnalyticsDimensions,
                fetchAnalyticsData,
                analyticsData,
                isFetchAnalyticsDataLoading,
                fetchAnalyticsDataError,
                analyticsQuery,
                selectedChartType,
                setSelectedChartType,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuthorities = (): AuthContextProps => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuthorities must be used within a AuthProvider')
    }
    return context
}
