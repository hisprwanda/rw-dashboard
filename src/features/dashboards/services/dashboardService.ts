import { dataStoreService } from '@/shared/api'
import { env } from '@/shared/constants/env'
import type { SavedDashboard } from '../types/dashboard.types'

export const dashboardService = dataStoreService<SavedDashboard>(env.dashboardStore)
