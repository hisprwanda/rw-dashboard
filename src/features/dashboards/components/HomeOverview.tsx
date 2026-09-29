import i18n from '@dhis2/d2-i18n'
import { Tab, TabBar } from '@dhis2/ui'
import { useState } from 'react'
import { ErrorState, LoadingState } from '@/shared/components'
import { useDashboardGroups } from '../hooks/useDashboardGroups'
import { DashboardCard } from './DashboardCard'
import { DashboardsTable } from './DashboardsTable'

/** Home page: pinned (official) dashboards, then my / shared dashboards. */
export const HomeOverview = () => {
    const { mine, shared, pinned, query } = useDashboardGroups()
    const [scope, setScope] = useState<'mine' | 'shared'>('mine')

    if (query.isLoading) return <LoadingState />
    if (query.error) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />

    return (
        <section className="mx-auto w-full max-w-7xl px-6 py-6">
            <h2 className="m-0 mb-4 text-lg font-semibold text-gray-800">
                {i18n.t('Pinned dashboards')}
            </h2>
            {pinned.length ? (
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {pinned.map((entry) => (
                        <DashboardCard key={entry.key} entry={entry} />
                    ))}
                </div>
            ) : (
                <p className="text-sm text-gray-500">
                    {i18n.t('Official dashboards shared with you will appear here.')}
                </p>
            )}
            <div className="mt-8">
                <TabBar>
                    <Tab selected={scope === 'mine'} onClick={() => setScope('mine')}>
                        {i18n.t('My dashboards')}
                    </Tab>
                    <Tab selected={scope === 'shared'} onClick={() => setScope('shared')}>
                        {i18n.t('Shared with me')}
                    </Tab>
                </TabBar>
                <div className="pt-4">
                    <DashboardsTable rows={scope === 'mine' ? mine : shared} scope={scope} />
                </div>
            </div>
        </section>
    )
}
