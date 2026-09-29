import i18n from '@dhis2/d2-i18n'
import { Button, IconAdd24, SegmentedControl, Tab, TabBar } from '@dhis2/ui'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { paths } from '@/app/router/paths'
import { ErrorState, LoadingState, PageHeader } from '@/shared/components'
import { useDashboardGroups } from '../hooks/useDashboardGroups'
import { DashboardGrid } from './DashboardGrid'
import { DashboardsTable } from './DashboardsTable'

type Scope = 'mine' | 'shared'
type View = 'grid' | 'list'

/** Dashboards page: mine vs. shared with me, as cards or a table. */
export const DashboardsManagement = () => {
    const navigate = useNavigate()
    const { mine, shared, userId, query } = useDashboardGroups()
    const [scope, setScope] = useState<Scope>('mine')
    const [view, setView] = useState<View>('grid')
    const entries = scope === 'mine' ? mine : shared
    const emptyMessage =
        scope === 'mine'
            ? i18n.t('You have not created any dashboard yet.')
            : i18n.t('No dashboard is shared with you.')

    return (
        <div className="mx-auto w-full max-w-7xl">
            <PageHeader
                title={i18n.t('Dashboards')}
                actions={
                    <Button
                        primary
                        icon={<IconAdd24 />}
                        onClick={() => navigate(paths.dashboard())}
                    >
                        {i18n.t('New dashboard')}
                    </Button>
                }
            />
            <div className="flex items-center justify-between px-6">
                <TabBar>
                    <Tab selected={scope === 'mine'} onClick={() => setScope('mine')}>
                        {i18n.t('My dashboards')}
                    </Tab>
                    <Tab selected={scope === 'shared'} onClick={() => setScope('shared')}>
                        {i18n.t('Shared with me')}
                    </Tab>
                </TabBar>
                <SegmentedControl
                    selected={view}
                    onChange={({ value }) => setView(value === 'list' ? 'list' : 'grid')}
                    options={[
                        { label: i18n.t('Cards'), value: 'grid' },
                        { label: i18n.t('List'), value: 'list' },
                    ]}
                />
            </div>
            <div className="p-6">
                {view === 'list' ? (
                    <DashboardsTable
                        rows={entries}
                        scope={scope}
                        loading={query.isLoading}
                        error={query.error}
                        onRetry={() => void query.refetch()}
                    />
                ) : query.isLoading ? (
                    <LoadingState />
                ) : query.error ? (
                    <ErrorState error={query.error} onRetry={() => void query.refetch()} />
                ) : (
                    <DashboardGrid entries={entries} userId={userId} emptyMessage={emptyMessage} />
                )}
            </div>
        </div>
    )
}
