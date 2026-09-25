import type { AnalyticsLayout } from '@/features/analytics'

export type AnalyticsFilteringBoxTypes = keyof AnalyticsLayout

/** @deprecated use `AnalyticsLayout` from @/features/analytics */
export type analyticsPayloadDeterminerTypes = AnalyticsLayout
