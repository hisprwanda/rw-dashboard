import { useParams } from 'react-router-dom'
import { BulletinTemplateEditor } from '@/features/bulletins'

/** `/bulletins/new` and `/bulletins/:id/edit`: design a bulletin. */
export default function BulletinEditorPage() {
    const { id } = useParams<{ id?: string }>()
    return <BulletinTemplateEditor key={id ?? 'new'} templateId={id} />
}
