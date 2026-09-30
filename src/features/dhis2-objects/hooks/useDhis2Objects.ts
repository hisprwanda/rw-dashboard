import { useConfig, useDataEngine } from '@dhis2/app-runtime'
import { keepPreviousData, skipToken, useQuery } from '@tanstack/react-query'
import { useEffect, useMemo } from 'react'
import { createInstanceClient, isNotFound, type InstanceConnection } from '@/shared/api'
import {
    fetchInstalledApps,
    fetchMap,
    fetchObjectImage,
    fetchVisualization,
    searchObjects,
} from '../services/dhis2ObjectService'
import type { Dhis2ObjectType } from '../types/dhis2Object.types'
import { pluginUrl } from '../utils/pluginUrl'
import { dhis2ObjectKeys } from './queryKeys'

const FIVE_MINUTES = 5 * 60 * 1000

/** A missing or unshared favorite is an answer, not an error worth retrying. */
const retryUnlessNotFound = (failureCount: number, error: unknown) =>
    !isNotFound(error) && failureCount < 2

/** One page of visualizations or maps of an instance matching `query`. */
export const useDhis2ObjectSearch = (
    instance: InstanceConnection | undefined,
    objectType: Dhis2ObjectType,
    query: string,
    page: number
) => {
    const engine = useDataEngine()
    return useQuery({
        queryKey: dhis2ObjectKeys.search(instance, objectType, query, page),
        queryFn: instance
            ? ({ signal }) =>
                  searchObjects(
                      createInstanceClient(engine, instance),
                      objectType,
                      query,
                      page,
                      signal
                  )
            : skipToken,
        placeholderData: keepPreviousData,
    })
}

/** The full definition of a Data Visualizer favorite. */
export const useDhis2Visualization = (
    instance: InstanceConnection | undefined,
    id: string | undefined
) => {
    const engine = useDataEngine()
    return useQuery({
        queryKey: dhis2ObjectKeys.detail(instance, 'visualization', id ?? ''),
        queryFn:
            instance && id
                ? ({ signal }) =>
                      fetchVisualization(createInstanceClient(engine, instance), id, signal)
                : skipToken,
        staleTime: FIVE_MINUTES,
        retry: retryUnlessNotFound,
    })
}

/** The full definition of a Maps favorite. */
export const useDhis2Map = (instance: InstanceConnection | undefined, id: string | undefined) => {
    const engine = useDataEngine()
    return useQuery({
        queryKey: dhis2ObjectKeys.detail(instance, 'map', id ?? ''),
        queryFn:
            instance && id
                ? ({ signal }) => fetchMap(createInstanceClient(engine, instance), id, signal)
                : skipToken,
        staleTime: FIVE_MINUTES,
        retry: retryUnlessNotFound,
    })
}

/**
 * The server-rendered image of a favorite, as an object URL (revoked when it changes or
 * the component unmounts). `enabled: false` keeps it idle.
 */
export const useDhis2ObjectImage = (
    instance: InstanceConnection | undefined,
    objectType: Dhis2ObjectType,
    id: string,
    enabled = true
) => {
    const engine = useDataEngine()
    const { data, isLoading, error } = useQuery({
        queryKey: dhis2ObjectKeys.image(instance, objectType, id),
        queryFn:
            instance && enabled
                ? ({ signal }) =>
                      fetchObjectImage(
                          createInstanceClient(engine, instance),
                          objectType,
                          id,
                          signal
                      )
                : skipToken,
        staleTime: FIVE_MINUTES,
        retry: retryUnlessNotFound,
    })
    const url = useMemo(() => (data ? URL.createObjectURL(data) : undefined), [data])
    useEffect(() => () => (url ? URL.revokeObjectURL(url) : undefined), [url])
    return { url, isLoading, error }
}

/**
 * The URL of the official plugin drawing a kind of favorite on the current instance, or
 * `null` when there is none (app missing or DHIS2 < 2.40). `undefined` while loading.
 */
export const usePluginUrl = (objectType: Dhis2ObjectType): string | null | undefined => {
    const engine = useDataEngine()
    const { baseUrl, systemInfo } = useConfig()
    const apps = useQuery({
        queryKey: dhis2ObjectKeys.apps(),
        queryFn: ({ signal }) => fetchInstalledApps(createInstanceClient(engine), signal),
        staleTime: Infinity,
    })
    if (apps.isLoading) return undefined
    return pluginUrl({
        apps: apps.data,
        objectType,
        baseUrl,
        contextPath: systemInfo?.contextPath,
        pageUrl: window.location.href,
    })
}
