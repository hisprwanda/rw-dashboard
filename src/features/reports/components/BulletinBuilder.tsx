import i18n from '@dhis2/d2-i18n'
import { Button, IconClock16 } from '@dhis2/ui'
import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector, useAppStore } from '@/app/store'
import { buildSelectionRequest, selectionActions, useAnalyticsRun } from '@/features/analytics'
import { CURRENT_INSTANCE_ID } from '@/features/data-sources'
import { orgUnitSelectionActions } from '@/features/org-units'
import { PeriodModal } from '@/features/periods'
import { useApplicationTitle } from '@/features/system'
import { EmptyState, ErrorState, LoadingState } from '@/shared/components'
import { BULLETIN_DISEASES } from '../constants/bulletin'
import { BulletinReport } from './BulletinReport'

/** Pick a week, then read the weekly epidemiological bulletin. */
export const BulletinBuilder = () => {
    const dispatch = useAppDispatch()
    const store = useAppStore()
    const applicationTitle = useApplicationTitle()
    const analytics = useAnalyticsRun()
    const [showPeriods, setShowPeriods] = useState(false)
    const periodCount = useAppSelector((state) => state.selection.dimensions.pe?.length ?? 0)

    // The bulletin always reads the current instance with the user's org unit.
    useEffect(() => {
        dispatch(
            selectionActions.changeDataSource({
                id: CURRENT_INSTANCE_ID,
                dataSource: { isCurrentInstance: true, instanceName: applicationTitle },
            })
        )
        dispatch(selectionActions.setDimensions({ dx: [], pe: [] }))
        dispatch(orgUnitSelectionActions.resetOrgUnitSelection())
    }, [dispatch, applicationTitle])

    const run = async () => {
        const { selection, orgUnitSelection } = store.getState()
        const request = buildSelectionRequest(
            {
                ...selection,
                dimensions: { ...selection.dimensions, dx: BULLETIN_DISEASES.map((d) => d.id) },
            },
            orgUnitSelection
        )
        if (request) await analytics.run(request, selection.dataSource)
    }

    const renderReport = () => {
        if (analytics.isFetching)
            return <LoadingState label={i18n.t('Loading the bulletin data')} />
        if (analytics.error) return <ErrorState error={analytics.error} />
        if (!analytics.data) {
            return (
                <EmptyState
                    message={i18n.t(
                        'Weekly epidemiological bulletin: choose a week on the left, then click Update.'
                    )}
                />
            )
        }
        return <BulletinReport analytics={analytics.data} />
    }

    return (
        <div className="flex items-start gap-4 p-4">
            <aside className="w-64 shrink-0 rounded bg-white p-4 shadow">
                <h2 className="mb-3 mt-0 text-sm font-semibold uppercase text-gray-600">
                    {i18n.t('Dimensions')}
                </h2>
                <Button icon={<IconClock16 />} onClick={() => setShowPeriods(true)}>
                    {periodCount
                        ? i18n.t('Period ({{count}})', { count: periodCount })
                        : i18n.t('Period')}
                </Button>
            </aside>
            <main className="min-w-0 flex-grow rounded bg-white p-4 shadow">{renderReport()}</main>
            {showPeriods && (
                <PeriodModal
                    bulletinMode
                    onClose={() => setShowPeriods(false)}
                    onUpdate={run}
                    updating={analytics.isFetching}
                />
            )}
        </div>
    )
}
