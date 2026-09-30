import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SharingModal, type SharingValue } from '@/shared/components'
import { useNotify } from '@/shared/hooks'
import { useBulletinTemplate } from '../hooks/useBulletinTemplates'
import { bulletinKeys } from '../hooks/queryKeys'
import { templateService } from '../services/bulletinService'

interface BulletinSharingModalProps {
    templateKey: string
    name: string
    onClose: () => void
}

/** Sharing of one bulletin (applied to the latest stored version). */
export const BulletinSharingModal = ({ templateKey, name, onClose }: BulletinSharingModalProps) => {
    const engine = useDataEngine()
    const queryClient = useQueryClient()
    const notify = useNotify()
    const template = useBulletinTemplate(templateKey)
    const update = useMutation({
        mutationFn: async (change: (current: SharingValue) => SharingValue) => {
            const current = await templateService.get(engine, templateKey)
            const next = { ...current, ...change(current) }
            await templateService.update(engine, templateKey, next)
            return next
        },
        onSuccess: (next) => {
            queryClient.setQueryData(bulletinKeys.detail(templateKey), next)
            notify.success(i18n.t('Sharing settings saved'))
            return queryClient.invalidateQueries({ queryKey: bulletinKeys.list() })
        },
        onError: () => notify.error(i18n.t('Could not save the sharing settings.')),
    })
    return (
        <SharingModal
            name={name}
            value={template.data}
            loading={template.isLoading}
            error={template.error}
            saving={update.isPending}
            onSave={(change) => update.mutate(change)}
            onClose={onClose}
        />
    )
}
