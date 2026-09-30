import type { DataStoreEntry } from '@/shared/types/dhis2.types'

export type DataSourceType = 'DHIS2' | 'API'

/**
 * An external DHIS2 instance the app can read analytics from, stored in the
 * data-sources dataStore namespace. The current instance is implicit (id "1").
 */
export type DataSource = {
    instanceName: string
    description?: string
    url: string
    /** Personal access token, sent as `Authorization: ApiToken <token>`. */
    token: string
    type: DataSourceType
    isCurrentInstance: boolean
}

export type DataSourceEntry = DataStoreEntry<DataSource>
