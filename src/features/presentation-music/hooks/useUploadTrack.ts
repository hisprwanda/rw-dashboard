import { useConfig, useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNotify } from '@/shared/hooks'
import { musicService } from '../services/musicService'
import { musicKeys } from './queryKeys'

export const useUploadTrack = () => {
    const engine = useDataEngine()
    const { baseUrl } = useConfig()
    const queryClient = useQueryClient()
    const notify = useNotify()
    return useMutation({
        mutationFn: (file: File) => musicService.add(engine, baseUrl, file),
        onSuccess: () => {
            notify.success(i18n.t('Track uploaded'))
            return queryClient.invalidateQueries({ queryKey: musicKeys.all })
        },
        onError: () => notify.error(i18n.t('Could not upload the track. Please try again.')),
    })
}
