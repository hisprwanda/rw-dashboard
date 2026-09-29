import { useParams } from 'react-router-dom'
import { MapBuilder } from '@/features/maps'

/** `/map/:id?/:mapName?`: build a new map or edit a saved one (the name is cosmetic). */
export default function MapBuilderPage() {
    const { id } = useParams<{ id?: string }>()
    return <MapBuilder mapId={id} />
}
