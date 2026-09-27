import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNotify } from '@/shared/hooks'
import { generateUid } from '@/shared/utils/uid'
import { dataSourceService } from '../services/dataSourceService'
import type { DataSource } from '../types/dataSource.types'
import { dataSourceKeys } from './queryKeys'

interface SaveDataSourceInput {
    /** Existing dataStore key when editing; omitted to create a new entry. */
    key?: string
    value: DataSource
}

export const useSaveDataSource = () => {
    const engine = useDataEngine()
    const queryClient = useQueryClient()
    const notify = useNotify()
    return useMutation({
        mutationFn: ({ key, value }: SaveDataSourceInput) =>
            key
                ? dataSourceService.update(engine, key, value)
                : dataSourceService.create(engine, generateUid(), value),
        onSuccess: () => {
            notify.success(i18n.t('Data source saved'))
            return queryClient.invalidateQueries({ queryKey: dataSourceKeys.all })
        },
        onError: () => notify.error(i18n.t('Could not save the data source. Please try again.')),
    })
}
