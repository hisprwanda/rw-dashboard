// AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react'
import { useDataEngine } from '@dhis2/app-runtime'
import { useQueryClient } from '@tanstack/react-query'
import { useMe } from '@/features/auth'
import { orgUnitNameQuery, useOrgUnitMetadata, type OrgUnitMetadata } from '@/features/org-units'
import { useApplicationTitle } from '@/features/system'
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
import { DataSourceFormFields } from '../types/DataSource'
import axios from 'axios'
import { dimensionItemTypesTYPES } from '../types/dimensionDataItemTypes'
import { dimensionItemTypes } from '../constants/dimensionItemTypes'
import { BackedSelectedItem, visualTypes } from '../types/visualType'
import { currentInstanceId } from '../constants/currentInstanceInfo'
import { getAnalyticsFilter } from '../lib/getAnalyticsFilters'
import { getDimensionItems, PeriodItem, transformMetadataLabels } from '../lib/formatMetaDataLabels'
import { analyticsPayloadDeterminerTypes } from '../types/analyticsTypes'
import { updateQueryParams } from '../lib/payloadFormatter'
import { BasemapType } from '../types/maps'
import { legendTypeTypes, mapSettingsTypes } from '../types/mapFormTypes'

type LegacyOrgUnitSelection = ReturnType<typeof useLegacyOrgUnitSelection>

interface AuthContextProps extends LegacyOrgUnitSelection {
    /** Org-unit tree/levels/groups of the selected data source (TanStack Query). */
    currentUserInfoAndOrgUnitsData: OrgUnitMetadata | undefined
    fetchSingleOrgUnitName: (orgUnitId: string, instance: DataSourceFormFields) => Promise<string>
    /** @deprecated use `useMe()` from @/features/auth */
    userDatails: { me?: Me }
    /** @deprecated use `useHasAuthority()` from @/features/auth */
    authorities: string[]
    analyticsDimensions: any
    setAnalyticsDimensions: any
    fetchAnalyticsData: any
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
    selectedDataSourceDetails: DataSourceFormFields
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
    const defaultDataSource: DataSourceFormFields = {
        instanceName: applicationTitle,
        isCurrentInstance: true,
    }

    const [selectedDataSourceDetails, setSelectedDataSourceDetails] =
        useState<DataSourceFormFields>(defaultDataSource)
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

    type fetchAnalyticsDataProps = {
        dimension: any
        instance: DataSourceFormFields
        isAnalyticsApiUsedInMap?: boolean
        selectedPeriodsOnMap?: string[]
        selectedOrgUnitsWhenUsingMap?: string[]
        analyticsPayloadDeterminer?: analyticsPayloadDeterminerTypes

        selectedOrganizationUnits: any[]
        selectedOrgUnitGroups: any[]
        selectedOrganizationUnitsLevels: any[]
        isUseCurrentUserOrgUnits: boolean
        isSetPredifinedUserOrgUnits: any
    }

