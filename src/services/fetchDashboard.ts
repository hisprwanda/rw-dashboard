import { useDataQuery } from '@dhis2/app-runtime'
import { useDataEngine } from '@dhis2/app-runtime'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useToast } from '../components/ui/use-toast'

export const useFetchSingleDashboardData = (dashboardId: string | undefined) => {
    const engine = useDataEngine()

    // Always call hooks in the same order; the query simply stays idle without an id.
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['dashboards', 'detail', dashboardId],
        queryFn: () =>
            engine.query({
                dataStore: {
                    resource: `dataStore/${process.env.REACT_APP_DASHBOARD_STORE}/${dashboardId}`,
                },
            }),
        enabled: !!dashboardId,
    })

    return {
        data,
        loading: isLoading,
        error,
        isError: !!error,
        refetch,
    }
}

export const useDashboardsData = () => {
    const query = {
        dataStore: {
            resource: `dataStore/${process.env.REACT_APP_DASHBOARD_STORE}`,
            params: () => ({
                fields: '.',
                paging: false,
            }),
        },
    }

    const { data, loading, error, isError, refetch } = useDataQuery(query)

    // Sort the entries based on `updatedAt` in descending order
    const sortedData = data?.dataStore?.entries?.sort(
        (a, b) => b.value.updatedAt - a.value.updatedAt
    )

    return {
        data: { ...data, dataStore: { ...data?.dataStore, entries: sortedData } },
        loading,
        error,
        isError,
        refetch,
    }
}

export const useUpdatingDashboardSharing = () => {
    const { toast } = useToast()
    const engine = useDataEngine()
    const [data, setData] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState(false)

    const updatingDashboardSharing = async ({
        uuid,
        dashboardData,
    }: {
        uuid: string
        dashboardData: any
    }) => {
        setIsLoading(true)
        setIsError(false)
        try {
            const { dataStore } = await engine.mutate({
                resource: `dataStore/${process.env.REACT_APP_DASHBOARD_STORE}/${uuid}`,
                type: 'update',
                data: dashboardData,
            })
            toast({
                title: 'Success',
                description: 'saved successfully',
                variant: 'default',
            })
            setData(dataStore)
            return dataStore
        } catch (error) {
            setIsError(true)
            toast({
                title: 'Error',
                description: 'Something went wrong',
                variant: 'destructive',
            })
            throw new Error('Updating Dashboard error')
        } finally {
            setIsLoading(false)
        }
    }

    return { isLoading, data, isError, updatingDashboardSharing }
}
