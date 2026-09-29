import i18n from '@dhis2/d2-i18n'
import { useMutation } from '@tanstack/react-query'
import { useNotify } from '@/shared/hooks'
import { exportDashboardToPptx } from '../utils/capture'

/** Exports the on-screen dashboard to PowerPoint (one slide per item). */
export const useExportPptx = () => {
    const notify = useNotify()
    return useMutation({
        mutationFn: exportDashboardToPptx,
        onSuccess: () => notify.success(i18n.t('PowerPoint file downloaded')),
        onError: () => notify.error(i18n.t('Exporting to PowerPoint failed')),
    })
}
