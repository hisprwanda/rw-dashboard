import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNotify } from '@/shared/hooks'
import { issueService } from '../services/bulletinService'
import type { BulletinIssue } from '../types/bulletin.types'
import { bulletinKeys } from './queryKeys'

/** The saved issue of a period (`null` when none exists yet); idle without a period. */
export const useBulletinIssue = (templateId: string | undefined, periodId: string | undefined) => {
    const engine = useDataEngine()
    return useQuery({
        queryKey: bulletinKeys.issue(templateId ?? '', periodId ?? ''),
        queryFn:
            templateId && periodId
                ? ({ signal }) => issueService.get(engine, templateId, periodId, signal)
                : skipToken,
    })
}

export const useSaveBulletinIssue = () => {
    const engine = useDataEngine()
    const queryClient = useQueryClient()
    const notify = useNotify()
    return useMutation({
        mutationFn: async (issue: BulletinIssue) => {
            await issueService.save(engine, issue)
            return issue
        },
        onSuccess: (issue) => {
            queryClient.setQueryData(bulletinKeys.issue(issue.templateId, issue.periodId), issue)
            notify.success(
                issue.status === 'published' ? i18n.t('Bulletin published') : i18n.t('Draft saved')
            )
        },
        onError: () => notify.error(i18n.t('Could not save the bulletin. Please try again.')),
    })
}
