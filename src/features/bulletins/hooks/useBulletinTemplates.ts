import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNotify } from '@/shared/hooks'
import { templateService } from '../services/bulletinService'
import type { BulletinTemplate, BulletinTemplateEntry } from '../types/bulletin.types'
import { bulletinKeys } from './queryKeys'

const byLastUpdate = (a: BulletinTemplateEntry, b: BulletinTemplateEntry) =>
    (b.value.updatedAt ?? 0) - (a.value.updatedAt ?? 0)

/** All bulletin templates, most recently updated first. */
export const useBulletinTemplates = () => {
    const engine = useDataEngine()
    return useQuery({
        queryKey: bulletinKeys.list(),
        queryFn: async ({ signal }) =>
            (await templateService.list(engine, signal)).sort(byLastUpdate),
    })
}

/** One template; idle without an id. */
export const useBulletinTemplate = (id: string | undefined) => {
    const engine = useDataEngine()
    return useQuery({
        queryKey: bulletinKeys.detail(id ?? ''),
        queryFn: id ? ({ signal }) => templateService.get(engine, id, signal) : skipToken,
    })
}

interface SaveInput {
    /** Existing key when updating. */
    key?: string
    template: BulletinTemplate
}

export const useSaveBulletinTemplate = () => {
    const engine = useDataEngine()
    const queryClient = useQueryClient()
    const notify = useNotify()
    return useMutation({
        mutationFn: async ({ key, template }: SaveInput) => {
            if (key) await templateService.update(engine, key, template)
            else await templateService.create(engine, template.id, template)
            return { key: key ?? template.id, template }
        },
        onSuccess: ({ key, template }) => {
            notify.success(i18n.t('Bulletin saved'))
            queryClient.setQueryData(bulletinKeys.detail(key), template)
            return queryClient.invalidateQueries({ queryKey: bulletinKeys.list() })
        },
        onError: () => notify.error(i18n.t('Could not save the bulletin. Please try again.')),
    })
}

export const useDeleteBulletinTemplate = () => {
    const engine = useDataEngine()
    const queryClient = useQueryClient()
    const notify = useNotify()
    return useMutation({
        mutationFn: (key: string) => templateService.remove(engine, key),
        onSuccess: () => {
            notify.success(i18n.t('Bulletin deleted'))
            return queryClient.invalidateQueries({ queryKey: bulletinKeys.all })
        },
        onError: () => notify.error(i18n.t('Could not delete the bulletin. Please try again.')),
    })
}
