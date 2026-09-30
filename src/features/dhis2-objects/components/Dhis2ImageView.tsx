import { useConfig } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { NoticeBox } from '@dhis2/ui'
import { isNotFound, type InstanceConnection } from '@/shared/api'
import { LoadingState } from '@/shared/components'
import { useDhis2ObjectImage } from '../hooks/useDhis2Objects'
import type { Dhis2ObjectType } from '../types/dhis2Object.types'
import { openInDhis2Url } from '../utils/pluginUrl'
import { Dhis2ObjectError } from './Dhis2ObjectError'

interface Dhis2ImageViewProps {
    instance: InstanceConnection
    objectType: Dhis2ObjectType
    objectId: string
    name: string
}

/** The image DHIS2 renders on the server, for favorites this app cannot draw itself. */
export const Dhis2ImageView = ({ instance, objectType, objectId, name }: Dhis2ImageViewProps) => {
    const { baseUrl } = useConfig()
    const image = useDhis2ObjectImage(instance, objectType, objectId)
    if (image.error && isNotFound(image.error)) return <Dhis2ObjectError error={image.error} />
    if (image.error) {
        // The server cannot draw every item (e.g. maps with event layers).
        const instanceUrl = instance.isCurrentInstance ? baseUrl : instance.url
        return (
            <div className="p-2">
                <NoticeBox title={i18n.t('Shown only in DHIS2')}>
                    <p className="m-0">
                        {i18n.t('This item uses features that can only be drawn by DHIS2 itself.')}
                    </p>
                    {instanceUrl && (
                        <a
                            href={openInDhis2Url(instanceUrl, objectType, objectId)}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {i18n.t('Open in DHIS2')}
                        </a>
                    )}
                </NoticeBox>
            </div>
        )
    }
    if (!image.url) return <LoadingState />
    return <img src={image.url} alt={name} className="h-full w-full object-contain" />
}