    const fetchAnalyticsData = async ({
        dimension,
        instance,
        isAnalyticsApiUsedInMap,
        selectedPeriodsOnMap = [],
        selectedOrgUnitsWhenUsingMap = [],
        analyticsPayloadDeterminer,

        selectedOrganizationUnits,
        selectedOrgUnitGroups,
        selectedOrganizationUnitsLevels,
        isUseCurrentUserOrgUnits,
        isSetPredifinedUserOrgUnits,
    }: fetchAnalyticsDataProps): Promise<void> => {
        try {
            // Prepare organization unit parameters
            const orgUnitIds = selectedOrganizationUnits?.map((unit: any) => unit)?.join(';')
            const orgUnitLevelIds = selectedOrganizationUnitsLevels
                ?.map((unit: any) => `LEVEL-${unit}`)
                ?.join(';')
            const orgUnitGroupIds = selectedOrgUnitGroups
                ?.map((item: any) => `OU_GROUP-${item}`)
                ?.join(';')

            // Get analytics filter
            const filter = getAnalyticsFilter({
                isAnalyticsApiUsedInMap,
                selectedPeriodsOnMap,
                orgUnitIds,
                orgUnitLevelIds,
                orgUnitGroupIds,
            })

            // Validate required data before proceeding
            const isDxDimensionValid = dimension.some(
                (item) => item.startsWith('dx:') && item.split(':')[1].trim()
            )
            const isPeValid = isAnalyticsApiUsedInMap
                ? filter.startsWith('pe:') && filter.split(':')[1].trim()
                : dimension.some((item) => item.startsWith('pe:') && item.split(':')[1].trim())
            const isOuValid = !isAnalyticsApiUsedInMap
                ? filter.startsWith('ou:') && filter.split(':')[1].trim()
                : true

            if (!(isDxDimensionValid && isPeValid && isOuValid)) {
                console.error('Invalid analytics parameters')
                return
            }

            // Set loading state
            setIsFetchAnalyticsDataLoading(true)
            setFetchAnalyticsDataError(null)

            // Update dimensions for map if needed
            const updatedDimension = [...dimension]
            if (isAnalyticsApiUsedInMap) {
                updatedDimension.push(selectedOrgUnitsWhenUsingMap)
            }

            // Create original analytics query
            const originalAnalyticsQuery = {
                dimension: updatedDimension,
                filter,
                displayProperty: 'NAME',
                includeNumDen: true,
            }
            // Transform query for API execution, but not for storage
            const transformedQueryBasedOnPayloadDeterminer = updateQueryParams(
                originalAnalyticsQuery,
                analyticsPayloadDeterminer
            )

            // Determine query parameters based on use case (for API execution)
            const queryParams = isAnalyticsApiUsedInMap
                ? {
                      dimension: updatedDimension,
                      filter,
                      displayProperty: 'NAME',
                      skipData: false,
                      skipMeta: true,
                  }
                : transformedQueryBasedOnPayloadDeterminer
            // Metadata query parameters
            const queryParamsForMetaDataLabels = {
                dimension: updatedDimension,
                filter,
                displayProperty: 'NAME',
                includeNumDen: true,
                skipMeta: false,
                skipData: true,
                includeMetadataDetails: true,
            }

            // Map-specific metadata query parameters
            const mapMetadataQueryParams = {
                dimension: updatedDimension,
                filter,
                displayProperty: 'NAME',
                skipMeta: false,
                skipData: true,
                includeMetadataDetails: true,
            }

            if (instance.isCurrentInstance) {
                // Internal request via engine.query
                // Create query objects for execution
                const queryForExecution = {
                    myData: {
                        resource: 'analytics',
                        params: queryParams, // Use transformed params for execution
                    },
                    MetaDataLabels: {
                        resource: 'analytics',
                        params: queryParamsForMetaDataLabels,
                    },
                }

                // Execute the query
                const result = await engine.query(queryForExecution)

                // Store original query in state (not the transformed one)
                const analyticsQueryForStorage = {
                    myData: {
                        resource: 'analytics',
                        params: originalAnalyticsQuery, // Use original params for storage
                    },
                    MetaDataLabels: {
                        resource: 'analytics',
                        params: queryParamsForMetaDataLabels,
                    },
                }
                setAnalyticsQuery(analyticsQueryForStorage)

                if (isAnalyticsApiUsedInMap) {
                    // Additional query for map data
                    const analyticsQueryTwoForExecution = {
                        myData: {
                            resource: 'analytics',
                            params: mapMetadataQueryParams,
                        },
                    }

                    const resultTwo = await engine.query(analyticsQueryTwoForExecution)

                    // Store original query for map
                    const mapAnalyticsQueryForStorage = {
                        myData: {
                            resource: 'analytics',
                            params: originalAnalyticsQuery, // Use original params for storage
                        },
                    }
                    setMapAnalyticsQueryTwo(mapAnalyticsQueryForStorage)
                    setMetaMapData(resultTwo?.myData)
                    setAnalyticsMapData(result?.myData)
                } else {
                    // Process regular analytics data
                    setAnalyticsData(result?.myData)
                    setMetaDataLabels(result?.MetaDataLabels?.metaData)

                    // Update visual title and subtitle
                    if (result?.MetaDataLabels?.metaData) {
                        const transformedMetaDataLabels = transformMetadataLabels(
                            result.MetaDataLabels.metaData
                        )

                        const allPeriods = transformedMetaDataLabels
                            ? getDimensionItems<PeriodItem>(transformedMetaDataLabels, 'periods')
                            : []
                        const allOrganizationUnit = transformedMetaDataLabels
                            ? getDimensionItems<PeriodItem>(transformedMetaDataLabels, 'orgUnits')
                            : []
                        const allDataElements = transformedMetaDataLabels
                            ? getDimensionItems<PeriodItem>(
                                  transformedMetaDataLabels,
                                  'dataElements'
                              )
                            : []

                        setSelectedVisualTitleAndSubTitle(
                            (prevState: VisualTitleAndSubtitleType) => ({
                                ...prevState,
                                DefaultSubTitle: {
                                    periods: allPeriods,
                                    orgUnits: allOrganizationUnit,
                                    dataElements: allDataElements,
                                },
                            })
                        )
                    }
                }
            } else {
                // External request via axios
                try {
                    // Main data request - use transformed params for execution
                    const response = await axios.get(`${instance.url}/api/analytics`, {
                        headers: {
                            Authorization: `ApiToken ${instance.token}`,
                        },
                        params: queryParams, // Use transformed params for API call
                    })

                    // Store original query in state (not the transformed one)
                    const analyticsQueryForStorage = {
                        myData: {
                            resource: 'analytics',
                            params: originalAnalyticsQuery, // Use original params for storage
                        },
                        MetaDataLabels: {
                            resource: 'analytics',
                            params: queryParamsForMetaDataLabels,
                        },
                    }

                    setAnalyticsQuery(analyticsQueryForStorage)
                    setAnalyticsData(response.data)

                    // Get metadata for labels if not using map
                    if (!isAnalyticsApiUsedInMap) {
                        const metadataResponse = await axios.get(`${instance.url}/api/analytics`, {
                            headers: {
                                Authorization: `ApiToken ${instance.token}`,
                            },
                            params: queryParamsForMetaDataLabels,
                        })

                        setMetaDataLabels(metadataResponse.data?.metaData)

                        // Process metadata for visual elements
                        const transformedMetaDataLabels = transformMetadataLabels(
                            metadataResponse.data?.metaData
                        )

                        const allPeriods = transformedMetaDataLabels
                            ? getDimensionItems<PeriodItem>(transformedMetaDataLabels, 'periods')
                            : []
                        const allOrganizationUnit = transformedMetaDataLabels
                            ? getDimensionItems<PeriodItem>(transformedMetaDataLabels, 'orgUnits')
                            : []
                        const allDataElements = transformedMetaDataLabels
                            ? getDimensionItems<PeriodItem>(
                                  transformedMetaDataLabels,
                                  'dataElements'
                              )
                            : []

                        setSelectedVisualTitleAndSubTitle(
                            (prevState: VisualTitleAndSubtitleType) => ({
                                ...prevState,
                                DefaultSubTitle: {
                                    periods: allPeriods,
                                    orgUnits: allOrganizationUnit,
                                    dataElements: allDataElements,
                                },
                            })
                        )
                    } else {
                        // Additional map-specific metadata request
                        const mapMetadataResponse = await axios.get(
                            `${instance.url}/api/analytics`,
                            {
                                headers: {
                                    Authorization: `ApiToken ${instance.token}`,
                                },
                                params: mapMetadataQueryParams,
                            }
                        )

                        // Store original query for map
                        const mapAnalyticsQueryForStorage = {
                            myData: {
                                resource: 'analytics',
                                params: originalAnalyticsQuery, // Use original params for storage
                            },
                        }

                        setMapAnalyticsQueryTwo(mapAnalyticsQueryForStorage)
                        setMetaMapData(mapMetadataResponse.data)
                        setAnalyticsMapData(response.data)
                    }
                } catch (error) {
                    console.error('Error in external API request:', error)
                    throw error // Rethrow to be caught by outer try/catch
                }
            }
        } catch (error) {
            setFetchAnalyticsDataError(error)
            console.error('Error fetching analytics data:', error)
        } finally {
            setIsFetchAnalyticsDataLoading(false)
        }
    }

    const fetchSingleOrgUnitName = (orgUnitId: string, instance: DataSourceFormFields) =>
        queryClient.fetchQuery(orgUnitNameQuery(engine, instance, orgUnitId))

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
