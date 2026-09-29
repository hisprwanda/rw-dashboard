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
    type SelectedDataSource,
} from '@/features/analytics'
import {
    orgUnitNameQueryOptions,
    useOrgUnitMetadata,
    type OrgUnitMetadata,
    type UserOrgUnitScope,
} from '@/features/org-units'
import type { InstanceConnection } from '@/shared/api'
import { ErrorState, LoadingState } from '@/shared/components'
import type { Me } from '@/shared/types/dhis2.types'
import { useLegacyBuilderState } from './useLegacyBuilderState'
import { useLegacyOrgUnitSelection } from './useLegacyOrgUnitSelection'
import { analyticsPayloadDeterminerTypes } from '../types/analyticsTypes'

export type FetchAnalyticsDataInput = {
    dimension: string[]
    instance: InstanceConnection
    analyticsPayloadDeterminer?: analyticsPayloadDeterminerTypes

    selectedOrganizationUnits?: string[]
    selectedOrgUnitGroups?: string[]
    selectedOrganizationUnitsLevels?: Array<string | number>
    isUseCurrentUserOrgUnits?: boolean
    isSetPredifinedUserOrgUnits?: UserOrgUnitScope
}

type LegacyOrgUnitSelection = ReturnType<typeof useLegacyOrgUnitSelection>
type LegacyBuilderState = ReturnType<typeof useLegacyBuilderState>

interface AuthContextProps extends LegacyOrgUnitSelection, LegacyBuilderState {
    /** Org-unit tree/levels/groups of the selected data source (TanStack Query). */
    currentUserInfoAndOrgUnitsData: OrgUnitMetadata | undefined
    fetchSingleOrgUnitName: (orgUnitId: string, instance: InstanceConnection) => Promise<string>
    /** @deprecated use `useMe()` from @/features/auth */
    userDatails: { me?: Me }
    /** @deprecated use `useHasAuthority()` from @/features/auth */
    authorities: string[]
    fetchAnalyticsData: (input: FetchAnalyticsDataInput) => Promise<void>
    analyticsData: any
    setAnalyticsData: any
    isFetchAnalyticsDataLoading: any
    fetchAnalyticsDataError: any
    analyticsQuery: any
    setAnalyticsQuery: any
    metaDataLabels: any
    setMetaDataLabels: any
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined)

interface AuthProviderProps {
    children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const { data: me, isLoading: isMeLoading, error: meError, refetch: refetchMe } = useMe()
    const orgUnitSelection = useLegacyOrgUnitSelection()
    const builder = useLegacyBuilderState()
    const queryClient = useQueryClient()
    const [metaDataLabels, setMetaDataLabels] = useState<any>({})

    // metadata states
    //
    const [isFetchAnalyticsDataLoading, setIsFetchAnalyticsDataLoading] = useState(false)
    const [analyticsData, setAnalyticsData] = useState<any>(null)
    const [fetchAnalyticsDataError, setFetchAnalyticsDataError] = useState<any>(false)
    const [analyticsQuery, setAnalyticsQuery] = useState<any>(null)

    // Server data for the org-unit pickers follows the selected data source.
    const { data: currentUserInfoAndOrgUnitsData } = useOrgUnitMetadata(
        builder.selectedDataSourceDetails
    )

    // Hooks must run before any early return.
    const engine = useDataEngine()

    if (isMeLoading) return <LoadingState fullScreen />
    if (meError || !me) return <ErrorState error={meError} onRetry={() => void refetchMe()} />

    /**
     * Legacy imperative entry point for the report page (Phase 8); maps and the visualizer
     * use `useAnalyticsRun` from @/features/analytics.
     * Request building lives in @/features/analytics; this only stores results in context.
     */
    const fetchAnalyticsData = async ({
        dimension,
        instance,
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

            setAnalyticsData(data)
            setMetaDataLabels(metadata.metaData)
            const labels = transformMetadataLabels(metadata.metaData)
            builder.setSelectedVisualTitleAndSubTitle((prevState) => ({
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
                metaDataLabels,
                setMetaDataLabels,
                fetchSingleOrgUnitName,
                setAnalyticsData,
                setAnalyticsQuery,
                userDatails: { me },
                authorities: me.authorities,
                ...orgUnitSelection,
                ...builder,
                currentUserInfoAndOrgUnitsData,
                fetchAnalyticsData,
                analyticsData,
                isFetchAnalyticsDataLoading,
                fetchAnalyticsDataError,
                analyticsQuery,
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

export type { SelectedDataSource }
