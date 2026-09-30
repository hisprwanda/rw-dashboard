import { useParams } from 'react-router-dom'
import { VisualizerBuilder } from '@/features/visualizers'

/** `/visualizers/:id?`: build a new visualization or edit a saved one. */
export default function VisualizerBuilderPage() {
    const { id } = useParams<{ id?: string }>()
    return <VisualizerBuilder visualId={id} />
}
