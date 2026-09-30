import { useParams } from 'react-router-dom'
import { BulletinIssueView } from '@/features/bulletins'

/** `/bulletins/:id/:periodId?`: one period of a bulletin. */
export default function BulletinIssuePage() {
    const { id = '', periodId } = useParams<{ id: string; periodId?: string }>()
    return <BulletinIssueView templateId={id} periodId={periodId} />
}
