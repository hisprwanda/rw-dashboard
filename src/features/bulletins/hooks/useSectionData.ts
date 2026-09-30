import { useDataEngine } from '@dhis2/app-runtime'
import { useQuery } from '@tanstack/react-query'
import { useDisplayProperty } from '@/features/auth'
import { previousPeriods } from '@/features/periods'
import { createInstanceClient } from '@/shared/api'
import {
    fetchCompleteness,
    fetchEventSignals,
    fetchTrackerCases,
    fetchTrends,
} from '../services/sectionService'
import type {
    BulletinContext,
    CompletenessSection,
    EventSignalsSection,
    IndicatorTrendsSection,
    TrackerCasesSection,
} from '../types/bulletin.types'
import { bulletinKeys } from './queryKeys'

const FIVE_MINUTES = 5 * 60 * 1000

/** Periods of a trend: the lookback before the issue period, then the period itself. */
export const usePeriodsOf = (context: BulletinContext, lookback: number) =>
    previousPeriods(context.periodId, lookback, context.calendar)

const keyOf = (context: BulletinContext, ...parts: unknown[]) =>
    bulletinKeys.section(context.instance, parts, context.periodId, context.orgUnits)

export const useIndicatorTrends = (section: IndicatorTrendsSection, context: BulletinContext) => {
    const engine = useDataEngine()
    const displayProperty = useDisplayProperty()
    const periods = usePeriodsOf(context, section.lookback)
    const ids = section.dataItems.map((item) => item.id)
    return useQuery({
        queryKey: keyOf(context, 'trends', ids, periods, displayProperty),
        queryFn: ({ signal }) =>
            fetchTrends(
                createInstanceClient(engine, context.instance),
                ids,
                periods,
                context.orgUnits,
                displayProperty,
                signal
            ),
        enabled: ids.length > 0,
        staleTime: FIVE_MINUTES,
    })
}

export const useCompleteness = (section: CompletenessSection, context: BulletinContext) => {
    const engine = useDataEngine()
    const displayProperty = useDisplayProperty()
    const periods = usePeriodsOf(context, section.lookback)
    const ids = section.dataSets.map((dataSet) => dataSet.id)
    const query = useQuery({
        queryKey: keyOf(
            context,
            'completeness',
            ids,
            periods,
            section.orgUnitLevel,
            displayProperty
        ),
        queryFn: ({ signal }) =>
            fetchCompleteness(
                createInstanceClient(engine, context.instance),
                ids,
                periods,
                context.orgUnits,
                section.orgUnitLevel,
                displayProperty,
                signal
            ),
        enabled: ids.length > 0,
        staleTime: FIVE_MINUTES,
    })
    return { query, periods }
}

export const useTrackerCases = (section: TrackerCasesSection, context: BulletinContext) => {
    const engine = useDataEngine()
    return useQuery({
        queryKey: keyOf(context, 'trackerCases', section),
        queryFn: ({ signal }) =>
            fetchTrackerCases(
                createInstanceClient(engine, context.instance),
                section,
                context.orgUnits,
                context.range,
                signal
            ),
        enabled: !!section.program && !!section.groupBy,
        staleTime: FIVE_MINUTES,
    })
}

export const useEventSignals = (section: EventSignalsSection, context: BulletinContext) => {
    const engine = useDataEngine()
    return useQuery({
        queryKey: keyOf(context, 'eventSignals', section),
        queryFn: ({ signal }) =>
            fetchEventSignals(
                createInstanceClient(engine, context.instance),
                section,
                context.orgUnits,
                context.range,
                signal
            ),
        enabled: !!section.program && !!section.codeElement,
        staleTime: FIVE_MINUTES,
    })
}
