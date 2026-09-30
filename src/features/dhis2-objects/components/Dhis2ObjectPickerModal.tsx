import i18n from '@dhis2/d2-i18n'
import {
    Button,
    ButtonStrip,
    InputField,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
    Tab,
    TabBar,
} from '@dhis2/ui'
import { useState } from 'react'
import {
    CURRENT_INSTANCE_ID,
    DataSourceSelect,
    useDataSourceInstance,
} from '@/features/data-sources'
import { ErrorState, LoadingState } from '@/shared/components'
import { useDebouncedValue } from '@/shared/hooks'
import { useDhis2ObjectSearch } from '../hooks/useDhis2Objects'
import type { Dhis2ObjectSummary, Dhis2ObjectType } from '../types/dhis2Object.types'
import { summaryTypeLabel } from '../utils/labels'

interface Dhis2ObjectPickerModalProps {
    /** Whether a favorite of a data source is already on the dashboard. */
    isAdded: (dataSourceId: string, summary: Dhis2ObjectSummary) => boolean
    onAdd: (dataSourceId: string, summary: Dhis2ObjectSummary) => void
    onClose: () => void
}

/**
 * Finds visualizations and maps made in DHIS2 (on this instance or an external data
 * source) and adds them to a dashboard as live links.
 */
export const Dhis2ObjectPickerModal = ({
    isAdded,
    onAdd,
    onClose,
}: Dhis2ObjectPickerModalProps) => {
    const [dataSourceId, setDataSourceId] = useState(CURRENT_INSTANCE_ID)
    const [objectType, setObjectType] = useState<Dhis2ObjectType>('visualization')
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const query = useDebouncedValue(search)
    const source = useDataSourceInstance(dataSourceId)
    const results = useDhis2ObjectSearch(source.instance, objectType, query, page)

    const changeType = (next: Dhis2ObjectType) => {
        setObjectType(next)
        setPage(1)
    }
    const data = results.data

    return (
        <Modal large position="middle" onClose={onClose}>
            <ModalTitle>{i18n.t('Add from DHIS2')}</ModalTitle>
            <ModalContent>
                <div className="flex flex-col gap-3">
                    <p className="m-0 text-sm text-gray-600">
                        {i18n.t(
                            'Visualizations and maps made in the Data Visualizer and Maps apps. They stay linked, so changes made in DHIS2 show on the dashboard.'
                        )}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <DataSourceSelect
                            value={dataSourceId}
                            onChange={(id) => {
                                setDataSourceId(id)
                                setPage(1)
                            }}
                        />
                        <InputField
                            dense
                            label={i18n.t('Search')}
                            placeholder={i18n.t('Name contains')}
                            value={search}
                            onChange={({ value }) => {
                                setSearch(value ?? '')
                                setPage(1)
                            }}
                        />
                    </div>
                    <TabBar>
                        <Tab
                            selected={objectType === 'visualization'}
                            onClick={() => changeType('visualization')}
                        >
                            {i18n.t('Visualizations')}
                        </Tab>
                        <Tab selected={objectType === 'map'} onClick={() => changeType('map')}>
                            {i18n.t('Maps')}
                        </Tab>
                    </TabBar>
                    <div className="min-h-[320px]">
                        {results.error ? (
                            <ErrorState
                                error={results.error}
                                onRetry={() => void results.refetch()}
                            />
                        ) : !data ? (
                            <LoadingState />
                        ) : data.items.length === 0 ? (
                            <p className="m-0 py-8 text-center text-sm text-gray-600">
                                {i18n.t('Nothing found.')}
                            </p>
                        ) : (
                            <ul className="m-0 flex list-none flex-col divide-y divide-gray-100 p-0">
                                {data.items.map((summary) => {
                                    const added = isAdded(dataSourceId, summary)
                                    return (
                                        <li
                                            key={summary.id}
                                            className="flex items-center justify-between gap-3 py-2"
                                        >
                                            <div className="min-w-0">
                                                <p className="m-0 truncate text-sm font-medium">
                                                    {summary.name}
                                                </p>
                                                <p className="m-0 text-xs text-gray-600">
                                                    {summaryTypeLabel(summary)}
                                                </p>
                                            </div>
                                            <Button
                                                small
                                                disabled={added}
                                                onClick={() => onAdd(dataSourceId, summary)}
                                            >
                                                {added ? i18n.t('Added') : i18n.t('Add')}
                                            </Button>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </div>
                    {data && data.pageCount > 1 && (
                        <div className="flex items-center justify-end gap-2 text-sm">
                            <Button small disabled={page <= 1} onClick={() => setPage(page - 1)}>
                                {i18n.t('Previous')}
                            </Button>
                            <span>
                                {i18n.t('Page {{page}} of {{pages}}', {
                                    page: data.page,
                                    pages: data.pageCount,
                                })}
                            </span>
                            <Button
                                small
                                disabled={page >= data.pageCount}
                                onClick={() => setPage(page + 1)}
                            >
                                {i18n.t('Next')}
                            </Button>
                        </div>
                    )}
                </div>
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button onClick={onClose}>{i18n.t('Close')}</Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
