import { LoadingState } from '@/shared/components'
import type { InstanceConnection } from '@/shared/api'
import { useDhis2ObjectImage } from '../hooks/useDhis2Objects'
import type { Dhis2ObjectType } from '../types/dhis2Object.types'
import { Dhis2ObjectError } from './Dhis2ObjectError'

interface Dhis2ImageViewProps {
    instance: InstanceConnection
    objectType: Dhis2ObjectType
    objectId: string
    name: string
}

/** The image DHIS2 renders on the server, for favorites this app cannot draw itself. */
export const Dhis2ImageView = ({ instance, objectType, objectId, name }: Dhis2ImageViewProps) => {
    const image = useDhis2ObjectImage(instance, objectType, objectId)
    if (image.error) return <Dhis2ObjectError error={image.error} />
    if (!image.url) return <LoadingState />
    return <img src={image.url} alt={name} className="h-full w-full object-contain" />
}
