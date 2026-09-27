import { dataStoreService } from '@/shared/api'
import { env } from '@/shared/constants/env'
import type { DataSource } from '../types/dataSource.types'

export const dataSourceService = dataStoreService<DataSource>(env.dataSourcesStore)
