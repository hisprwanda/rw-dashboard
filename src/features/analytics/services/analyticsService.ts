import type { InstanceClient } from '@/shared/api'
import type { AnalyticsResponse } from '@/shared/types/dhis2.types'
import type { AnalyticsParams } from '../types/analytics.types'

export const fetchAnalytics = (
    client: InstanceClient,
    params: AnalyticsParams,
    signal?: AbortSignal
): Promise<AnalyticsResponse> => client.get<AnalyticsResponse>('analytics', params, signal)
