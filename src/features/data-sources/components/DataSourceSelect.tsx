import i18n from '@dhis2/d2-i18n'
import { SingleSelectField, SingleSelectOption } from '@dhis2/ui'
import { useApplicationTitle } from '@/features/system'
import { CURRENT_INSTANCE_ID } from '../constants'
import { useDataSources } from '../hooks/useDataSources'
import type { DataSource } from '../types/dataSource.types'

type PickedDataSource = Pick<DataSource, 'instanceName' | 'isCurrentInstance'> & Partial<DataSource>

interface DataSourceSelectProps {
    /** Saved data source key, or `CURRENT_INSTANCE_ID`. */
    value: string
    onChange: (id: string, dataSource: PickedDataSource) => void
}

/** Picks the instance a builder reads from: this one or a saved external data source. */
export const DataSourceSelect = ({ value, onChange }: DataSourceSelectProps) => {
    const applicationTitle = useApplicationTitle()
    const { data: sources = [], isLoading } = useDataSources()

    const handleChange = ({ selected }: { selected: string }) => {
        if (selected === CURRENT_INSTANCE_ID) {
            onChange(selected, { isCurrentInstance: true, instanceName: applicationTitle })
            return
        }
        const source = sources.find((entry) => entry.key === selected)?.value
        if (source) onChange(selected, source)
    }

    // The select only accepts a value it has an option for.
    const known = value === CURRENT_INSTANCE_ID || sources.some((entry) => entry.key === value)

    return (
        <SingleSelectField
            label={i18n.t('Data source')}
            loading={isLoading}
            selected={known ? value : CURRENT_INSTANCE_ID}
            onChange={handleChange}
            dense
        >
            <SingleSelectOption value={CURRENT_INSTANCE_ID} label={applicationTitle} />
            {sources.map((entry) => (
                <SingleSelectOption
                    key={entry.key}
                    value={entry.key}
                    label={entry.value.instanceName}
                />
            ))}
        </SingleSelectField>
    )
}
