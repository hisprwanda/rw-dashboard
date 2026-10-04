import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNotify } from '@/shared/hooks'
import { musicService } from '../services/musicService'
import type { MusicTrack } from '../types/music.types'
import { musicKeys } from './queryKeys'

export const useDeleteTrack = () => {
    const engine = useDataEngine()
    const queryClient = useQueryClient()
    const notify = useNotify()
    return useMutation({
        mutationFn: (track: MusicTrack) => musicService.remove(engine, track),
        onSuccess: () => {
            notify.success(i18n.t('Track deleted'))
            return queryClient.invalidateQueries({ queryKey: musicKeys.all })
        },
        onError: () => notify.error(i18n.t('Could not delete the track. Please try again.')),
    })
}
