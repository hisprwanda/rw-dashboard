import i18n from '@dhis2/d2-i18n'
import { useDataSourceInstance } from '@/features/data-sources'
import type { InstanceConnection } from '@/shared/api'
import { ErrorState, LoadingState } from '@/shared/components'
import { usePluginUrl } from '../hooks/useDhis2Objects'
import type { Dhis2ObjectType } from '../types/dhis2Object.types'
import { Dhis2NativeMap } from './Dhis2NativeMap'
import { Dhis2NativeVisualization } from './Dhis2NativeVisualization'
import { Dhis2PluginView } from './Dhis2PluginView'

interface Dhis2ObjectViewProps {
    objectType: Dhis2ObjectType
    objectId: string
    /** Name saved with the item (image alt text and fallbacks). */
    name: string
    /** `CURRENT_INSTANCE_ID` or the key of a saved external data source. */
    dataSourceId: string
}

type NativeProps = Omit<Dhis2ObjectViewProps, 'dataSourceId'> & {
    instance: InstanceConnection
    dataSourceId: string
}

const NativeView = ({ objectType, instance, objectId, name, dataSourceId }: NativeProps) =>
    objectType === 'map' ? (
        <Dhis2NativeMap
            instance={instance}
            dataSourceId={dataSourceId}
            objectId={objectId}
            name={name}
        />
    ) : (
        <Dhis2NativeVisualization instance={instance} objectId={objectId} name={name} />
    )

const CurrentInstanceView = (props: NativeProps) => {
    const pluginSource = usePluginUrl(props.objectType)
    if (pluginSource === undefined) return <LoadingState />
    if (pluginSource === null) return <NativeView {...props} />
    return (
        <Dhis2PluginView
            objectType={props.objectType}
            objectId={props.objectId}
            name={props.name}
            dataSourceId={props.dataSourceId}
            pluginSource={pluginSource}
        />
    )
}

/**
 * A DHIS2 visualization or map, live (read on every view, so edits made in DHIS2 show
 * up). On the current instance the official plugin draws it; on external instances
 * (API token, no browser session) this app draws it, or shows DHIS2's image.
 */
export const Dhis2ObjectView = ({ dataSourceId, ...props }: Dhis2ObjectViewProps) => {
    const source = useDataSourceInstance(dataSourceId)
    if (source.notFound) {
        return <ErrorState title={i18n.t('Data source not available')} />
    }
    if (source.isLoading || !source.instance) return <LoadingState />
    return source.instance.isCurrentInstance ? (
        <CurrentInstanceView {...props} instance={source.instance} dataSourceId={dataSourceId} />
    ) : (
        <NativeView {...props} instance={source.instance} dataSourceId={dataSourceId} />
    )
}
